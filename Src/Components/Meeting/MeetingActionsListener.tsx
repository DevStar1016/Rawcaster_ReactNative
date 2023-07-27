import {EmitterSubscription, StyleSheet, Text, View} from 'react-native';
import {useEffect} from 'react';
import {
  MeetingEvent,
  MeetingEmitter,
} from '../../Native/Bridges/ChimeMeetingBridge';

export type DataMessage = {
  topic: string;
  data: any;
  senderAttendeeId: string;
  senderExternalUserId: string;
  timestampMs: number;
  throttled: boolean;
};

type Props = {
  onJoinAttendee: (attendeeId: string, attendeeName: string) => void;
  onLeaveAttendee: (attendeeId: string) => void;
  onMuteAttendee: (attendeeId: string) => void;
  onUnMuteAttendee: (attendeeId: string) => void;
  onEnableScreenShare: (tileId: string | number) => void;
  onAddVideoTile: (
    tileId: string | number,
    isLocal: boolean,
    attendeeId: string,
  ) => void;
  onRemoveScreenShare: () => void;
  onRemoveVideoTile: (tileId: string | number, isLocal: boolean) => void;
  onReceiveDataMessage: (data: DataMessage) => void;
  onError: (error: string) => void;
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
  onMuteAttendee,
  onUnMuteAttendee,
  onEnableScreenShare,
  onAddVideoTile,
  onRemoveScreenShare,
  onRemoveVideoTile,
  onReceiveDataMessage,
  onError,
}: Props) => {
  useEffect(() => {
    /**
     * Attendee Join and Leave handler
     */
    onAttendeesJoinSubscription = MeetingEmitter.addListener(
      MeetingEvent.onAttendeesJoin,
      ({attendeeId, externalUserId}: AttendeeJoinResponseProps) => {
        const attendeeNameMap: any = {};
        if (!(attendeeId in attendeeNameMap)) {
          // The externalUserId will be a format such as c19587e7#Alice
          attendeeNameMap[attendeeId] = externalUserId.split('#')[1];
        }
        onJoinAttendee(attendeeId, attendeeNameMap[attendeeId]);
      },
    );

    onAttendeesLeaveSubscription = MeetingEmitter.addListener(
      MeetingEvent.onAttendeesLeave,
      ({attendeeId}) => {
        onLeaveAttendee(attendeeId);
      },
    );

    /**
     * Attendee Mute & Unmute handler
     */
    onAttendeesMuteSubscription = MeetingEmitter.addListener(
      MeetingEvent.onAttendeesMute,
      attendeeId => {
        onMuteAttendee(attendeeId);
      },
    );

    onAttendeesUnmuteSubscription = MeetingEmitter.addListener(
      MeetingEvent.onAttendeesUnmute,
      attendeeId => {
        onUnMuteAttendee(attendeeId);
      },
    );

    /**
     * Video tile Add & Remove Handler
     */
    onAddVideoTileSubscription = MeetingEmitter.addListener(
      MeetingEvent.onAddVideoTile,
      tileState => {
        console.log(tileState, 'STATE TILE');
        if (tileState.isScreenShare) {
          onEnableScreenShare(tileState.tileId);
        } else {
          onAddVideoTile(
            tileState.tileId,
            tileState.isLocal,
            tileState.attendeeId,
          );
        }
      },
    );

    onRemoveVideoTileSubscription = MeetingEmitter.addListener(
      MeetingEvent.onRemoveVideoTile,
      tileState => {
        if (tileState.isScreenShare) {
          onRemoveScreenShare();
        } else {
          onRemoveVideoTile(tileState.tileId, tileState.isLocal);
        }
      },
    );

    /**
     * Data message handler
     */
    onDataMessageReceivedSubscription = MeetingEmitter.addListener(
      MeetingEvent.onDataMessageReceive,
      (dataMessage: DataMessage) => {
        onReceiveDataMessage(dataMessage);
      },
    );

    /**
     * General Error handler
     */
    onErrorSubscription = MeetingEmitter.addListener(
      MeetingEvent.onError,
      errorType => {
        onError(errorType);
      },
    );
  }, []);

  useEffect(() => {
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
  }, []);

  return null;
};

export default MeetingActionsListener;

const styles = StyleSheet.create({});
