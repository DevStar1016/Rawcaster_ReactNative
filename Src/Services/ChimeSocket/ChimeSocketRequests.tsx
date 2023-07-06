import {sendChimeSocketMessage} from './ChimeSocket';
import {ChimeSocketEvents} from './ChimeSocketEvents';
import {
  CreateMeetingRoomMessageData,
  JoinMeetingRequestActionMessageData,
  JoinMeetingRequestMessageData,
  JoinMeetingRoomMessageData,
  MeetingRoomSendMessageData,
  SingleUserSendMessageData,
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
export const allowToJoinMeeting = (
  messageData: JoinMeetingRequestActionMessageData,
) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.allowToJoinMeeting);
};

/**
 * Reject the Join Meeting Request of user Socket
 * @param messageData Request Meeting Data
 */
export const rejectToJoinMeeting = (
  messageData: JoinMeetingRequestActionMessageData,
) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.rejectToJoinMeeting);
};

/**
 * Meeting Join Request Socket
 * @param messageData Request Meeting Data
 */
export const joinRequest = (messageData: JoinMeetingRequestMessageData) => {
  sendChimeSocketMessage(messageData, ChimeSocketEvents.joinRequest);
};
