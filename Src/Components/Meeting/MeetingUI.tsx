import {EmitterSubscription, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import MeetingActionsContainer from './MeetingActionsContainer';
import {
  MeetingError,
  MobileSDKEvent,
  NativeFunction,
  getSDKEventEmitter,
} from '../../Native/Bridges/ChimeMeetingBridge';

type Props = {
  meetingId: string;
  handleEndMeeting: () => void;
  selfAttendeeId: string;
};

type DataProps = {
  attendees: any[];
  videoTiles: any[];
  mutedAttendee: any[];
  selfVideoEnabled: boolean;
  meetingTitle: string;
  screenShareTile: any;
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

const attendeeNameMap: any = {};
const MeetingUI = ({meetingId, handleEndMeeting, selfAttendeeId}: Props) => {
  const [data, setdata] = useState<DataProps>({
    attendees: [],
    videoTiles: [],
    mutedAttendee: [],
    selfVideoEnabled: false,
    meetingTitle: '',
    screenShareTile: null,
  });

  useEffect(() => {
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

  useEffect(() => {
    /**
     * Data message handler
     */
    onDataMessageReceivedSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnDataMessageReceive,
      dataMessage => {
        const str = `Received Data message (topic: ${dataMessage.topic}) ${dataMessage.data} from ${dataMessage.senderAttendeeId}:${dataMessage.senderExternalUserId} at ${dataMessage.timestampMs} throttled: ${dataMessage.throttled}`;
        console.log(str);
        NativeFunction.sendDataMessage(dataMessage.topic, str, 1000);
      },
    );
  }, []);

  useEffect(() => {
    /**
     * General Error handler
     */
    onErrorSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnError,
      errorType => {
        switch (errorType) {
          case MeetingError.OnMaximumConcurrentVideoReached:
            console.log(
              'Failed to enable video',
              'maximum number of concurrent videos reached!',
            );
            // Alert.alert(
            //   "Failed to enable video",
            //   "maximum number of concurrent videos reached!"
            // );
            break;
          default:
            console.log('Error', errorType);
            break;
        }
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

  return (
    <View style={styles.mainContainer}>
      <View style={styles.videoTilesContainer}></View>

      <MeetingActionsContainer />
    </View>
  );
};

export default MeetingUI;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoTilesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 5,
  },
});
