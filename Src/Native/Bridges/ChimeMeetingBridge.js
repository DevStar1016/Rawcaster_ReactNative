import {NativeModules, NativeEventEmitter} from 'react-native';

/**
 * These are the function that will be called from native side
 * i.e. Native -> React Native
 *
 * NativeEventEmitter.onMeetingStart(meetingName)
 * NativeEventEmitter.onMeetingEnd()
 * NativeEventEmitter.onAttendeesJoin(attendeeInfo)
 * NativeEventEmitter.onAttendeesLeave(attendeeInfo)
 * NativeEventEmitter.onAddVideoTile(tileState)
 * NativeEventEmitter.onRemoveVideoTile(tileState)
 * NativeEventEmitter.onError(errorMessage)
 */
export const MeetingEmitter = new NativeEventEmitter(
  NativeModules.ChimeMeetingSDKBridge,
);

export const MeetingEvent = {
  onStart: 'OnMeetingStart',
  onEnd: 'OnMeetingEnd',
  onAttendeesJoin: 'OnAttendeesJoin',
  onAttendeesLeave: 'OnAttendeesLeave',
  onAttendeesMute: 'OnAttendeesMute',
  onAttendeesUnmute: 'OnAttendeesUnmute',
  onAddVideoTile: 'OnAddVideoTile',
  onRemoveVideoTile: 'OnRemoveVideoTile',
  onDataMessageReceive: 'OnDataMessageReceive',
  onError: 'OnError',
};

export const MeetingError = {
  OnMaximumConcurrentVideoReached: 'OnMaximumConcurrentVideoReached',
};

/**
 * These are functions available for React native to call on native
 * i.e. React Native -> Native
 *
 * NativeModules.ChimeMeetingSDKBridge.startMeeting(meetingId, userName)
 * NativeModules.ChimeMeetingSDKBridge.stopMeeting()
 * NativeModules.ChimeMeetingSDKBridge.setMute(isMute) -> boolean
 * NativeModules.ChimeMeetingSDKBridge.setCameraOn(isOn) -> boolean
 * NativeModules.ChimeMeetingSDKBridge.bindVideoView(reactTagId, tileId)
 * NativeModules.ChimeMeetingSDKBridge.unbindVideoView(reactTagId, tileId)
 */
export const Meeting = {
  start: NativeModules.ChimeMeetingSDKBridge.startMeeting,
  stop: NativeModules.ChimeMeetingSDKBridge.stopMeeting,
  setMute: NativeModules.ChimeMeetingSDKBridge.setMute,
  setCameraOn: NativeModules.ChimeMeetingSDKBridge.setCameraOn,
  bindVideoView: NativeModules.ChimeMeetingSDKBridge.bindVideoView,
  unbindVideoView: NativeModules.ChimeMeetingSDKBridge.unbindVideoView,
  sendDataMessage: NativeModules.ChimeMeetingSDKBridge.sendDataMessage,
  switchCamera: NativeModules.ChimeMeetingSDKBridge.switchCamera,
};
