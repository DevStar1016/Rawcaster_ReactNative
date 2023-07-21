import {EmitterSubscription, ScrollView, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import MeetingActionsContainer from './MeetingActionsContainer';
import {
  MeetingError,
  Meeting,
  MeetingEvent,
  MeetingEmitter,
} from '../../Native/Bridges/ChimeMeetingBridge';
import MeetingVideoView, {AttendeeDetail} from './MeetingVideoView';
import {WINDOW_WIDTH} from '@gorhom/bottom-sheet';

type DataMessage = {
  topic: string;
  data: any;
  senderAttendeeId: string;
  senderExternalUserId: string;
  timestampMs: number;
  throttled: boolean;
};

type Props = {
  meetingId: string;
  handleEndMeeting: () => void;
  selfAttendeeId: string;
};

type DataProps = {
  attendees: AttendeeDetail[];
  selfVideoEnabled: boolean;
  meetingTitle: string;
  screenShareTile: any;
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

var isMount = true;
const MeetingUI = ({meetingId, handleEndMeeting, selfAttendeeId}: Props) => {
  const [data, setdata] = useState<DataProps>({
    attendees: [],
    selfVideoEnabled: false,
    meetingTitle: '',
    screenShareTile: null,
  });

  const [containerHeight, setcontainerHeight] = useState(0);

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

    onRemoveVideoTileSubscription = MeetingEmitter.addListener(
      MeetingEvent.onRemoveVideoTile,
      tileState => {
        if (tileState.isScreenShare) {
          onRemoveScreenShare();
        } else {
          console.log(tileState, 'ONREMOVE STATE');

          onRemoveVideoTile(
            tileState.tileId,
            tileState.isLocal,
            tileState.attendeeId,
          );
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

  const onJoinAttendee = (attendeeId: string, attendeeName: string) => {
    if (isMount) {
      setdata(pre => {
        let tempAttendeesList = [...pre.attendees];
        if (
          tempAttendeesList.findIndex(
            item => item.attendeeId === attendeeId,
          ) === -1
        ) {
          if (attendeeId === selfAttendeeId) {
            tempAttendeesList = [
              {attendeeId, attendeeName},
              ...tempAttendeesList,
            ];
          } else {
            tempAttendeesList = [
              ...tempAttendeesList,
              {attendeeId, attendeeName},
            ];
          }
        }
        return {
          ...pre,
          attendees: [...tempAttendeesList],
        };
      });
    }
  };

  const onLeaveAttendee = (attendeeId: string) => {
    if (isMount) {
      setdata(pre => ({
        ...pre,
        attendees: pre.attendees.filter(
          attendeeDetail => attendeeDetail.attendeeId !== attendeeId,
        ),
      }));
    }
  };

  const onMuteAttendee = (attendeeId: string | number) => {
    if (isMount) {
      setdata(pre => {
        let tempAttendeesList = [...pre.attendees];
        const ind = tempAttendeesList.findIndex(
          item => item.attendeeId === attendeeId,
        );
        if (ind !== -1) {
          tempAttendeesList[ind] = {...tempAttendeesList[ind], isMuted: true};
        }
        return {
          ...pre,
          attendees: [...tempAttendeesList],
        };
      });
    }
  };

  const onUnMuteAttendee = (attendeeId: string | number) => {
    if (isMount) {
      setdata(pre => {
        let tempAttendeesList = [...pre.attendees];
        const ind = tempAttendeesList.findIndex(
          item => item.attendeeId === attendeeId,
        );
        if (ind !== -1) {
          tempAttendeesList[ind] = {...tempAttendeesList[ind], isMuted: false};
        }
        return {
          ...pre,
          attendees: [...tempAttendeesList],
        };
      });
    }
  };

  const onAddVideoTile = (
    tileId: string | number,
    isLocal: boolean,
    attendeeId: string,
  ) => {
    if (isMount) {
      console.log('ADD VIDEO TILE');
      setdata(pre => {
        let tempAttendeesList = [...pre.attendees];
        const ind = tempAttendeesList.findIndex(
          item => item.attendeeId === attendeeId,
        );
        if (ind !== -1) {
          tempAttendeesList[ind] = {...tempAttendeesList[ind], tileId: tileId};
        }
        return {
          ...pre,
          attendees: [...tempAttendeesList],
          selfVideoEnabled: isLocal ? true : pre.selfVideoEnabled,
        };
      });
    }
  };

  const onRemoveVideoTile = (
    tileId: string | number,
    isLocal: boolean,
    attendeeId: string,
  ) => {
    console.log('REMOVE VIDEO TILE', isLocal, tileId, attendeeId);
    if (isMount) {
      setdata(pre => {
        let tempAttendeesList = [...pre.attendees];
        const ind = tempAttendeesList.findIndex(
          item => item.attendeeId === attendeeId,
        );
        if (ind !== -1) {
          tempAttendeesList[ind] = {
            ...tempAttendeesList[ind],
            tileId: undefined,
          };
        }
        return {
          ...pre,
          attendees: [...tempAttendeesList],
          selfVideoEnabled: isLocal ? false : pre.selfVideoEnabled,
        };
      });
    }
  };

  const onEnableScreenShare = (tileId: string | number, attendeeId: string) => {
    if (isMount) {
      setdata(pre => ({
        ...pre,
        screenShareTile: tileId,
      }));
    }
  };

  const onRemoveScreenShare = () => {
    if (isMount) {
      setdata(pre => ({
        ...pre,
        screenShareTile: null,
      }));
    }
  };

  const onReceiveDataMessage = (dataMessage: DataMessage) => {
    const str = `Received Data message (topic: ${dataMessage.topic}) ${dataMessage.data} from ${dataMessage.senderAttendeeId}:${dataMessage.senderExternalUserId} at ${dataMessage.timestampMs} throttled: ${dataMessage.throttled}`;
    console.log(str);
    Meeting.sendDataMessage(dataMessage.topic, str, 1000);
  };

  const onError = (errorType: string) => {
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
  };

  const getIsMuted = () => {
    const attendeeItem = [...data.attendees].find(
      item => item.attendeeId === selfAttendeeId,
    );
    if (attendeeItem) {
      return attendeeItem.isMuted;
    }
    return false;
  };

  function getVideoItem(item: AttendeeDetail, index: number) {
    const listLength = data.attendees.length;
    const maxHeight = containerHeight - 50;
    const maxWidth = WINDOW_WIDTH - 50;
    if (listLength < 3) {
      return (
        <MeetingVideoView
          style={{height: maxHeight / listLength, width: maxWidth}}
          key={index}
          attendeeDetail={item}
        />
      );
    } else if (data.attendees.length === 3) {
      return (
        <MeetingVideoView
          style={{height: maxHeight / 2, width: maxWidth / (index < 2 ? 2 : 1)}}
          key={index}
          attendeeDetail={item}
        />
      );
    }
    return <MeetingVideoView key={index} attendeeDetail={item} />;
  }

  return (
    <View style={styles.mainContainer}>
      <View
        style={{flex: 1}}
        onLayout={e => {
          if (isMount && containerHeight === 0) {
            setcontainerHeight(e.nativeEvent.layout.height);
          }
        }}>
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={styles.videoTilesContainer}>
          {data.attendees.map((item, index) => {
            return getVideoItem(item, index);
          })}
        </ScrollView>
      </View>

      <MeetingActionsContainer
        isMuted={getIsMuted()}
        isVideoEnabled={data.selfVideoEnabled}
        onChangeVideoStatus={() => {
          Meeting.setCameraOn(!data.selfVideoEnabled);
        }}
        onChangeMicStatus={() => {
          Meeting.setMute(!getIsMuted());
        }}
        onPressMenu={handleEndMeeting}
      />
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
    flexGrow: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 5,
    overflow: 'hidden',
  },
});
