export type ChimeEventsType =
  | 'joinSocket'
  | 'createMeetingRoom'
  | 'joinMeetingRoom'
  | 'sendMessageToMeetingRoom'
  | 'meetingRoomMsg'
  | 'sendMessageToSingleUser'
  | 'singleUserMsg'
  | 'allowToJoinMeeting'
  | 'rejectToJoinMeeting'
  | 'joinRequest'
  | 'joinRequestFromUser'
  | 'joinRequestAnswer';

export type ChimeEventsProps = {
  joinSocket: 'joinSocket';
  createMeetingRoom: 'createMeetingRoom';
  joinMeetingRoom: 'joinMeetingRoom';
  sendMessageToMeetingRoom: 'sendMessageToMeetingRoom';
  meetingRoomMsg: 'meetingRoomMsg';
  sendMessageToSingleUser: 'sendMessageToSingleUser';
  singleUserMsg: 'singleUserMsg';
  allowToJoinMeeting: 'allowToJoinMeeting';
  rejectToJoinMeeting: 'rejectToJoinMeeting';
  joinRequest: 'joinRequest';
  joinRequestFromUser: 'joinRequestFromUser';
  joinRequestAnswer: 'joinRequestAnswer';
};

export type CreateMeetingRoomMessageData = {
  meetingId: string;
  hostId: string;
};

export type JoinMeetingRoomMessageData = {
  meetingId: string;
};

export type MeetingRoomSendMessageData = {
  meetingId: string;
  msg: string;
};

export interface SingleUserSendMessageData {
  userId: string;
  msg: string;
}

export interface JoinMeetingRequestActionMessageData
  extends SingleUserSendMessageData {}

export interface JoinMeetingRequestMessageData
  extends JoinMeetingRequestActionMessageData,
    JoinMeetingRoomMessageData {
  user_name: string;
  user_img: string;
}
