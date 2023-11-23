export type ChimeEventsType =
  | 'joinSocket'
  | 'createMeetingRoom'
  | 'joinMeetingRoom'
  | 'sendMessageToMeetingRoom'
  | 'meetingRoomMsg'
  | 'sendMessageToSingleUser'
  | 'allowToJoinMeeting'
  | 'rejectToJoinMeeting'
  | 'joinRequest'
  | 'joinRequestFromUser'
  | 'joinRequestAnswer'
  | 'raiseHand'
  | 'inCallEvents'
  | 'userLefted'
  | 'userLeft'
  | 'newUserJoined'
  | 'enableVideo'
  | 'enableVideoAnswer'
  | 'enableAudio'
  | 'enableAudioAnswer'
  | 'enableShareScreen'
  | 'enableShareScreenAnswer'
  | 'renameUser'
  | 'renameUserAnswer'
  | 'kickUser'
  | 'kickUserAnswer'
  | 'endMeeting'
  | 'endMeetingAnswer'
  | 'makeHost'
  | 'makeHostAnswer'
  | 'removeHost'
  | 'removeHostAnswer'
  | 'meetingEndAlert'
  | 'meetingEndAlertAnswer'
  |  'joinEventRoom'
  |  'postReaction'
  |'postReactionAnswer'
  |'allowToSpeak'
  |'allowToSpeakAnswer'



export type ChimeEventsProps = {
  joinSocket: 'joinSocket';
  createMeetingRoom: 'createMeetingRoom';
  joinMeetingRoom: 'joinMeetingRoom';
  sendMessageToMeetingRoom: 'sendMessageToMeetingRoom';
  meetingRoomMsg: 'meetingRoomMsg';
  sendMessageToSingleUser: 'sendMessageToSingleUser';
  allowToJoinMeeting: 'allowToJoinMeeting';
  rejectToJoinMeeting: 'rejectToJoinMeeting';
  joinRequest: 'joinRequest';
  joinRequestFromUser: 'joinRequestFromUser';
  joinRequestAnswer: 'joinRequestAnswer';
  raiseHand: 'raiseHand';
  inCallEvents: 'inCallEvents';
  userLefted: 'userLefted';
  userLeft: 'userLeft';
  meetingEndAlert:'meetingEndAlert';
  meetingEndAlertAnswer:'meetingEndAlertAnswer';
  endMeetingAlertAnswer:'endMeetingAlertAnswer';
  newUserJoined: 'newUserJoined';
  enableVideo: 'enableVideo';
  enableVideoAnswer: 'enableVideoAnswer';
  enableAudio: 'enableAudio';
  enableAudioAnswer: 'enableAudioAnswer';
  enableShareScreen: 'enableShareScreen';
  enableShareScreenAnswer: 'enableShareScreenAnswer';
  renameUser: 'renameUser';
  renameUserAnswer: 'renameUserAnswer';
  kickUser: 'kickUser';
  kickUserAnswer: 'kickUserAnswer';
  endMeeting: 'endMeeting';
  endMeetingAnswer: 'endMeetingAnswer';
  makeHost: 'makeHost';
  makeHostAnswer: 'makeHostAnswer';
  removeHost: 'removeHost';
  removeHostAnswer: 'removeHostAnswer';
  allowToSpeakAnswer: 'allowToSpeakAnswer';
  allowToSpeak: 'allowToSpeak';
  joinEventRoom:'joinEventRoom',
  sendEmojee:'postReaction',
  emojeeAnswer:'postReactionAnswer',


 
};
export type JoinRequestStatusCodes = 'host_not_available';
export type JoinRequestStatusCodeProp = {
  host_not_available: 'host_not_available';
};
export interface UserDataProp {
  userId: number;
  name: string;
  image?: string;
  audio?: boolean;
  video?: boolean;
  kicked?: boolean;
  isHost?: boolean;
  handRaised?: boolean;
  screenShare?: number;
  audioDisabledByHost?: boolean;
  videoDisabledByHost?: boolean;
  isRequested?: boolean;
  isCoHost?:boolean;
  attendeeId:string;
  userRefId:string

}

export type CreateMeetingRoomMessageData = {
  refId: string;
};

export type JoinMeetingRoomMessageData = {
  refId: string;
};

export interface MeetingRoomSendMessageData extends UserDataProp {
  message: string;
  refId: string;
}

export interface SingleUserSendMessageData extends UserDataProp {
  message: string;
  isPrivate: boolean;
  send_to?: UserDataProp;
  from_user_id: number;
}

export interface JoinRequestMessageData {
  refId: string;
  userId: number;
  name: string;
  image?: string;
  userRefId:string;
}
export interface JoinRequestRejectActionProp {
  userId: number;
}
export interface RaiseHandMessageData {
  refId: string;
  status: boolean;
  userId: number;
}

export interface HostProcessProp {
  refId: string;
  hostId: number;
}

export interface UserLeftMessageData {
  refId: string;
  userId: number;
}
export interface SendEmojiData {
  refId: string,
  userId: number,
  emoji: string,
  senderName: string
}

export interface EnableDisableMessageData extends HostProcessProp {
  status: boolean;
  userId?: number;
}

export interface KickUserMessageData extends HostProcessProp {
  userId: number;
}

export interface RenameUserMessageData extends KickUserMessageData {
  name: string;
}

export interface InCallEventsMessageData {
  userId: number;
  audio?: boolean;
  video?: boolean;
}
