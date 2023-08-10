import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import ToastMessage from 'react-native-toast-message';
import React, {useEffect, useRef, useState} from 'react';
import MeetingActionsContainer from './MeetingActionsContainer';
import {MeetingError, Meeting} from '../../Native/Bridges/ChimeMeetingBridge';
import MeetingVideoView, {AttendeeDetail} from './MeetingVideoView';
import {DIMENSIONS, IS_IOS} from '../../Utilities/Constants';
import MeetingActionsListener from './MeetingActionsListener';
import CustomBottomSheetModal from '../CustomBottomSheetModal';
import ParticipantsList, {ParticipantProp} from './ParticipantsList';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {chimeSocketListen} from '../../Services/ChimeSocket/ChimeSocket';
import {ChimeSocketEvents} from '../../Services/ChimeSocket/ChimeSocketEvents';
import {
  allowToJoinMeeting,
  inCallEvents,
  raiseHand,
  rejectToJoinMeeting,
  sendMessageToMeetingRoom,
  sendMessageToSingleUser,
} from '../../Services/ChimeSocket/ChimeSocketRequests';
import {useProfile, useToken} from '../../Utilities/StoreData';
import {attendees} from '../../Services/ApiService';
import Toast from '../Toast';
import {COLORS} from '../../Utilities/Colors';
import StyledText from '../StyledText';
import {ToastActionButtonProp} from '../../Utilities/ToastConfig';
import MeetingMoreOptions, {MEETING_MENU_IDS} from './MeetingMoreOptions';
import InCallMessages, {MessageData} from './InCallMessages';

type DataMessage = {
  topic: string;
  data: any;
  senderAttendeeId: string;
  senderExternalUserId: string;
  timestampMs: number;
  throttled: boolean;
};

type RequestedData = {
  meetingId: string;
  userId: number;
  user_img: string;
  user_name: string;
};

type LeftedUserDataProp = {
  meetingId: string;
  user_id: number;
  user_name: string;
};

interface RaiseHandUserDataProp {
  meetingId: string;
  raise_hand: boolean;
  user_id: number;
  user_name: string;
}

interface InCallEventProp {
  userId: number;
  audio?: boolean;
  video?: boolean;
}

