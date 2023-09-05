import {EmitterSubscription} from 'react-native';
import {useEffect} from 'react';
import {
  MeetingEvent,
  MeetingEmitter,
} from '../../Native/Bridges/ChimeMeetingBridge';
import {UserDataProp} from '../../Services/ChimeSocket/ChimeSocketPropTypes';
import {AttendeeDetailProp} from './MeetingVideoView';

export type DataMessage = {
  topic: string;
  data: any;
  senderAttendeeId: string;
  senderExternalUserId: string;
  timestampMs: number;
  throttled: boolean;
};

type Props = {
  onJoinAttendee: (attendeeId: string, externalUserId: number) => void;
  onLeaveAttendee: (attendeeId: string, externalUserId: number) => void;
  onMuteUnMuteAttendee: (attendeeId: string, isMute: boolean) => void;
  onEnableScreenShare: (tileId: number, attendeeId: string) => void;
  onAddVideoTile: (
    tileId: number,
    isLocal: boolean,
    attendeeId: string,
  ) => void;
  onRemoveScreenShare: (attendeeId: string) => void;
  onRemoveVideoTile: (isLocal: boolean, attendeeId: string) => void;
  onReceiveDataMessage: (data: DataMessage) => void;
  onError: (error: string) => void;
  attendeesList: AttendeeDetailProp[];
  usersList: UserDataProp[];
};

type AttendeeJoinResponseProps = {
  attendeeId: string;
  externalUserId: string;
};

var onAttendeesJoinSubscription: EmitterSubscription | undefined = undefined;
var onAttendeesLeaveSubscription: EmitterSubscription | undefined = undefined;
var onAttendeesMuteSubscription: EmitterSubscription | undefined = undefined;
var onAttendeesUnmuteSubscription: EmitterSubscription | undefined = undefined;
var onAddVideoTileSubscription: EmitterSubscription | undefined = undefined;
var onRemoveVideoTileSubscription: EmitterSubscription | undefined = undefined;
var onDataMessageReceivedSubscription: EmitterSubscription | undefined =
  undefined;
var onErrorSubscription: EmitterSubscription | undefined = undefined;

