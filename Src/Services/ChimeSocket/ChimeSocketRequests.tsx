import {sendChimeSocketMessage} from './ChimeSocket';
import {ChimeSocketEvents} from './ChimeSocketEvents';
import {
  CreateMeetingRoomMessageData,
  EnableDisableMessageData,
  HostProcessProp,
  InCallEventsMessageData,
  JoinMeetingRoomMessageData,
  JoinRequestMessageData,
  JoinRequestRejectActionProp,
  KickUserMessageData,
  MeetingRoomSendMessageData,
  RaiseHandMessageData,
  RenameUserMessageData,
  SingleUserSendMessageData,
  UserDataProp,
  UserLeftMessageData,
} from './ChimeSocketPropTypes';

/**
 * Meeting Room Creation Socket Request
 * @param messageData Request Meeting Data
 */
export const createMeetingRoom = (
  messageData: CreateMeetingRoomMessageData,
) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.createMeetingRoom);
};

/**
 * Join Meeting Room Socket Request
 * @param messageData Request Meeting Data
 */
export const joinMeetingRoom = (messageData: JoinMeetingRoomMessageData) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.joinMeetingRoom);
};

/**
 * Meeting Room Chat Socket
 * @param messageData Request Meeting Data
 */
export const sendMessageToMeetingRoom = (
  messageData: MeetingRoomSendMessageData,
) => {
  sendChimeSocketMessage(
    messageData,
    ChimeSocketEvents.sendMessageToMeetingRoom,
  );
};

/**
 * Single User Chat Socket in Meeting Room
 * @param messageData Request Meeting Data
 */
export const sendMessageToSingleUser = (
  messageData: SingleUserSendMessageData,
) => {
  sendChimeSocketMessage(
    messageData,
    ChimeSocketEvents.sendMessageToSingleUser,
  );
};

/**
 * Accept user to Join Meeting Socket
 * @param messageData Request Meeting Data
 */
export const allowToJoinMeeting = (messageData: JoinRequestMessageData) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.allowToJoinMeeting);
};

/**
 * Reject the Join Meeting Request of user Socket
 * @param messageData Request Meeting Data
 */
export const rejectToJoinMeeting = (
  messageData: JoinRequestRejectActionProp,
) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.rejectToJoinMeeting);
};

/**
 * Meeting Join Request Socket
 * @param messageData Request Meeting Data
 */
export const joinRequest = (messageData: JoinRequestMessageData) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.joinRequest);
};

/**
 *
 * @param messageData RasiseHand Message Data
 */
export const raiseHand = (messageData: RaiseHandMessageData) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.raiseHand);
};

/**
 *
 * @param messageData InCallEvents Message Data
 */
export const inCallEvents = (messageData: InCallEventsMessageData) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.inCallEvents);
};

/**
 *
 * @param messageData UserData
 */
export const userLeft = (messageData: UserLeftMessageData) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.userLeft);
};

/**
 *
 * @param messageData EnableDisableMessageData Props
 */
export const enableAudio = (messageData: EnableDisableMessageData) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.enableAudio);
};

/**
 *
 * @param messageData EnableDisableMessageData Props
 */
export const enableVideo = (messageData: EnableDisableMessageData) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.enableVideo);
};

/**
 *
 * @param messageData EnableDisableMessageData Props
 */
export const enableShareScreen = (messageData: EnableDisableMessageData) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.enableShareScreen);
};

/**
 *
 * @param messageData KickUserMessageData Props
 */
export const kickUser = (messageData: KickUserMessageData) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.kickUser);
};

/**
 *
 * @param messageData RenameUserMessageData Props
 */
export const renameUser = (messageData: RenameUserMessageData) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.renameUser);
};

/**
 *
 * @param messageData Prop includes hostId and refId
 */
export const endMeetingEvent = (messageData: HostProcessProp) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.endMeeting);
};
