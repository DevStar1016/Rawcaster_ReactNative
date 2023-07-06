/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

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
const _eventEmitter = new NativeEventEmitter(
  NativeModules.ChimeMeetingSDKBridge,
);

export const MobileSDKEvent = {
  OnMeetingStart: 'OnMeetingStart',
  OnMeetingEnd: 'OnMeetingEnd',
  OnAttendeesJoin: 'OnAttendeesJoin',
  OnAttendeesLeave: 'OnAttendeesLeave',
  OnAttendeesMute: 'OnAttendeesMute',
  OnAttendeesUnmute: 'OnAttendeesUnmute',
  OnAddVideoTile: 'OnAddVideoTile',
  OnRemoveVideoTile: 'OnRemoveVideoTile',
  OnDataMessageReceive: 'OnDataMessageReceive',
  OnError: 'OnError',
};

export const MeetingError = {
  OnMaximumConcurrentVideoReached: 'OnMaximumConcurrentVideoReached',
};

export function getSDKEventEmitter() {
  return _eventEmitter;
}

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
export const NativeFunction = {
  startMeeting: NativeModules.ChimeMeetingSDKBridge.startMeeting,
  stopMeeting: NativeModules.ChimeMeetingSDKBridge.stopMeeting,
  setMute: NativeModules.ChimeMeetingSDKBridge.setMute,
  setCameraOn: NativeModules.ChimeMeetingSDKBridge.setCameraOn,
  bindVideoView: NativeModules.ChimeMeetingSDKBridge.bindVideoView,
  unbindVideoView: NativeModules.ChimeMeetingSDKBridge.unbindVideoView,
  sendDataMessage: NativeModules.ChimeMeetingSDKBridge.sendDataMessage,
};