const MeetingActionsListener = ({
  onJoinAttendee,
  onLeaveAttendee,
  onMuteUnMuteAttendee,
  onEnableScreenShare,
  onAddVideoTile,
  onRemoveScreenShare,
  onRemoveVideoTile,
  onReceiveDataMessage,
  onError,
  attendeesList = [],
  usersList = [],
}: Props) => {
  useEffect(() => {
    /**
     * Adds a listener for the "onAttendeesJoin" event emitted by the MeetingEmitter.
     * When the event is triggered, it calls the onJoinAttendee function with the attendeeId
     * and externalUserId as arguments.
     * @param {function} onJoinAttendee - The function to be called when the event is triggered.
     * @returns None
     */
    onAttendeesJoinSubscription = MeetingEmitter.addListener(
      MeetingEvent.onAttendeesJoin,
      ({attendeeId, externalUserId}: AttendeeJoinResponseProps) => {
        onJoinAttendee(attendeeId, parseInt(externalUserId));
      },
    );

    /**
     * Subscribe to the onAttendeesLeave event and execute the onLeaveAttendee function
     * when the event is triggered.
     * @param {function} onLeaveAttendee - The function to be executed when an attendee leaves.
     * @returns None
     */
    onAttendeesLeaveSubscription = MeetingEmitter.addListener(
      MeetingEvent.onAttendeesLeave,
      ({attendeeId, externalUserId}) => {
        onLeaveAttendee(attendeeId, parseInt(externalUserId));
      },
    );

    /**
     * Subscribe to the "onAttendeesMute" event and execute the "onMuteUnMuteAttendee" function
     * when the event is triggered.
     * @param {function} attendeeId - The ID of the attendee who was muted.
     * @returns None
     */
    onAttendeesMuteSubscription = MeetingEmitter.addListener(
      MeetingEvent.onAttendeesMute,
      attendeeId => {
        onMuteUnMuteAttendee(attendeeId, true);
      },
    );

    /**
     * Subscribe to the "onAttendeesUnmute" event and execute the provided callback function
     * when the event is triggered.
     * @param {Function} attendeeId - The callback function to be executed when the event is triggered.
     * @returns None
     */
    onAttendeesUnmuteSubscription = MeetingEmitter.addListener(
      MeetingEvent.onAttendeesUnmute,
      attendeeId => {
        onMuteUnMuteAttendee(attendeeId, false);
      },
    );

    /**
     * Adds a subscription to the MeetingEmitter for the onAddVideoTile event.
     * When the event is triggered, it checks if the tileState represents a screen share
     * or a regular video tile, and calls the appropriate functions accordingly.
     * @param {function} onEnableScreenShare - The function to call when a screen share tile is added.
     * @param {function} onAddVideoTile - The function to call when a regular video tile is added.
     * @returns None
     */
    onAddVideoTileSubscription = MeetingEmitter.addListener(
      MeetingEvent.onAddVideoTile,
      tileState => {
        if (tileState.isScreenShare) {
          onEnableScreenShare(tileState.tileId, tileState.attendeeId);
        } else {
          onAddVideoTile(
            tileState.tileId,
            tileState.isLocal,
            tileState.attendeeId,
          );
        }
      },
    );

    /**
     * Adds a listener for the "onRemoveVideoTile" event emitted by the MeetingEmitter.
     * When the event is triggered, it checks if the tileState represents a screen share
     * and calls the onRemoveScreenShare function with the attendeeId. Otherwise, it calls
     * the onRemoveVideoTile function with the isLocal and attendeeId parameters.
     * @param {Function} onRemoveScreenShare - The function to call when a screen share is removed.
     * @param {Function} onRemoveVideoTile - The function to call when a video tile is removed.
     * @returns None
     */
    onRemoveVideoTileSubscription = MeetingEmitter.addListener(
      MeetingEvent.onRemoveVideoTile,
      tileState => {
        if (tileState.isScreenShare) {
          onRemoveScreenShare(tileState.attendeeId);
        } else {
          onRemoveVideoTile(tileState.isLocal, tileState.attendeeId);
        }
      },
    );

    /**
     * Subscribe to the onDataMessageReceived event and execute the onReceiveDataMessage function
     * when a data message is received.
     * @param {DataMessage} dataMessage - The data message received.
     * @returns None
     */
    onDataMessageReceivedSubscription = MeetingEmitter.addListener(
      MeetingEvent.onDataMessageReceive,
      (dataMessage: DataMessage) => {
        onReceiveDataMessage(dataMessage);
      },
    );

    /**
     * Subscribe to the MeetingEmitter's onError event and execute the onError function
     * when the event is triggered.
     * @param {string} MeetingEvent.onError - The name of the onError event.
     * @param {Function} onError - The function to execute when the onError event is triggered.
     * @returns A subscription object that can be used to unsubscribe from the event.
     */
    onErrorSubscription = MeetingEmitter.addListener(
      MeetingEvent.onError,
      errorType => {
        onError(errorType);
      },
    );

    /**
     * Returns a function that removes all event subscriptions related to attendees in a meeting.
     * @returns None
     */
    return () => {
      if (onAttendeesJoinSubscription) {
        onAttendeesJoinSubscription.remove();
      }
      if (onAttendeesLeaveSubscription) {
        onAttendeesLeaveSubscription.remove();
      }
      if (onAttendeesMuteSubscription) {
        onAttendeesMuteSubscription.remove();
      }
      if (onAttendeesUnmuteSubscription) {
        onAttendeesUnmuteSubscription.remove();
      }
      if (onAddVideoTileSubscription) {
        onAddVideoTileSubscription.remove();
      }
      if (onRemoveVideoTileSubscription) {
        onRemoveVideoTileSubscription.remove();
      }
      if (onDataMessageReceivedSubscription) {
        onDataMessageReceivedSubscription.remove();
      }
      if (onErrorSubscription) {
        onErrorSubscription.remove();
      }
    };
  }, [attendeesList, usersList]);

  return null;
};

export default MeetingActionsListener;
