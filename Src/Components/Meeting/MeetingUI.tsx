import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import ToastMessage from 'react-native-toast-message';
import React, {useEffect, useRef, useState} from 'react';
import MeetingActionsContainer from './MeetingActionsContainer';
import {MeetingError, Meeting} from '../../Native/Bridges/ChimeMeetingBridge';
import MeetingVideoView, {
  AttendeeDetailProp,
  UserVideoItemDetailsProp,
} from './MeetingVideoView';
import {DIMENSIONS, EVENT_TYPE, IS_IOS} from '../../Utilities/Constants';
import MeetingActionsListener from './MeetingActionsListener';
import CustomBottomSheetModal from '../CustomBottomSheetModal';

import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {chimeSocketListen} from '../../Services/ChimeSocket/ChimeSocket';
import {ChimeSocketEvents} from '../../Services/ChimeSocket/ChimeSocketEvents';
import {
  allowToJoinMeeting,
  enableAudio,
  enableShareScreen,
  enableVideo,
  kickUser,
  raiseHand,
  rejectToJoinMeeting,
  renameUser,
  sendMessageToMeetingRoom,
  sendMessageToSingleUser,
  userLeft,
} from '../../Services/ChimeSocket/ChimeSocketRequests';
import {useProfile} from '../../Utilities/StoreData';
import Toast from '../Toast';
import {COLORS} from '../../Utilities/Colors';
import {ToastActionButtonProp} from '../../Utilities/ToastConfig';
import MeetingMoreOptions, {
  GetMeetingOptionsMenuList,
  MEETING_MENU_IDS,
} from './MeetingMoreOptions';
import InCallMessages, {MessageData} from './InCallMessages';
import {
  JoinRequestMessageData,
  UserDataProp,
} from '../../Services/ChimeSocket/ChimeSocketPropTypes';
import ParticipantsList from './ParticipantsList';
import RenameUser from './RenameUser';

export type MeetingSettingProp = {
  id: number;
  title: string;
  ref_id: string;
  chime_meeting_id: string;
  server_id: string;
  type: number;
  description: null | string;
  event_type_id: number;
  event_layout_id: number;
  event_melody_id: number;
  no_of_participants: number;
  duration: string;
  start_date_time: string;
  cover_img: string;
  created_at: string;
  created_by: number;
  last_updated_at: null | string;
  total_cost: null;
  paid_amount: null;
  pending_amount: null;
  payment_status: number;
  event_status: number;
  waiting_room: number;
  join_before_host: number;
  sound_notify: number;
  user_screenshare: number;
  status: number;
  pin_enabled: number;
  pinned_user_id: string | null;
  default_host_audio: number;
  default_host_video: number;
  default_guest_audio: number;
  default_guest_video: number;
};

type DataMessage = {
  topic: string;
  data: any;
  senderAttendeeId: string;
  senderExternalUserId: string;
  timestampMs: number;
  throttled: boolean;
};

interface StatusCodeProp {
  statusCode: number;
}
interface RenameUserDataProp extends StatusCodeProp {
  updatedUser: UserDataProp;
}

interface EnableDisableDataProp extends StatusCodeProp {
  status: boolean;
  updatedUser?: UserDataProp;
  attendeeList?: UserDataProp[];
}

interface KickedUserDataProp extends StatusCodeProp {
  kickedUser: UserDataProp;
}

interface RaiseHandRequestData {
  refId: string;
  userId: number;
  handRaised: boolean;
}

interface RaisHandUserData {
  audio: boolean;
  audioDisabledByHost: boolean;
  handRaised: boolean;
  image: string;
  kicked: boolean;
  name: string;
  screenShare: number;
  userId: number;
  video: boolean;
  videoDisabledByHost: boolean;
}

interface RaiseHandUserDataProp {
  UserData: RaisHandUserData;
}

interface InCallEventProp {
  userId: number;
  audio?: boolean;
  video?: boolean;
}

type CommonVideoTileProps = {
  item: UserVideoItemDetailsProp;
  maxWidth?: number;
  maxHeight?: number;
  nameCharactersLength?: number;
};

type Props = {
  handleEndMeeting: (isHost?: boolean) => void;
  handleExitMeeting: (isKicked?: boolean) => void;
  selfAttendeeId: string;
  eventType: number;
  eventSettings: MeetingSettingProp;
  requestsList: any[];
  membersList: UserDataProp[];
  seteventDetails: (eventData: any) => void;
};

type DataProps = {
  attendees: AttendeeDetailProp[];
  selfVideoEnabled: boolean;
};

