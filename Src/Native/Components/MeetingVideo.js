/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import PropTypes from 'prop-types';
import React, {createRef} from 'react';
import {requireNativeComponent, findNodeHandle} from 'react-native';
import {Meeting} from '../Bridges/ChimeMeetingBridge';
import {IS_IOS} from '../../Utilities/Constants';

var timer = undefined;
export class MeetingVideo extends React.Component {
  constructor(props) {
    super(props);
    this.videoRef = createRef();
  }
  componentDidMount() {
    // we need to delay the bind video
    // Because "componentDidMount" will be called "immediately after the initial rendering occurs"
    // This is *before* RCTUIManager add this view to register (so that viewForReactTag() can return a view)
    // So we need to dispatch bindVideoView after this function complete
    timer = setTimeout(() => {
      if (this.videoRef.current && !IS_IOS) {
        this.videoRef.current.setNativeProps({
          tileId: this.props.tileId,
        });
      }
      try {
        if (this && findNodeHandle(this)) {
          Meeting.bindVideoView(findNodeHandle(this), this.props.tileId);
        }
      } catch (e) {}
    }, 2000);
  }

  componentWillUnmount() {
    if (timer) {
      clearTimeout(timer);
    }
    Meeting.unbindVideoView(this.props.tileId);
  }

  render() {
    return <RNVideoRenderViewNative ref={this.videoRef} {...this.props} />;
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