type Props = {
  meetingId: string;
  handleEndMeeting: () => void;
  selfAttendeeId: string;
  hostUserId: number;
  selfUserId: number;
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
  selfUserId,
}: Props) => {
  const token = useToken();
  const profile = useProfile();
  const [isEnableContentPanningGesture, setisEnableContentPanningGesture] =
    useState(false);
  const [isLoadingUsersList, setisLoadingUsersList] = useState(true);
  const [messagesList, setmessagesList] = useState<MessageData[]>([]);
  const [data, setdata] = useState<DataProps>({
    attendees: [],
    selfVideoEnabled: false,
    meetingTitle: '',
    screenShareTile: null,
  });

  const participantsListModalRef = useRef<BottomSheetModal>();
  const moreOptionsModalRef = useRef<BottomSheetModal>();
  const inCallMessagesModalRef = useRef<BottomSheetModal>();

  const [containerHeight, setcontainerHeight] = useState(0);
  const [usersList, setusersList] = useState<ParticipantProp[]>([]);
  const openedModals = useRef({
    participants: false,
    moreOptions: false,
    messages: false,
  });

  // Back Handler
  useEffect(() => {
    const backAction = () => {
      if (openedModals.current.participants) {
        handleCloseParticipantsModal();
      }
      if (openedModals.current.moreOptions) {
        handleCloseMoreOptionsModal();
      }
      if (openedModals.current.messages) {
        handleCloseInCallMessagesModal();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  // GetAttendees Initial API Call
  useEffect(() => {
    isMount = true;
    getAttendeesList();
    return () => {
      isMount = false;
    };
  }, []);

  // Meeting Room Join Request Received here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.joinRequestFromUser,
      (requestData: RequestedData) => {
        handleAddRequestedUser(requestData);
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.joinRequestFromUser);
    };
  }, []);

  // New User Joined Received Here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.newUserJoined,
      (participantData: ParticipantProp) => {
        handleAddJoinedUser(participantData);
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.newUserJoined);
    };
  }, []);

  // Raise Hand Received Here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.raiseHand,
      (raiseHandUserData: RaiseHandUserDataProp) => {
        handleRaiseHand(raiseHandUserData);
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.raiseHand);
    };
  }, []);

  // In Call Events Received Here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.inCallEvents,
      (inCallEventData: InCallEventProp) => {
        handleInCallEvents(inCallEventData);
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.inCallEvents);
    };
  }, [data.attendees]);

  // User Lefted Received Here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.userLefted,
      (leftedUserData: LeftedUserDataProp) => {
        handleUserLefted(leftedUserData);
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.userLefted);
    };
  }, []);

  // Meeting Room Message Received Here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.meetingRoomMsg,
      (messageData: MessageData) => {
        console.log(messageData, 'MEETING ROOM MESSAGE');
        handleAddMessage(messageData);
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.meetingRoomMsg);
    };
  }, [messagesList]);

  // Single User Message Received Here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.singleUserMsg,
      (messageData: MessageData) => {
        console.log(messageData, 'SINGLE USER MESSAGE');
        handleAddMessage(messageData);
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.singleUserMsg);
    };
  }, [messagesList]);

  const triggerToast = (
    message: string,
    normalActionButton?: ToastActionButtonProp,
  ) => {
    Toast.normal(message, {
      position: 'bottom',
      visibilityTime: 6000,
      normalActionButton,
    });
  };

  const getAttendeesList = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('meeting_id', meetingId);
    console.log(formData, 'ATTENDEES GET FORM DATA');

    attendees(formData)
      .then(res => {
        console.log(JSON.stringify(res.data), 'GET ATTENDEES RESPONSE');

        if (res.data.status === 1) {
          if (isMount) {
            setusersList(preList => {
              let tempUsersList = [...preList];
              res.data.data.users.map((item: ParticipantProp) => {
                const ind = tempUsersList.findIndex(ele => ele.id === item.id);
                if (ind === -1) {
                  tempUsersList = [{...item}, ...tempUsersList];
                } else {
                  tempUsersList[ind] = {...item};
                }
              });
              return [...tempUsersList];
            });
          }
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        console.log(e, 'GET ATTENDEES ERRROR');

        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoadingUsersList(false);
        }
      });
  };

  const handleAddRequestedUser = (requestData: RequestedData) => {
    if (isMount) {
      triggerToast(`${requestData.user_name} wants to join this meeting.`, {
        buttonName: 'View',
        onPress: () => {
          handleOpenParticipantsModal();
        },
      });

      setusersList(preList => {
        let tempUsersList = [...preList];
        const ind = [...tempUsersList].findIndex(
          item => item.id === requestData.userId,
        );
        if (ind === -1) {
          tempUsersList = [
            {
              id: requestData.userId,
              image: requestData.user_img,
              name: requestData.user_name,
              isRequested: true,
            },
            ...tempUsersList,
          ];
        } else {
          tempUsersList[ind] = {
            id: requestData.userId,
            image: requestData.user_img,
            name: requestData.user_name,
            isRequested: true,
          };
        }
        return [...tempUsersList];
      });
    }
  };

  const handleAddJoinedUser = (userData: ParticipantProp) => {
    if (
      [...usersList].findIndex(
        (item: ParticipantProp) => item.id === userData.id,
      ) === -1
    ) {
      triggerToast(`${userData.name} joined.`);
    }

    setusersList(preList => {
      let tempUsersList = [...preList];
      const ind = tempUsersList.findIndex(
        (item: ParticipantProp) => item.id === userData.id,
      );
      if (ind === -1) {
        tempUsersList = [{...userData}, ...tempUsersList];
      } else {
        tempUsersList[ind] = {...userData};
      }
      return [...tempUsersList];
    });
  };

  const handleRaiseHand = (
    raiseHandData: RaiseHandUserDataProp,
    isSelf: boolean = false,
  ) => {
    if (isMount) {
      if (
        [...data.attendees].findIndex(
          item => item.userId === raiseHandData.user_id,
        ) !== -1 &&
        raiseHandData.raise_hand &&
        !isSelf
      ) {
        triggerToast(`${raiseHandData.user_name} has raised a hand.`, {
          buttonName: 'Show',
          onPress() {
            handleOpenParticipantsModal();
          },
        });
      }
      setdata(pre => {
        let tempAttendeesList = [...pre.attendees];
        const ind = tempAttendeesList.findIndex(
          item => item.userId === raiseHandData.user_id,
        );
        if (ind !== -1) {
          tempAttendeesList[ind] = {
            ...tempAttendeesList[ind],
            isHandRaised: raiseHandData.raise_hand,
          };
        }
        return {
          ...pre,
          attendees: [...tempAttendeesList],
        };
      });
    }
  };

  const handleInCallEvents = (inCallEvent: InCallEventProp) => {
    console.log(
      'INCALL EVENTS CALLEDDD',
      inCallEvent,
      data.attendees,
      [...data.attendees].findIndex(item => item.userId === inCallEvent.userId),
    );

    if (isMount) {
      if (
        [...data.attendees].findIndex(
          item => item.userId === inCallEvent.userId,
        ) !== -1
      ) {
        if (typeof inCallEvent.audio === 'boolean') {
          if (inCallEvent.audio) {
            triggerToast('Host wants you to un mute', {
              buttonName: 'Un Mute',
              onPress: () => {
                Meeting.setMute(false);
                handleHideToast();
              },
            });
          } else {
            console.log('IOP');

            Meeting.setMute(true);
          }
        } else if (typeof inCallEvent.video === 'boolean') {
          if (inCallEvent.video) {
            triggerToast('Host wants you to enable camera', {
              buttonName: 'Enable',
              onPress: () => {
                Meeting.setCameraOn(true);
                handleHideToast();
              },
            });
          } else {
            Meeting.setCameraOn(false);
          }
        }
      }
    }
  };

  const handleAddMessage = (messageData: MessageData) => {
    if (isMount) {
      setmessagesList(preList => [{...messageData}, ...preList]);
    }
  };

  const handleUserLefted = (leftedUserData: LeftedUserDataProp) => {
    if (isMount) {
      setdata(preData => {
        return {
          ...preData,
          attendees: [...preData.attendees].filter(
            item => item.userId !== leftedUserData.user_id,
          ),
        };
      });
      setusersList(preList =>
        [...preList].filter(item => item.id !== leftedUserData.user_id),
      );
      triggerToast(`${leftedUserData.user_name} has left the meeting`);
    }
  };

  const onJoinAttendee = (attendeeId: string, userId: number) => {
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
              {attendeeId, attendeeName: '', userId},
              ...tempAttendeesList,
            ];
          } else {
            tempAttendeesList = [
              ...tempAttendeesList,
              {attendeeId, attendeeName: '', userId},
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
    console.log(attendeeId, 'SELFFFFF MUTE');

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

  const getIsSelfMuted = () => {
    const attendeeItem = [...data.attendees].find(
      item => item.attendeeId === selfAttendeeId,
    );
    if (attendeeItem) {
      return attendeeItem.isMuted;
    }
    return false;
  };

  const getIsSelfHandRaised = () => {
    const attendeeItem = [...data.attendees].find(
      item => item.attendeeId === selfAttendeeId,
    );
    if (attendeeItem) {
      return attendeeItem.isHandRaised;
    }
    return false;
  };

  const handleHideToast = () => {
    ToastMessage.hide();
  };

  const handleOpenParticipantsModal = () => {
    handleHideToast();
    openedModals.current.participants = true;
    participantsListModalRef.current?.present();
  };

  const handleCloseParticipantsModal = () => {
    openedModals.current.participants = false;
    participantsListModalRef.current?.close();
  };

  const handleOpenMoreOptionsModal = () => {
    handleHideToast();
    openedModals.current.moreOptions = true;
    moreOptionsModalRef.current?.present();
  };

  const handleCloseMoreOptionsModal = () => {
    openedModals.current.moreOptions = false;
    moreOptionsModalRef.current?.close();
  };

  const handleOpenInCallMessagesModal = () => {
    handleHideToast();
    handleCloseMoreOptionsModal();
    openedModals.current.messages = true;
    inCallMessagesModalRef.current?.present();
  };

  const handleCloseInCallMessagesModal = () => {
    openedModals.current.messages = false;
    inCallMessagesModalRef.current?.close();
  };

  const handleFilterRequestedList = (userId: number) => {
    if (isMount) {
      setusersList(preList => [...preList].filter(item => item.id !== userId));
    }
  };

  const getAttendeesUsersTileList = () => {
    return [...data.attendees]
      .map((item: AttendeeDetail) => {
        const userData = [...usersList].find(ele => ele.id === item.userId);
        if (userData) {
          return {...item, attendeeName: userData.name};
        }
        return {...item, attendeeName: undefined};
      })
      .filter(item => item.attendeeName);
  };

  const getParticipantsList = () => {
    return [...usersList]
      .map((item: ParticipantProp) => {
        const attendeeData = [...data.attendees].find(
          ele => ele.userId === item.id,
        );
        if (attendeeData) {
          return {
            ...item,
            isMuted: attendeeData.isMuted,
            isHandRaised: attendeeData.isHandRaised,
            tileId: attendeeData.tileId,
          };
        }
        if (item.isRequested) {
          return {...item};
        }
      })
      .filter(item => item !== undefined);
  };

  const getMessageParticipantsList = () => {
    return [...usersList]
      .map((item: ParticipantProp) => {
        const attendeeData = [...data.attendees].find(
          ele => ele.userId === item.id,
        );
        if (attendeeData) {
          return {
            id: item.id,
            name: item.name,
            image: item.image,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        }
      })
      .filter(item => item && item.id !== selfUserId);
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
          hostUserId={hostUserId}
          selfUserId={selfUserId}
        />
      );
    } else if (data.attendees.length === 3) {
      return (
        <MeetingVideoView
          style={{height: maxHeight / 2, width: maxWidth / (index < 2 ? 2 : 1)}}
          key={index.toString()}
          attendeeDetail={item}
          hostUserId={hostUserId}
          selfUserId={selfUserId}
          nameCharactersLength={index < 2 ? 20 : 10}
        />
      );
    }
    return (
      <MeetingVideoView
        key={index.toString()}
        attendeeDetail={item}
        hostUserId={hostUserId}
        selfUserId={selfUserId}
        nameCharactersLength={10}
      />
    );
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
      {isLoadingUsersList ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={COLORS.white} size={'large'} />
          <StyledText style={styles.loaderText}>Getting Attendees</StyledText>
        </View>
      ) : (
        <>
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
              {getAttendeesUsersTileList().map((item, index) => {
                return getVideoItem(item, index);
              })}
            </ScrollView>
          </View>

          <MeetingActionsContainer
            isMuted={getIsSelfMuted()}
            isHandRaised={getIsSelfHandRaised()}
            isVideoEnabled={data.selfVideoEnabled}
            isVisibleRaiseHand={selfUserId !== hostUserId}
            onChangeVideoStatus={() => {
              Meeting.setCameraOn(!data.selfVideoEnabled);
            }}
            participantsRequestCount={
              getParticipantsList().filter(item => item?.isRequested).length
            }
            onChangeMicStatus={() => {
              Meeting.setMute(!getIsSelfMuted());
            }}
            onPressRaiseHand={() => {
              const raiseHandData: RaiseHandUserDataProp = {
                meetingId: meetingId,
                raise_hand: !getIsSelfHandRaised(),
                user_id: selfUserId,
                user_name: profile?.name,
              };
              handleRaiseHand(raiseHandData, true);
              raiseHand(raiseHandData);
            }}
            onPressMenu={() => {
              handleOpenMoreOptionsModal();
            }}
            onPressParticipants={() => {
              handleOpenParticipantsModal();
            }}
          />
        </>
      )}
      {/* Participants List Modal */}
      <CustomBottomSheetModal
        // @ts-ignore
        refValue={participantsListModalRef}
        onCloseModal={handleCloseParticipantsModal}>
        <ParticipantsList
          onClose={handleCloseParticipantsModal}
          hostUserId={hostUserId}
          selfUserId={selfUserId}
          isLoading={isLoadingUsersList}
          // @ts-ignore
          participantsList={getParticipantsList()}
          onPressMic={(userId: number, requestStatus: boolean) => {
            console.log(selfUserId, 'SELF USER ID');
            if (userId === selfUserId) {
              Meeting.setMute(!getIsSelfMuted());
            } else {
              if (selfUserId === hostUserId) {
                console.log(
                  {
                    meetingId: meetingId,
                    user_id: userId,
                    audio: requestStatus,
                  },
                  'SEND DATAAA',
                );

                inCallEvents({
                  userId: userId,
                  audio: requestStatus,
                });
              }
            }
          }}
          onPressVideo={(userId: number, requestStatus: boolean) => {
            if (userId === selfUserId) {
              Meeting.setCameraOn(!data.selfVideoEnabled);
            } else {
              if (selfUserId === hostUserId) {
                inCallEvents({
                  userId: userId,
                  video: requestStatus,
                });
              }
            }
          }}
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

      {/* More Options Modal */}
      <CustomBottomSheetModal
        // @ts-ignore
        refValue={moreOptionsModalRef}
        onCloseModal={handleCloseMoreOptionsModal}
        heightPercentage="50%">
        <MeetingMoreOptions
          onPress={(buttonId: MEETING_MENU_IDS) => {
            if (buttonId === 'exit_meeting') {
              handleCloseMoreOptionsModal();
              Alert.alert(
                'Exit Meeting!',
                'Do you want to exit from this meeting?',
                [
                  {
                    text: 'Cancel',
                    onPress: () => {},
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: () => {
                      handleEndMeeting();
                    },
                  },
                ],
                {cancelable: false},
              );
            } else if (buttonId === 'in_call_message') {
              handleOpenInCallMessagesModal();
            }
          }}
        />
      </CustomBottomSheetModal>

      {/* Chat Modal */}
      <CustomBottomSheetModal
        // @ts-ignore
        refValue={inCallMessagesModalRef}
        enableContentPanningGesture={isEnableContentPanningGesture}
        onCloseModal={handleCloseInCallMessagesModal}
        heightPercentage="90%">
        <InCallMessages
          onClose={handleCloseInCallMessagesModal}
          // @ts-ignore
          participantsList={getMessageParticipantsList()}
          selfUserId={selfUserId}
          hostUserId={hostUserId}
          messagesList={messagesList}
          setisEnableContentPanningGesture={setisEnableContentPanningGesture}
          onSendMessage={(msg, userData) => {
            const myUserData = [...usersList].find(
              item => item.id === selfUserId,
            );
            const sendData = {
              id: myUserData?.id ?? selfUserId,
              name: myUserData?.name ?? '',
              image: myUserData?.image,
              createdAt: myUserData?.createdAt,
              updatedAt: myUserData?.updatedAt,
              meetingId: meetingId,
              message: msg,
            };
            if (userData.id === -1) {
              handleAddMessage(sendData);
              sendMessageToMeetingRoom(sendData);
            } else {
              handleAddMessage({
                ...sendData,
                userId: userData.id,
                isPrivate: true,
                send_to: {...userData},
              });
              sendMessageToSingleUser({
                ...sendData,
                userId: userData.id,
                isPrivate: true,
                send_to: {...userData},
              });
            }
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
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  loaderText: {
    color: COLORS.white,
  },
});
