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
  | 'joinRequestAnswer'
  | 'raiseHand'
  | 'inCallEvents'
  | 'userLefted'
  | 'userLeft'
  | 'newUserJoined';

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
  raiseHand: 'raiseHand';
  inCallEvents: 'inCallEvents';
  userLefted: 'userLefted';
  userLeft: 'userLeft';
  newUserJoined: 'newUserJoined';
};

interface UserDataProp {
  id: number;
  name: string;
  image?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type CreateMeetingRoomMessageData = {
  meetingId: string;
};

export type JoinMeetingRoomMessageData = {
  meetingId: string;
};

export interface MeetingRoomSendMessageData extends UserDataProp {
  message: string;
  meetingId: string;
}

export interface SingleUserSendMessageData extends UserDataProp {
  userId: number;
  message: string;
  isPrivate: boolean;
  send_to?: UserDataProp;
}

export interface JoinMeetingRequestActionMessageData {
  userId: number;
  meetingId: string;
}

export interface JoinMeetingRequestMessageData
  extends JoinMeetingRequestActionMessageData {
  user_name: string;
  user_img: string;
}
export interface RaiseHandMessageData {
  meetingId: string;
  raise_hand: boolean;
  user_id: number;
}

export interface UserLeftMessageData {
  user_id: string;
}

export interface InCallEventsMessageData {
  userId: number;
  audio?: boolean;
  video?: boolean;
}