var isMount = true;
var initialVideoEnableTimer: any = undefined;
const MeetingUI = ({
  handleEndMeeting,
  handleExitMeeting,
  selfAttendeeId,
  eventType,
  eventSettings,
  requestsList = [],
  membersList = [],
}: Props) => {
  const profile = useProfile();
  const [meetingSetting, setmeetingSetting] = useState({...eventSettings});
  const [isEnableContentPanningGesture, setisEnableContentPanningGesture] =
    useState(false);
  const [messagesList, setmessagesList] = useState<MessageData[]>([]);
  const [data, setdata] = useState<DataProps>({
    attendees: [],
    selfVideoEnabled: false,
  });
  const [fullScreenUserData, setfullScreenUserData] = useState<
    UserVideoItemDetailsProp | undefined
  >(undefined);
  const [emojis, setEmojis] = useState<any[]>([]);
  const participantsListModalRef = useRef<BottomSheetModal>();
  const moreOptionsModalRef = useRef<BottomSheetModal>();
  const userOptionsModalRef = useRef<BottomSheetModal>();
  const inCallMessagesModalRef = useRef<BottomSheetModal>();
  const renameUserModalRef = useRef<BottomSheetModal>();

  const [containerHeight, setcontainerHeight] = useState(0);
  const [selectedUserItem, setselectedUserItem] = useState<
    UserDataProp | UserVideoItemDetailsProp | undefined
  >(undefined);
  const [usersList, setusersList] = useState<UserDataProp[]>([...membersList]);

  const openedModals = useRef({
    participants: false,
    moreOptions: false,
    messages: false,
    renameUser: false,
    userOptions: false,
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
      if (openedModals.current.renameUser) {
        handleCloseRenameUserModal();
      }
      if (openedModals.current.userOptions) {
        handleCloseUserOptionsModal();
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

  // Initial Video, Audio Enable/Disable
  useEffect(() => {
    isMount = true;
    if (getHostUserId() === profile?.user_id) {
      if (meetingSetting?.default_host_audio === 1) {
        Meeting.setMute(false);
      } else {
        Meeting.setMute(true);
      }
      initialVideoEnableTimer = setTimeout(() => {
        if (meetingSetting?.default_host_video === 1) {
          Meeting.setCameraOn(true);
        } else {
          Meeting.setCameraOn(false);
        }
        clearTimeout(initialVideoEnableTimer);
      }, 200);
    } else {
      if (meetingSetting?.default_guest_audio === 1) {
        Meeting.setMute(false);
      } else {
        Meeting.setMute(true);
      }
      initialVideoEnableTimer = setTimeout(() => {
        if (meetingSetting?.default_guest_video === 1) {
          Meeting.setCameraOn(true);
        } else {
          Meeting.setCameraOn(false);
        }
      }, 200);
    }
    // getAttendeesList();
    return () => {
      isMount = false;
      if (initialVideoEnableTimer) clearTimeout(initialVideoEnableTimer);
    };
  }, []);

  // Meeting Room Join Request Received here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.joinRequestFromUser,
      (requestData: JoinRequestMessageData) => {
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
      (participantData: UserDataProp) => {
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
        handleRaiseHand(raiseHandUserData.UserData);
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.raiseHand);
    };
  }, [data.attendees]);

  // Meeting Room Message Received Here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.meetingRoomMsg,
      (messageData: MessageData) => {
        triggerToast(messageData.name, undefined, messageData.message);
        handleAddMessage(messageData);
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.meetingRoomMsg);
    };
  }, [messagesList]);

  // Enable / Disable Audio Received Here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.enableAudioAnswer,
      (messageData: EnableDisableDataProp) => {
        if (messageData.statusCode === 1) {
          let userData: UserDataProp | undefined = undefined;
          if (messageData.updatedUser) {
            userData = {...messageData.updatedUser};
          } else if (
            messageData.attendeeList &&
            messageData.attendeeList.length > 0
          ) {
            userData = [...messageData.attendeeList].find(
              item => item.userId === getSelfUserId(),
            );
          }
          {
            if (userData && userData.userId === getSelfUserId()) {
              if (isMount) {
                setusersList(preUsersList => {
                  let tempPreUsersList = [...preUsersList];
                  const ind = [...tempPreUsersList].findIndex(
                    item => item.userId === userData?.userId,
                  );
                  if (ind !== -1) {
                    tempPreUsersList[ind] = {
                      ...tempPreUsersList[ind],
                      audioDisabledByHost: userData?.audioDisabledByHost,
                    };
                  }

                  return [...tempPreUsersList];
                });
              }
              if (messageData.status) {
                if (getIsSelfMuted()) {
                  triggerToast('Host requests that you unmute your microphone');
                }
              } else {
                Meeting.setMute(true);
              }
            }
          }
        }
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.enableAudioAnswer);
    };
  }, [data.attendees, usersList]);

  // Enable / Disable Video Received Here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.enableVideoAnswer,
      (messageData: EnableDisableDataProp) => {
        if (messageData.statusCode === 1) {
          let userData: UserDataProp | undefined = undefined;
          if (messageData.updatedUser) {
            userData = {...messageData.updatedUser};
          } else if (
            messageData.attendeeList &&
            messageData.attendeeList.length > 0
          ) {
            userData = [...messageData.attendeeList].find(
              item => item.userId === getSelfUserId(),
            );
          }

          if (userData && userData.userId === getSelfUserId()) {
            if (isMount) {
              setusersList(preUsersList => {
                let tempPreUsersList = [...preUsersList];
                const ind = [...tempPreUsersList].findIndex(
                  item => item.userId === userData?.userId,
                );
                if (ind !== -1) {
                  tempPreUsersList[ind] = {
                    ...tempPreUsersList[ind],
                    videoDisabledByHost: userData?.videoDisabledByHost,
                  };
                }

                return [...tempPreUsersList];
              });
            }
            if (messageData.status) {
              triggerToast('Host requests that you enable your camera');
            } else {
              Meeting.setCameraOn(false);
            }
          }
        }
        // triggerToast(messageData.name, undefined, messageData.message);
        // handleAddMessage(messageData);
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.enableVideoAnswer);
    };
  }, []);

  // Enable / Disable Screen Share Received Here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.enableShareScreenAnswer,
      (messageData: EnableDisableDataProp) => {
        if (messageData.statusCode === 1) {
          if (isMount) {
            setmeetingSetting(preSetting => ({
              ...preSetting,
              user_screenshare: messageData.status ? 1 : 0,
            }));
            setusersList(preList =>
              [...preList].map(item => ({
                ...item,
                screenShare: messageData.status ? 1 : 0,
              })),
            );
          }
        }
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.enableShareScreenAnswer);
    };
  }, []);

  // Rename User Received Here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.renameUserAnswer,
      (renameUserData: RenameUserDataProp) => {
        if (renameUserData.statusCode === 1) {
          const userData = {...renameUserData.updatedUser};
          if (getSelfUserId() === userData.userId) {
            triggerToast('Your name is changed to ' + userData.name);
          }
          handleRenameUser(userData.userId, userData.name);
        }
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.renameUserAnswer);
    };
  }, []);

  // Kicked User Received Here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.kickUserAnswer,
      (kickedUserData: KickedUserDataProp) => {
        if (kickedUserData.statusCode === 1) {
          const userData = {...kickedUserData.kickedUser};
          if (getSelfUserId() === userData.userId) {
            const attendeeData = [...data.attendees].find(
              item => item.userId === userData.userId,
            );
            if (attendeeData) {
              handleExitMeeting(true);
            }
          } else {
            handleRemoveUser(userData.userId);
          }
        }
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.kickUserAnswer);
    };
  }, []);

  const getHostUserId = () => meetingSetting?.created_by;
  const getSelfUserId = () => profile?.user_id;

  /**
   * Meeting notifications Toast Message with action buttons - displayed at the bottom
   * @param message toast message about the notification like joined, requested or chat
   * @param normalActionButton this the action button to view the participants list or chat
   * @param description toast message has title and description message act as title. description is optional
   */
  const triggerToast = (
    message: string,
    normalActionButton?: ToastActionButtonProp,
    description?: string,
  ) => {
    if (
      !openedModals.current.participants &&
      !openedModals.current.messages &&
      !openedModals.current.moreOptions &&
      !openedModals.current.renameUser
    ) {
      Toast.normal(message, {
        position: 'bottom',
        visibilityTime: 6000,
        normalActionButton,
        description: description,
      });
    }
  };

  const handleAddRequestedUser = (requestData: JoinRequestMessageData) => {
    if (isMount) {
      triggerToast(`${requestData.name} wants to join this meeting.`, {
        buttonName: 'View',
        onPress: () => {
          handleOpenParticipantsModal();
        },
      });

      setusersList(preList => {
        let tempUsersList = [...preList];
        const ind = [...tempUsersList].findIndex(
          item => item.userId === requestData.userId,
        );
        if (ind === -1) {
          tempUsersList = [
            {
              userId: requestData.userId,
              name: requestData.name,
              image: requestData.image,
              isRequested: true,
            },
            ...tempUsersList,
          ];
        } else {
          tempUsersList[ind] = {
            userId: requestData.userId,
            name: requestData.name,
            image: requestData.image,
            isRequested: true,
          };
        }
        return [...tempUsersList];
      });
    }
  };

  const handleAddJoinedUser = (userData: UserDataProp) => {
    if (
      [...usersList].findIndex(
        (item: UserDataProp) => item.userId === userData.userId,
      ) === -1
    ) {
      triggerToast(`${userData.name} joined.`);
    }

    setusersList(preList => {
      let tempUsersList = [...preList];
      const ind = tempUsersList.findIndex(
        (item: UserDataProp) => item.userId === userData.userId,
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
    raiseHandData: RaisHandUserData | RaiseHandRequestData,
    isSelf: boolean = false,
  ) => {
    if (isMount) {
      if (
        [...data.attendees].findIndex(
          item => item.userId === raiseHandData.userId,
        ) !== -1 &&
        raiseHandData.handRaised &&
        !isSelf
      ) {
        // @ts-ignore
        triggerToast(`${raiseHandData.name} has raised a hand.`, {
          buttonName: 'Show',
          onPress() {
            handleOpenParticipantsModal();
          },
        });
      }
      setusersList(preList => {
        let tempUsersList = [...preList];
        const ind = tempUsersList.findIndex(
          (item: UserDataProp) => item.userId === raiseHandData.userId,
        );
        if (ind !== -1) {
          tempUsersList[ind] = {
            ...tempUsersList[ind],
            handRaised: raiseHandData.handRaised,
          };
        }
        return [...tempUsersList];
      });
    }
  };

  const handleAddMessage = (messageData: MessageData) => {
    if (isMount) {
      setmessagesList(preList => [{...messageData}, ...preList]);
    }
  };

  const handleRenameUser = (userId: number, updatedName: string) => {
    if (isMount) {
      setusersList(preList => {
        let tempUsersList = [...preList];
        let ind = tempUsersList.findIndex(item => item.userId === userId);
        if (ind !== -1) {
          tempUsersList[ind] = {...tempUsersList[ind], name: updatedName};
        }
        return [...tempUsersList];
      });
    }
  };

  const handleRemoveUser = (userId: number) => {
    if (isMount) {
      setusersList(preList =>
        [...preList].filter(item => item.userId !== userId),
      );
      setdata(preData => {
        return {
          ...preData,
          attendees: [...preData.attendees].filter(
            item => item.userId !== userId,
          ),
        };
      });
    }
  };

  /**
   * Handles the event when a user leaves the meeting.
   * @param {string} attendeeId - The ID of the attendee who left the meeting.
   * @param {number} userId - The ID of the user who left the meeting.
   * @param {boolean} [isContentShare=false] - this function called also for screen share off. So, do not remove the user who was shared the screen. That is checked by this prop.
   * @returns None
   */
  const handleUserLefted = (
    attendeeId: string,
    userId: number,
    isContentShare: boolean = false,
  ) => {
    if (isMount) {
      setdata(preData => {
        return {
          ...preData,
          attendees: [...preData.attendees].filter(
            item => item.attendeeId !== attendeeId,
          ),
        };
      });
      if (!isContentShare) {
        let tempUserData: UserDataProp | undefined;
        setusersList(preList => {
          tempUserData = [...preList].find(item => item.userId === userId);
          return [...preList].filter(item => item.userId !== userId);
        });
        if (tempUserData) {
          triggerToast(`${tempUserData.name} has left the meeting`);
        }
      }
    }
  };

  // Chime SDK Events Start

  /**
   * Updates the list of attendees when a new attendee joins the meeting.
   * @param {string} attendeeId - The ID of the new attendee.
   * @param {number} userId - The ID of the user associated with the new attendee.
   * @returns None
   */
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
            tempAttendeesList = [{attendeeId, userId}, ...tempAttendeesList];
          } else {
            tempAttendeesList = [...tempAttendeesList, {attendeeId, userId}];
          }
        }
        return {
          ...pre,
          attendees: [...tempAttendeesList],
        };
      });
    }
  };

  /**
   * Handles the event when an attendee leaves the meeting.
   * @param {string} attendeeId - The ID of the attendee who left.
   * @param {number} userId - The ID of the user who left.
   * @returns None
   */
  const onLeaveAttendee = (attendeeId: string, userId: number) => {
    if (getHostUserId() === userId) {
      handleEndMeeting(false);
    } else {
      handleUserLefted(attendeeId, userId, attendeeId.includes('#content'));
    }
  };

  /**
   * Updates the audio status of an attendee.
   * @param {string} attendeeId - The ID of the attendee.
   * @param {boolean} isMute - Indicates whether the attendee should be muted or unmuted.
   * @returns None
   */
  const onMuteUnMuteAttendee = (attendeeId: string, isMute: boolean) => {
    if (isMount) {
      const attendeeData = [...data.attendees].find(
        item => item.attendeeId === attendeeId,
      );
      if (attendeeData) {
        setusersList(preList => {
          let tempPreList = [...preList];
          const ind = tempPreList.findIndex(
            item => item.userId === attendeeData.userId,
          );
          if (ind !== -1) {
            tempPreList[ind] = {...tempPreList[ind], audio: !isMute};
          }
          return [...tempPreList];
        });
      }
    }
  };

  /**
   * Updates the video tile for a given attendee in the attendee list and users list.
   * @param {number} tileId - The ID of the video tile.
   * @param {boolean} isLocal - Indicates whether the attendee is the local user.
   * @param {string} attendeeId - The ID of the attendee.
   * @returns None
   */
  const onAddVideoTile = (
    tileId: number,
    isLocal: boolean,
    attendeeId: string,
  ) => {
    if (isMount) {
      setdata(pre => {
        let tempAttendeesList = [...pre.attendees];
        let tempUsersList = [...usersList];

        const ind = tempAttendeesList.findIndex(
          item => item.attendeeId === attendeeId,
        );
        if (ind !== -1) {
          tempAttendeesList[ind] = {...tempAttendeesList[ind], tileId: tileId};
          const userIndex = [...tempUsersList].findIndex(
            item => item.userId === tempAttendeesList[ind].userId,
          );
          if (userIndex !== -1) {
            tempUsersList[userIndex] = {
              ...tempUsersList[userIndex],
              video: true,
            };
          }
        }

        setusersList([...tempUsersList]);
        return {
          ...pre,
          attendees: [...tempAttendeesList],
          selfVideoEnabled: isLocal ? true : pre.selfVideoEnabled,
        };
      });
    }
  };

  /**
   * Removes the video tile for a given attendee.
   * @param {boolean} isLocal - Indicates whether the attendee is the local user.
   * @param {string} attendeeId - The ID of the attendee.
   * @returns None
   */
  const onRemoveVideoTile = (isLocal: boolean, attendeeId: string) => {
    if (isMount) {
      setdata(pre => {
        let tempAttendeesList = [...pre.attendees];
        let tempUsersList = [...usersList];

        const ind = tempAttendeesList.findIndex(
          item => item.attendeeId === attendeeId,
        );
        if (ind !== -1) {
          tempAttendeesList[ind] = {
            ...tempAttendeesList[ind],
            tileId: undefined,
          };
          const userIndex = [...tempUsersList].findIndex(
            item => item.userId === tempAttendeesList[ind].userId,
          );
          if (userIndex !== -1) {
            tempUsersList[userIndex] = {
              ...tempUsersList[userIndex],
              video: false,
            };
          }
        }

        setusersList([...tempUsersList]);
        return {
          ...pre,
          attendees: [...tempAttendeesList],
          selfVideoEnabled: isLocal ? false : pre.selfVideoEnabled,
        };
      });
    }
  };

  /**
   * Updates the tileId of an attendee when screen sharing is enabled.
   * @param {number} tileId - The tileId of the attendee's screen share.
   * @param {string} attendeeId - The ID of the attendee.
   * @returns None
   */
  const onEnableScreenShare = (tileId: number, attendeeId: string) => {
    if (isMount) {
      setdata(preData => {
        let tempAttendees = [...data.attendees];
        const ind = [...tempAttendees].findIndex(
          item => item.attendeeId === attendeeId,
        );
        if (ind !== -1) {
          tempAttendees[ind] = {
            ...tempAttendees[ind],
            tileId,
          };
        }
        return {
          ...preData,
          attendees: [...tempAttendees],
        };
      });
    }
    /**
     * Removes the screen share of the attendee with the specified ID.
     * @param {string} attendeeId - The ID of the attendee whose screen share is to be removed.
     * @returns None
     */
    // if (data.selfVideoEnabled) {
    //   Meeting.setCameraOn(false);
    //   Meeting.setCameraOn(true);
    // }
  };

  /**
   * Removes the screen share of the attendee with the specified ID.
   * @param {string} attendeeId - The ID of the attendee whose screen share is to be removed.
   * @returns None
   */
  const onRemoveScreenShare = (attendeeId: string) => {
    if (isMount) {
      if (fullScreenUserData && fullScreenUserData.attendeeId === attendeeId) {
        setfullScreenUserData(undefined);
      }
      setdata(preData => {
        return {
          ...preData,
          attendees: [...data.attendees].filter(
            item => item.attendeeId !== attendeeId,
          ),
        };
      });
    }
  };

  /**
   * Handles the reception of a data message.
   * @param {DataMessage} dataMessage - The received data message object.
   * @returns None
   * This function was not used in our integration
   */
  const onReceiveDataMessage = (dataMessage: DataMessage) => {
    const str = `Received Data message (topic: ${dataMessage.topic}) ${dataMessage.data} from ${dataMessage.senderAttendeeId}:${dataMessage.senderExternalUserId} at ${dataMessage.timestampMs} throttled: ${dataMessage.throttled}`;
    Meeting.sendDataMessage(dataMessage.topic, str, 1000);
  };

  /**
   * Handles different types of errors and logs appropriate messages based on the error type.
   * @param {string} errorType - The type of error that occurred.
   * @returns None
   */
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
  // Chime SDK Events End

  /**
   * Checks if the self attendee is muted.
   * @returns {boolean} - True if the self attendee is muted, false otherwise.
   */
  const getIsSelfMuted = (): boolean => {
    const attendeeData = [...data.attendees].find(
      item => item.attendeeId === selfAttendeeId,
    );
    if (attendeeData) {
      const userData = [...usersList].find(
        item => item.userId === attendeeData.userId,
      );
      if (userData) {
        return !userData.audio;
      }
    }
    return false;
  };

  /**
   * Checks if the self attendee has their hand raised.
   * @returns { boolean | undefined} - True if the self attendee has their hand raised, false otherwise.
   */
  const getIsSelfHandRaised = (): boolean | undefined => {
    const attendeeData = [...data.attendees].find(
      item => item.attendeeId === selfAttendeeId,
    );
    if (attendeeData) {
      const userData = [...usersList].find(
        item => item.userId === attendeeData.userId,
      );
      if (userData) {
        return userData.handRaised;
      }
    }
    return false;
  };

  /**
   * Handles the action of hiding the toast message.
   * @returns None
   */
  const handleHideToast = () => {
    ToastMessage.hide();
  };

  /**
   * Handles the opening of the participants modal.
   * This function hides the toast, sets the 'participants' flag in the 'openedModals' ref to true,
   * and presents the participants list modal.
   * @returns None
   */
  const handleOpenParticipantsModal = () => {
    handleHideToast();
    openedModals.current.participants = true;
    participantsListModalRef.current?.present();
  };

  /**
   * Closes the participants modal and updates the state to reflect that the modal is closed.
   * @returns None
   */
  const handleCloseParticipantsModal = () => {
    openedModals.current.participants = false;
    participantsListModalRef.current?.close();
  };

  /**
   * Handles the opening of the "More Options" modal.
   * This function hides the toast, sets the "moreOptions" flag in the "openedModals" ref to true,
   * and presents the "More Options" modal if it exists.
   * @returns None
   */
  const handleOpenMoreOptionsModal = () => {
    handleHideToast();
    openedModals.current.moreOptions = true;
    moreOptionsModalRef.current?.present();
  };

  /**
   * Closes the "More Options" modal.
   * It updates the state of the "openedModals" ref to indicate that the "More Options" modal is closed.
   * It also calls the "close" method on the "moreOptionsModalRef" ref to close the modal.
   * @returns None
   */
  const handleCloseMoreOptionsModal = () => {
    openedModals.current.moreOptions = false;
    moreOptionsModalRef.current?.close();
  };

  /**
   * Handles the opening of the user options modal.
   * This function hides the toast, sets the `userOptions` flag in the `openedModals` ref to true,
   * and presents the user options modal.
   * @returns None
   */
  const handleOpenUserOptionsModal = () => {
    handleHideToast();
    openedModals.current.userOptions = true;
    userOptionsModalRef.current?.present();
  };

  /**
   * Closes the user options modal.
   * @returns None
   */
  const handleCloseUserOptionsModal = () => {
    openedModals.current.userOptions = false;
    userOptionsModalRef.current?.close();
  };

  /**
   * Handles the action of opening the "In Call Messages" modal.
   * This function performs the following actions:
   * 1. Calls the handleHideToast function to hide any active toasts.
   * 2. Calls the handleCloseUserOptionsModal function to close the user options modal if it is open.
   * 3. Calls the handleCloseParticipantsModal function to close the participants modal if it is open.
   * 4. Sets the "messages" property of the openedModals.current object to true, indicating that the "In Call Messages" modal is open.
   * 5. Calls the present() method on the inCallMessagesModalRef.current object to present the modal.
   * @returns None
   */
  const handleOpenInCallMessagesModal = () => {
    handleHideToast();
    handleCloseUserOptionsModal();
    handleCloseParticipantsModal();
    openedModals.current.messages = true;
    inCallMessagesModalRef.current?.present();
    /**
     * Handles the opening of the "Rename User" modal.
     * This function performs the following actions:
     * 1. Hides the toast message.
     * 2. Closes the user options modal.
     * 3. Closes the participants modal.
     * 4. Sets the "renameUser" flag in the "openedModals" ref to true.
     * 5. Presents the "Rename User" modal.
     * @returns None
     */
  };

  /**
   * Handles the closing of the in-call messages modal.
   * If the modal is currently mounted and a user item is selected, it will clear the selected user item.
   * It will also update the state of the openedModals object to indicate that the messages modal is closed.
   * Finally, it will close the in-call messages modal by calling its close() method.
   * @returns None
   */
  const handleCloseInCallMessagesModal = () => {
    if (isMount && selectedUserItem) {
      setselectedUserItem(undefined);
    }
    openedModals.current.messages = false;
    inCallMessagesModalRef.current?.close();
  };

  /**
   * Handles the opening of the "Rename User" modal.
   * This function performs the following actions:
   * 1. Hides the toast message.
   * 2. Closes the user options modal.
   * 3. Closes the participants modal.
   * 4. Sets the "renameUser" flag in the "openedModals" ref to true.
   * 5. Presents the "Rename User" modal.
   * @returns None
   */
  const handleOpenRenameUserModal = () => {
    handleHideToast();
    handleCloseUserOptionsModal();
    handleCloseParticipantsModal();
    openedModals.current.renameUser = true;
    renameUserModalRef.current?.present();
  };

  /**
   * Handles the closing of the rename user modal.
   * If the modal is currently mounted and a user item is selected, it will clear the selected user item.
   * It will also update the state of the "renameUser" modal in the openedModals ref to false.
   * Finally, it will close the rename user modal by calling the close() method on the renameUserModalRef.
   * @returns None
   */
  const handleCloseRenameUserModal = () => {
    if (isMount && selectedUserItem) {
      setselectedUserItem(undefined);
    }
    openedModals.current.renameUser = false;
    renameUserModalRef.current?.close();
  };

  /**
   * Handles the requested list of users by filtering out the user with the specified userId.
   * @param {number} userId - The ID of the user to be filtered out.
   * @returns None
   * Used for removing the accepted and rejected request from the users list
   */
  const handleFilterRequestedList = (userId: number) => {
    if (isMount) {
      setusersList(preList =>
        [...preList].filter(item => item.userId !== userId),
      );
    }
  };

  /**
   * Displays an alert asking the user if they want to end or exit the meeting.
   * If the user confirms, it will call the appropriate functions based on whether
   * the user is the host or not.
   * @returns None
   */
  const onExitEndMeeting = () => {
    const isHost = getHostUserId() === getSelfUserId();
    Alert.alert(
      `${isHost ? 'End' : 'Exit'} Meeting!`,
      `Are you sure you want to ${isHost ? 'end' : 'exit from'} this meeting?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            if (isHost) {
              handleEndMeeting(true);
            } else {
              userLeft({
                refId: meetingSetting.ref_id,
                userId: getSelfUserId(),
              });
              handleExitMeeting();
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  /**
   * Displays an alert to confirm the removal of a user.
   * @param {number} userId - The ID of the user to be removed.
   * @param {string} name - The name of the user to be removed.
   * @returns None
   */
  const onRemoveUser = (userId: number, name: string) => {
    Alert.alert(
      'Kick User!',
      `Are you sure you want to remove ${name}?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            handleRemoveUser(userId);
            kickUser({
              hostId: getHostUserId(),
              refId: meetingSetting.ref_id,
              userId,
            });
          },
        },
      ],
      {cancelable: false},
    );
  };

  // Reactions Animations functions start
  /**
   * Starts an animation for the given emoji object.
   * @param {any} emojiObj - The emoji object to animate.
   * @returns None
   */
  const startAnimation = (emojiObj: any) => {
    Animated.parallel([
      Animated.timing(emojiObj.position, {
        toValue: {x: emojiObj.position.x._value, y: 100},
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(emojiObj.opacity, {
        toValue: 0,
        duration: 3000,
        easing: Easing.circle,
        useNativeDriver: false,
      }),
    ]).start(() => {
      removeEmoji(emojiObj); // Remove the emoji
    });
  };

  /**
   * Removes the specified emoji object from the list of emojis and stops its animation.
   * @param {any} emojiObj - The emoji object to remove.
   * @returns None
   */
  const removeEmoji = (emojiObj: any) => {
    emojiObj?.position?.stopAnimation();
    setEmojis(prevEmojis => prevEmojis.filter(emoji => emoji !== emojiObj));
  };

  /**
   * Adds an emoji to the list of emojis and starts the animation for the new emoji.
   * @param {string} emoji - The emoji to add.
   * @returns None
   */
  const addEmoji = (emoji: string) => {
    const newEmoji = {
      position: new Animated.ValueXY({x: Math.random() * 300, y: 600}),
      opacity: new Animated.Value(1),
      emoji,
    };

    setEmojis(preEmojis => [...preEmojis, newEmoji]);
    startAnimation(newEmoji);
  };
  // Reactions Animations functions end

  /**
   * Handles the onPress event for the microphone button.
   * @param {number} userId - The ID of the user associated with the microphone button.
   * @param {boolean} requestStatus - The status of the audio request.
   * @returns None
   */
  const onPressMic = (userId: number, requestStatus: boolean) => {
    if (userId === getSelfUserId()) {
      if (getSelfUserId() === getHostUserId()) {
        Meeting.setMute(!getIsSelfMuted());
      } else {
        const userData = [...usersList].find(item => item.userId === userId);

        if (userData) {
          if (userData.audioDisabledByHost) {
            triggerToast('Your audio disabled by host');
          } else {
            Meeting.setMute(!getIsSelfMuted());
          }
        } else {
          triggerToast('Something went wrong');
        }
      }
    } else {
      if (getSelfUserId() === getHostUserId()) {
        enableAudio({
          hostId: getHostUserId(),
          refId: meetingSetting.ref_id,
          status: requestStatus,
          userId: userId,
        });
      }
    }
  };

  /**
   * Handles the onPress event for a video button.
   * @param {number} userId - The ID of the user associated with the video button.
   * @param {boolean} requestStatus - The status of the video request.
   * @returns None
   */
  const onPressVideo = (userId: number, requestStatus: boolean) => {
    if (userId === getSelfUserId()) {
      if (getSelfUserId() === getHostUserId()) {
        Meeting.setCameraOn(!data.selfVideoEnabled);
      } else {
        const userData = [...usersList].find(item => item.userId === userId);
        if (userData) {
          if (userData.videoDisabledByHost) {
            triggerToast('Your video disabled by host');
          } else {
            Meeting.setCameraOn(!data.selfVideoEnabled);
          }
        } else {
          triggerToast('Something went wrong');
        }
      }
    } else {
      if (getSelfUserId() === getHostUserId()) {
        enableVideo({
          hostId: getHostUserId(),
          refId: meetingSetting?.ref_id,
          status: requestStatus,
          userId: userId,
        });
      }
    }
  };

  /**
   * Handles the action of raising or lowering the hand in a meeting.
   * @returns None
   */
  const onPressRaiseHand = () => {
    raiseHand({
      refId: meetingSetting?.ref_id,
      status: !getIsSelfHandRaised(),
      userId: getSelfUserId(),
    });
    handleRaiseHand(
      {
        refId: meetingSetting?.ref_id,
        handRaised: !getIsSelfHandRaised(),
        userId: getSelfUserId(),
        name: profile?.name,
      },
      true,
    );
  };

  /**
   * @returns merged tile and user details list of data.attendees and userslist excluded screenshare tile and requested list
   */
  const getAttendeesUsersTileList = (): (
    | UserVideoItemDetailsProp
    | undefined
  )[] => {
    return [...data.attendees]
      .map((item: AttendeeDetailProp) => {
        const userData: UserDataProp | undefined = [...usersList].find(
          (ele: UserDataProp) => ele.userId === item.userId,
        );
        if (userData) {
          const videoUserData: UserVideoItemDetailsProp = {
            ...item,
            ...userData,
          };
          return {...videoUserData};
        }
      })
      .filter(
        (item: UserVideoItemDetailsProp | undefined) =>
          item && !item.attendeeId.includes('#content'),
      );
  };

  /**
   *
   * @returns  merged list of data.attendees and userslist excluded self user data for private chat
   */
  const getMessageParticipantsList = (): (UserDataProp | undefined)[] => {
    return [...usersList]
      .map((item: UserDataProp) => {
        const attendeeData = [...data.attendees].find(
          ele => ele.userId === item.userId,
        );
        if (attendeeData) {
          return {...item};
        }
      })
      .filter(item => item && item.userId !== getSelfUserId());
  };

  /**
   * Participants List
   * @returns merged list of data.sttendees list and userslist and the userslist containes the join requested list with isRquested status true
   */
  const getParticipantsList = (): (
    | UserVideoItemDetailsProp
    | UserDataProp
    | undefined
  )[] => {
    return [...usersList]
      .map((item: UserDataProp) => {
        const attendeeData = [...data.attendees].find(
          ele => ele.userId === item.userId,
        );
        if (attendeeData) {
          const itemData: UserVideoItemDetailsProp = {
            ...item,
            ...attendeeData,
          };
          return itemData;
        }
        if (item.isRequested) {
          return {...item};
        }
      })
      .filter(
        (item: UserVideoItemDetailsProp | UserDataProp | undefined) => item,
      );
  };

  /**
   * Retrieves the screen sharing attendee from the given data.
   * @returns {UserVideoItemDetailsProp | undefined} - The screen sharing attendee object, or undefined if not found.
   */
  const getScreenShareAttendee = (): UserVideoItemDetailsProp | undefined => {
    const attendeeData = [...data.attendees].find(item =>
      item.attendeeId.includes('#content'),
    );
    if (attendeeData) {
      const userData = [...usersList].find(
        item => item.userId === attendeeData.userId,
      );
      if (userData) {
        return {
          ...attendeeData,
          ...userData,
        };
      }
    }
    return undefined;
  };

  /**
   * Renders a component for displaying a video tile in a meeting.
   * @param {CommonVideoTileProps} props - The props for the component.
   * @returns The rendered component.
   * Common Component for User Tile
   */
  const CommonVideoTileComponent = ({
    item,
    maxHeight,
    maxWidth,
    nameCharactersLength,
  }: CommonVideoTileProps): React.ReactNode | null => {
    let height = maxHeight ?? (DIMENSIONS.window.width - 50) / 2;
    let width = maxWidth ?? (DIMENSIONS.window.width - 50) / 2;
    const isAttendeeFullScreenEnable =
      fullScreenUserData?.attendeeId === item.attendeeId;
    if (isAttendeeFullScreenEnable) {
      height = containerHeight - 50;
      width = DIMENSIONS.window.width - 50;
    }
    if (!IS_IOS && fullScreenUserData && !isAttendeeFullScreenEnable) {
      return null;
    }
    return (
      <MeetingVideoView
        key={item.attendeeId.toString()}
        style={{
          display:
            IS_IOS && fullScreenUserData
              ? isAttendeeFullScreenEnable
                ? 'flex'
                : 'none'
              : 'flex',
          height,
          width,
        }}
        attendeeDetail={item}
        hostUserId={getHostUserId()}
        selfUserId={getSelfUserId()}
        onPressMic={onPressMic}
        isEnableFullScreen={isAttendeeFullScreenEnable}
        onPressVideo={onPressVideo}
        onPressRemoveUser={onRemoveUser}
        onPressFullScreen={() => {
          if (isMount) {
            setfullScreenUserData(preData => {
              if (preData?.attendeeId === item.attendeeId) {
                return undefined;
              }
              return {...item};
            });
          }
        }}
        nameCharactersLength={nameCharactersLength}
        onPressName={() => {
          if (isMount) {
            setselectedUserItem(item);
          }
          handleOpenRenameUserModal();
        }}
      />
    );
  };

  /**
   * Retrieves the screen share tile for the given user video item details.
   * @param {UserVideoItemDetailsProp | undefined} item - The user video item details.
   * @returns {React.ReactNode | null} - The screen share tile component or null if item is undefined.
   */
  function getScreenShareTile(
    item: UserVideoItemDetailsProp | undefined,
  ): React.ReactNode | null {
    const maxWidth = DIMENSIONS.window.width - 50;
    const maxHeight = containerHeight - 50 - maxWidth / 2;
    if (!item) {
      return null;
    }
    return CommonVideoTileComponent({
      item,
      maxWidth,
      maxHeight,
    });
  }

  /**
   * Returns a video item component based on the provided item details and index.
   * @param {UserVideoItemDetailsProp | undefined} item - The details of the video item.
   * @param {number} index - The index of the video item.
   * @param {boolean} [isListHorizontal=false] - Indicates if the video item is part of a horizontal list.
   * @returns {React.Component | null} - The video item component.
   */
  function getVideoItem(
    item: UserVideoItemDetailsProp | undefined,
    index: number,
    isListHorizontal: boolean = false,
  ): React.ReactNode | null {
    const listLength = data.attendees.length;
    const maxHeight = containerHeight - 50;
    const maxWidth = DIMENSIONS.window.width - 50;

    if (!item) {
      return null;
    }
    if (isListHorizontal) {
      return CommonVideoTileComponent({
        item,
        nameCharactersLength: 10,
      });
    }
    if (listLength < 3) {
      return CommonVideoTileComponent({
        item,
        maxHeight: maxHeight / listLength,
        maxWidth,
      });
    } else if (listLength === 3) {
      return CommonVideoTileComponent({
        item,
        maxHeight: maxHeight / 2,
        maxWidth: maxWidth / (index > 0 ? 2 : 1),
        nameCharactersLength: index > 0 ? 15 : 20,
      });
    }
    return CommonVideoTileComponent({
      item,
      nameCharactersLength: 10,
    });
  }

  return (
    <View style={styles.mainContainer}>
      {/* Chime Meeting SDK Listeners */}
      <MeetingActionsListener
        onJoinAttendee={onJoinAttendee}
        onLeaveAttendee={onLeaveAttendee}
        onMuteUnMuteAttendee={onMuteUnMuteAttendee}
        onAddVideoTile={onAddVideoTile}
        onRemoveVideoTile={onRemoveVideoTile}
        onEnableScreenShare={onEnableScreenShare}
        onRemoveScreenShare={onRemoveScreenShare}
        onReceiveDataMessage={onReceiveDataMessage}
        onError={onError}
        attendeesList={data.attendees}
        usersList={usersList}
      />
      <>
        <View
          style={{flex: 1}}
          onLayout={e => {
            if (isMount && containerHeight === 0) {
              setcontainerHeight(e.nativeEvent.layout.height);
            }
          }}>
          {getScreenShareAttendee() ? (
            <View style={styles.screenShareVideosTilesContainer}>
              {getScreenShareTile(getScreenShareAttendee())}
              <View
                style={
                  fullScreenUserData
                    ? {flex: 1}
                    : {
                        height: DIMENSIONS.window.width - 50,
                      }
                }>
                <ScrollView style={{flex: 1}} horizontal>
                  {getAttendeesUsersTileList().map((item, index) => {
                    return getVideoItem(item, index, true);
                  })}
                </ScrollView>
              </View>
            </View>
          ) : (
            <ScrollView
              style={{flex: 1}}
              contentContainerStyle={styles.videoTilesContainer}>
              {getAttendeesUsersTileList().map((item, index) => {
                return getVideoItem(item, index);
              })}
            </ScrollView>
          )}
        </View>

        {/* Bottom Actions Tab */}
        <MeetingActionsContainer
          isMuted={getIsSelfMuted()}
          isHandRaised={getIsSelfHandRaised()}
          isVideoEnabled={data.selfVideoEnabled}
          onChangeVideoStatus={() => {
            onPressVideo(getSelfUserId(), !data.selfVideoEnabled);
          }}
          onPressEnd={() => {
            onExitEndMeeting();
          }}
          eventType={eventType}
          participantsRequestCount={
            getParticipantsList().filter(item => item?.isRequested).length
          }
          onChangeMicStatus={() => {
            onPressMic(getSelfUserId(), !getIsSelfMuted());
          }}
          onPressRaiseHand={onPressRaiseHand}
          onPressMenu={() => {
            handleOpenMoreOptionsModal();
          }}
          onPressParticipants={() => {
            handleOpenParticipantsModal();
          }}
        />
        {/* Reactions ( Flying Emojis ) */}
        {emojis.map((emojiObj, index) => (
          <Animated.Text
            key={index}
            style={{
              transform: emojiObj.position.getTranslateTransform(),
              opacity: emojiObj.opacity,
              fontSize: 24,
              position: 'absolute',
              zIndex: 1,
            }}>
            {emojiObj.emoji}
          </Animated.Text>
        ))}
      </>

      {/* Participants List Modal */}
      <CustomBottomSheetModal
        // @ts-ignore
        refValue={participantsListModalRef}
        onCloseModal={handleCloseParticipantsModal}>
        <ParticipantsList
          onClose={handleCloseParticipantsModal}
          hostUserId={getHostUserId()}
          selfUserId={getSelfUserId()}
          globalSettingsData={{
            participantsAudio: meetingSetting.default_guest_audio === 1,
            participantsVideo: meetingSetting.default_guest_video === 1,
          }}
          meetingRefId={meetingSetting?.ref_id}
          isEnableItemPress={true}
          onPressItem={userItem => {
            if (isMount) {
              setselectedUserItem(userItem);
            }
            const menuList = GetMeetingOptionsMenuList({
              hostUserId: getHostUserId(),
              selfUserId: getSelfUserId(),
              eventType,
              isAllowedScreenShare: meetingSetting.user_screenshare === 1,
              userData: userItem,
              visibleMenuIds: [
                'rename',
                'in_call_message',
                'enable_disable_audio',
                'enable_disable_video',
                'raise_hand',
                'remove_user',
              ],
            });

            if (menuList.length === 1) {
              const menuItem = {...menuList[0]};
              if (menuItem.id === 'in_call_message') {
                handleOpenInCallMessagesModal();
              } else if (menuItem.id === 'rename') {
                handleOpenRenameUserModal();
              } else {
                handleOpenUserOptionsModal();
              }
            } else {
              handleOpenUserOptionsModal();
            }
          }}
          participantsList={getParticipantsList()}
          onPressMic={onPressMic}
          onPressVideo={onPressVideo}
          onPressAccept={(joinRequestData: JoinRequestMessageData) => {
            handleFilterRequestedList(joinRequestData.userId);
            allowToJoinMeeting(joinRequestData);
          }}
          onPressReject={(userId: number) => {
            handleFilterRequestedList(userId);
            rejectToJoinMeeting({
              userId,
            });
          }}
          onPressGlobalMic={requestedStatus => {
            if (getHostUserId() === getSelfUserId()) {
              setmeetingSetting(preData => ({
                ...preData,
                default_guest_audio: requestedStatus ? 1 : 0,
              }));
              enableAudio({
                hostId: getHostUserId(),
                refId: meetingSetting.ref_id,
                status: requestedStatus,
              });
            }
          }}
          onPressGlobalVideo={requestedStatus => {
            if (getHostUserId() === getSelfUserId()) {
              setmeetingSetting(preData => ({
                ...preData,
                default_guest_video: requestedStatus ? 1 : 0,
              }));

              enableVideo({
                hostId: getHostUserId(),
                refId: meetingSetting.ref_id,
                status: requestedStatus,
              });
            }
          }}
        />
      </CustomBottomSheetModal>

      {/* More Options Modal */}
      <CustomBottomSheetModal
        // @ts-ignore
        refValue={moreOptionsModalRef}
        onCloseModal={handleCloseMoreOptionsModal}
        enableContentPanningGesture={eventType === EVENT_TYPE.event}
        heightPercentage="30%">
        <MeetingMoreOptions
          onPress={(buttonId: MEETING_MENU_IDS) => {
            handleCloseMoreOptionsModal();
            if (buttonId === 'in_call_message') {
              handleOpenInCallMessagesModal();
            } else if (buttonId === 'participants') {
              handleOpenParticipantsModal();
            } else if (buttonId === 'screenshare_permission') {
              if (isMount) {
                if (getHostUserId() === getSelfUserId()) {
                  if (isMount) {
                    setmeetingSetting(preSetting => ({
                      ...preSetting,
                      user_screenshare:
                        preSetting.user_screenshare === 1 ? 0 : 1,
                    }));
                  }
                  enableShareScreen({
                    hostId: getHostUserId(),
                    refId: meetingSetting.ref_id,
                    status: meetingSetting.user_screenshare !== 1,
                  });
                }
              }
            } else if (buttonId === 'exit_meeting') {
              handleCloseMoreOptionsModal();
              onExitEndMeeting();
            }
            //  else if (buttonId === 'end_meeting') {
            //   handleCloseMoreOptionsModal();
            //   onExitEndMeeting();
            // }
          }}
          onPressEmoji={emoji => {
            addEmoji(emoji);
          }}
          selfUserId={getSelfUserId()}
          hostUserId={getHostUserId()}
          isAllowedScreenShare={meetingSetting.user_screenshare === 1}
          eventType={eventType}
          visibleMenuIds={[
            'in_call_message',
            'participants',
            'screenshare_permission',
            'exit_meeting',
            // 'end_meeting',
          ]}
        />
      </CustomBottomSheetModal>

      {/* Individual User Options Modal */}
      <CustomBottomSheetModal
        // @ts-ignore
        refValue={userOptionsModalRef}
        onCloseModal={handleCloseUserOptionsModal}
        heightPercentage="30%">
        <MeetingMoreOptions
          onPress={(buttonId: MEETING_MENU_IDS) => {
            handleCloseUserOptionsModal();
            if (buttonId === 'in_call_message') {
              handleOpenInCallMessagesModal();
            } else if (buttonId === 'rename') {
              handleOpenRenameUserModal();
            } else if (buttonId === 'enable_disable_audio') {
              onPressMic(
                selectedUserItem?.userId ?? 0,
                !selectedUserItem?.audio,
              );
            } else if (buttonId === 'enable_disable_video') {
              const isVideoEnabled =
                // @ts-ignore
                (typeof selectedUserItem?.tileId === 'number' ||
                  typeof (
                    // @ts-ignore
                    selectedUserItem?.tileId
                  ) === 'string') &&
                selectedUserItem?.video;
              onPressVideo(selectedUserItem?.userId ?? 0, !isVideoEnabled);
            } else if (buttonId === 'raise_hand') {
              onPressRaiseHand();
            } else if (buttonId === 'remove_user') {
              onRemoveUser(
                selectedUserItem?.userId ?? 0,
                selectedUserItem?.name ?? '',
              );
            }
          }}
          userData={selectedUserItem}
          onClose={handleCloseUserOptionsModal}
          visibleMenuIds={[
            'rename',
            'in_call_message',
            'enable_disable_audio',
            'enable_disable_video',
            'raise_hand',
            'remove_user',
          ]}
          selfUserId={getSelfUserId()}
          hostUserId={getHostUserId()}
          isEnableReactionsWithCondition={false}
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
          eventType={eventType}
          participantsList={getMessageParticipantsList()}
          meetingRefId={meetingSetting?.ref_id}
          selfUserId={getSelfUserId()}
          userData={selectedUserItem}
          hostUserId={getHostUserId()}
          messagesList={messagesList}
          setisEnableContentPanningGesture={setisEnableContentPanningGesture}
          onSendMessage={(msg, userData) => {
            const myUserData: UserDataProp | undefined = [...usersList].find(
              item => item.userId === getSelfUserId(),
            );
            if (myUserData) {
              const sendData: MessageData = {
                ...myUserData,
                refId: meetingSetting?.ref_id,
                message: msg,
                isPrivate: false,
                from_user_id: getSelfUserId(),
              };
              if (userData.userId === -1) {
                handleAddMessage(sendData);
                sendMessageToMeetingRoom(sendData);
              } else {
                handleAddMessage({
                  ...sendData,
                  isPrivate: true,
                  send_to: {...userData},
                });
                sendMessageToSingleUser({
                  ...sendData,
                  isPrivate: true,
                  send_to: {...userData},
                });
              }
            }
          }}
        />
      </CustomBottomSheetModal>

      {/* Rename User Modal */}
      <CustomBottomSheetModal
        // @ts-ignore
        refValue={renameUserModalRef}
        enableContentPanningGesture={true}
        onCloseModal={handleCloseRenameUserModal}
        heightPercentage="30%">
        <RenameUser
          onClose={() => {
            handleCloseRenameUserModal();
          }}
          currentName={selectedUserItem?.name ?? ''}
          onRenameUser={updatedName => {
            if (selectedUserItem) {
              const tempRenameUserItem = {...selectedUserItem};
              if (tempRenameUserItem?.name !== updatedName) {
                renameUser({
                  hostId: getHostUserId(),
                  refId: meetingSetting?.ref_id,
                  name: updatedName,
                  userId: tempRenameUserItem.userId,
                });
                handleRenameUser(tempRenameUserItem.userId, updatedName);
              }
            }

            handleCloseRenameUserModal();
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
  screenShareVideosTilesContainer: {
    flex: 1,
    paddingHorizontal: 5,
    overflow: 'hidden',
    alignItems: 'center',
  },
  loaderText: {
    color: COLORS.white,
  },
});
