import {ChimeEventsProps} from './ChimeSocketPropTypes';

export const ChimeSocketEvents: ChimeEventsProps = {
  joinSocket: 'joinSocket',
  createMeetingRoom: 'createMeetingRoom',
  joinMeetingRoom: 'joinMeetingRoom',
  sendMessageToMeetingRoom: 'sendMessageToMeetingRoom',
  meetingRoomMsg: 'meetingRoomMsg',
  sendMessageToSingleUser: 'sendMessageToSingleUser',
  singleUserMsg: 'singleUserMsg',
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
};
