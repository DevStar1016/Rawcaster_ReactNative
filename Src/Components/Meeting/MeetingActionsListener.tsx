import {EmitterSubscription, StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {
  MobileSDKEvent,
  getSDKEventEmitter,
} from '../../Native/Bridges/ChimeMeetingBridge';

type Props = {
  onJoinAttendee: (attendeeId: string | number, attendeeName: string) => void;
  onLeaveAttendee: (attendeeId: string | number) => void;
  onMuteAttendee: (attendeeId: string | number) => void;
  onUnMuteAttendee: (attendeeId: string | number) => void;
  onAddVideoTile: (attendeeId: string | number) => void;
};

type AttendeeJoinResponseProps = {
  attendeeId: number;
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
}: Props) => {
  useEffect(() => {
    /**
     * Attendee Join and Leave handler
     */
    onAttendeesJoinSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnAttendeesJoin,
      ({attendeeId, externalUserId}: AttendeeJoinResponseProps) => {
        const attendeeNameMap: any = {};
        if (!(attendeeId in attendeeNameMap)) {
          // The externalUserId will be a format such as c19587e7#Alice
          attendeeNameMap[attendeeId] = externalUserId.split('#')[1];
        }
        onJoinAttendee(attendeeId, attendeeNameMap[attendeeId]);
      },
    );

    onAttendeesLeaveSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnAttendeesLeave,
      ({attendeeId}) => {
        onLeaveAttendee(attendeeId);
      },
    );

    /**
     * Attendee Mute & Unmute handler
     */
    onAttendeesMuteSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnAttendeesMute,
      attendeeId => {
        onMuteAttendee(attendeeId);
      },
    );

    onAttendeesUnmuteSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnAttendeesUnmute,
      attendeeId => {
        onUnMuteAttendee(attendeeId);
      },
    );

    /**
     * Video tile Add & Remove Handler
     */
    onAddVideoTileSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnAddVideoTile,
      tileState => {
        console.log(tileState, 'STATE TILE');
        if (tileState.isScreenShare) {
          setdata(pre => ({
            ...pre,
            screenShareTile: tileState.tileId,
          }));
        } else {
          setdata(pre => {
            let tempVideoTiles = [...pre.videoTiles];
            if (!tempVideoTiles.includes(tileState.tileId)) {
              if (tileState.isLocal) {
                tempVideoTiles = [tileState.tileId, ...tempVideoTiles];
              } else {
                tempVideoTiles = [...tempVideoTiles, tileState.tileId];
              }
            }
            return {
              ...pre,
              videoTiles: [...tempVideoTiles],
              selfVideoEnabled: tileState.isLocal ? true : pre.selfVideoEnabled,
            };
          });
        }
      },
    );

    onRemoveVideoTileSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnRemoveVideoTile,
      tileState => {
        if (tileState.isScreenShare) {
          setdata(pre => ({
            ...pre,
            screenShareTile: null,
          }));
        } else {
          setdata(pre => ({
            ...pre,
            videoTiles: pre.videoTiles.filter(
              tileIdToCompare => tileIdToCompare != tileState.tileId,
            ),
            selfVideoEnabled: tileState.isLocal ? false : pre.selfVideoEnabled,
          }));
        }
      },
    );
  }, []);

  return false;
};

export default MeetingActionsListener;

const styles = StyleSheet.create({});
