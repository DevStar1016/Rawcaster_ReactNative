/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import PropTypes from 'prop-types';
import React from 'react';
import {requireNativeComponent, findNodeHandle} from 'react-native';
import {Meeting} from '../Bridges/ChimeMeetingBridge';

export class MeetingVideo extends React.Component {
  componentDidMount() {
    // we need to delay the bind video
    // Because "componentDidMount" will be called "immediately after the initial rendering occurs"
    // This is *before* RCTUIManager add this view to register (so that viewForReactTag() can return a view)
    // So we need to dispatch bindVideoView after this function complete
    setTimeout(() => {
      Meeting.bindVideoView(findNodeHandle(this), this.props.tileId);
    });
  }

  componentWillUnmount() {
    Meeting.unbindVideoView(this.props.tileId);
  }

  render() {
    return <RNVideoRenderViewNative {...this.props} />;
  }
}

MeetingVideo.propTypes = {
  /**
   * A int value to identifier the Video view, will be used to bind video stream later
   */
  tileId: PropTypes.number,
};

var RNVideoRenderViewNative = requireNativeComponent(
  'RNVideoView',
  MeetingVideo,
);
