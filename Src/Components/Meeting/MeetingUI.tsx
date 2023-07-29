import {BackHandler, ScrollView, StyleSheet, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import MeetingActionsContainer from './MeetingActionsContainer';
import {MeetingError, Meeting} from '../../Native/Bridges/ChimeMeetingBridge';
import MeetingVideoView, {AttendeeDetail} from './MeetingVideoView';
import {DIMENSIONS} from '../../Utilities/Constants';
import MeetingActionsListener from './MeetingActionsListener';
import CustomBottomSheetModal from '../CustomBottomSheetModal';
import ParticipantsList from './ParticipantsList';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {chimeSocketListen} from '../../Services/ChimeSocket/ChimeSocket';
import {ChimeSocketEvents} from '../../Services/ChimeSocket/ChimeSocketEvents';
import {
  allowToJoinMeeting,
  rejectToJoinMeeting,
} from '../../Services/ChimeSocket/ChimeSocketRequests';
import {useToken} from '../../Utilities/StoreData';
import {attendees} from '../../Services/ApiService';
import Toast from '../Toast';

type DataMessage = {
  topic: string;
  data: any;
  senderAttendeeId: string;
  senderExternalUserId: string;
  timestampMs: number;
  throttled: boolean;
};
type UserData = {
  attendeeId?: string;
  user_id: number;
  user_img: string;
  user_name: string;
  isRequested?: boolean;
};

type RequestedData = {
  meetingId: string;
  userId: number;
  user_img: string;
  user_name: string;
};

type Props = {
  meetingId: string;
  handleEndMeeting: () => void;
  selfAttendeeId: string;
  hostUserId: number;
};

type DataProps = {
  attendees: AttendeeDetail[];
  selfVideoEnabled: boolean;
  meetingTitle: string;
  screenShareTile: any;
};

var isMount = true;
const MeetingUI = ({
  meetingId,
  handleEndMeeting,
  selfAttendeeId,
  hostUserId,
}: Props) => {
  const token = useToken();
  const [isLoadingUsersList, setisLoadingUsersList] = useState(true);

  const [data, setdata] = useState<DataProps>({
    attendees: [],
    selfVideoEnabled: false,
    meetingTitle: '',
    screenShareTile: null,
  });

  const participantsListModalRef = useRef<BottomSheetModal>();

  const [containerHeight, setcontainerHeight] = useState(0);
  const [usersList, setusersList] = useState<UserData[]>([]);

  useEffect(() => {
    const backAction = () => {
      handleCloseParticipantsModal();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    getAttendeesList();
  }, []);

  // Meeting Room Join Request Received here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.joinRequestFromUser,
      (requestData: RequestedData) => {
        handleAddRequestedUser(requestData);
        console.log(requestData, 'ChimeSocketListen  joinRequestFromUser');
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.joinRequestFromUser);
    };
  }, []);

  const getAttendeesList = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('meeting_id', meetingId);
    attendees(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            const tempUsersList: UserData[] = [...res.data.data.users].map(
              item => {
                console.log(item, 'ITEM');

                const attendee = [...res.data.data.Attendees].find(
                  attendeeItem =>
                    parseInt(attendeeItem.ExternalUserId) === item.id,
                );
                return {
                  attendeeId: attendee ? attendee.AttendeeId : undefined,
                  user_id: item.id,
                  user_img: item.image,
                  user_name: item.name,
                };
              },
            );
            setusersList(preList => [...preList, ...tempUsersList]);
          }
          console.log(JSON.stringify(res.data), 'RESPONSE ATTENDEES');
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        console.log(e, 'ERRROR');

        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoadingUsersList(false);
        }
      });
  };

  const handleAddRequestedUser = (requestData: RequestedData) => {
    setusersList(preList => {
      if (
        [...preList].findIndex(item => item.user_id === requestData.userId) ===
        -1
      ) {
        return [
          {
            user_id: requestData.userId,
            user_img: requestData.user_img,
            user_name: requestData.user_name,
            isRequested: true,
          },
          ...preList,
        ];
      }
      return [...preList];
    });
  };

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

  const onMuteAttendee = (attendeeId: string) => {
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

  const handleCloseParticipantsModal = () => {
    participantsListModalRef.current?.close();
  };

  const handleFilterRequestedList = (userId: number) => {
    if (isMount) {
      setusersList(preList =>
        [...preList].filter(item => item.user_id !== userId),
      );
    }
  };

  function getVideoItem(item: AttendeeDetail, index: number) {
    const listLength = data.attendees.length;
    const maxHeight = containerHeight - 50;
    const maxWidth = DIMENSIONS.window.width - 50;

    if (listLength < 3) {
      return (
        <MeetingVideoView
          style={{height: maxHeight / listLength, width: maxWidth}}
          key={index.toString()}
          attendeeDetail={item}
        />
      );
    } else if (data.attendees.length === 3) {
      return (
        <MeetingVideoView
          style={{height: maxHeight / 2, width: maxWidth / (index < 2 ? 2 : 1)}}
          key={index.toString()}
          attendeeDetail={item}
        />
      );
    }
    return <MeetingVideoView key={index.toString()} attendeeDetail={item} />;
  }

  return (
    <View style={styles.mainContainer}>
      <MeetingActionsListener
        onJoinAttendee={onJoinAttendee}
        onLeaveAttendee={onLeaveAttendee}
        onMuteAttendee={onMuteAttendee}
        onUnMuteAttendee={onUnMuteAttendee}
        onAddVideoTile={onAddVideoTile}
        onRemoveVideoTile={onRemoveVideoTile}
        onEnableScreenShare={onEnableScreenShare}
        onRemoveScreenShare={onRemoveScreenShare}
        onReceiveDataMessage={onReceiveDataMessage}
        onError={onError}
      />
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
        participantsRequestCount={
          usersList.filter(item => item.isRequested).length
        }
        onChangeMicStatus={() => {
          Meeting.setMute(!getIsMuted());
        }}
        onPressMenu={handleEndMeeting}
        onPressParticipants={() => {
          participantsListModalRef.current?.present();
        }}
      />
      <CustomBottomSheetModal
        // @ts-ignore
        refValue={participantsListModalRef}
        onCloseModal={handleCloseParticipantsModal}>
        <ParticipantsList
          onClose={handleCloseParticipantsModal}
          hostUserId={hostUserId}
          participantsList={usersList}
          onPressAccept={userId => {
            handleFilterRequestedList(userId);
            allowToJoinMeeting({
              meetingId: meetingId,
              userId,
            });
          }}
          onPressReject={userId => {
            handleFilterRequestedList(userId);
            rejectToJoinMeeting({
              userId,
            });
          }}
        />
      </CustomBottomSheetModal>
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
