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
  joinEventRoom:'joinEventRoom',
  raiseHand: 'raiseHand',
  inCallEvents: 'inCallEvents',
  newUserJoined: 'newUserJoined',
  userLeft: 'userLeft',
  userLefted: 'userLefted',
  meetingEndAlert:'meetingEndAlert',
  meetingEndAlertAnswer:'meetingEndAlertAnswer',
  endMeetingAlertAnswer:'endMeetingAlertAnswer',
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
  makeHost: 'makeHost',
  makeHostAnswer: 'makeHostAnswer',
  removeHost: 'removeHost',
  removeHostAnswer: 'removeHostAnswer',
  sendEmojee:'postReaction',
  emojeeAnswer:'postReactionAnswer'

};

export const JOIN_REQUEST_STATUS_CODE: JoinRequestStatusCodeProp = {
  host_not_available: 'host_not_available',
};
