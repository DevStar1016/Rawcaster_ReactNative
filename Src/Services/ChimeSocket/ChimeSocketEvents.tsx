import {
  ChimeEventsProps,
  JoinRequestStatusCodeProp,
} from './ChimeSocketPropTypes';

export const ChimeSocketEvents: ChimeEventsProps = {
  joinSocket: 'joinSocket',
  createMeetingRoom: 'createMeetingRoom',
  joinMeetingRoom: 'joinMeetingRoom',
  sendMessageToMeetingRoom: 'sendMessageToMeetingRoom',
  meetingRoomMsg: 'meetingRoomMsg',
  sendMessageToSingleUser: 'sendMessageToSingleUser',
  allowToJoinMeeting: 'allowToJoinMeeting',
  rejectToJoinMeeting: 'rejectToJoinMeeting',
  joinRequest: 'joinRequest',
  joinRequestFromUser: 'joinRequestFromUser',
  joinRequestAnswer: 'joinRequestAnswer',
  raiseHand: 'raiseHand',
  inCallEvents: 'inCallEvents',
  newUserJoined: 'newUserJoined',
  userLeft: 'userLeft',
  userLefted: 'userLefted',
  enableAudio: 'enableAudio',
  enableAudioAnswer: 'enableAudioAnswer',
  enableVideo: 'enableVideo',
  enableVideoAnswer: 'enableVideoAnswer',
  enableShareScreen: 'enableShareScreen',
  enableShareScreenAnswer: 'enableShareScreenAnswer',
  kickUser: 'kickUser',
  kickUserAnswer: 'kickUserAnswer',
  renameUser: 'renameUser',
  renameUserAnswer: 'renameUserAnswer',
  endMeeting: 'endMeeting',
  endMeetingAnswer: 'endMeetingAnswer',
};

export const JOIN_REQUEST_STATUS_CODE: JoinRequestStatusCodeProp = {
  host_not_available: 'host_not_available',
};
