import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import React from 'react';
import {MeetingVideo} from '../../Native/Components/MeetingVideo';
import {WINDOW_WIDTH} from '@gorhom/bottom-sheet';
import {COLORS} from '../../Utilities/Colors';
import ProfileWithBadge from '../ProfileWithBadge';

export interface AttendeeDetail {
  attendeeId: string;
  attendeeName: string;
  isMuted?: boolean;
  tileId?: number | string;
}

type Props = {
  attendeeDetail: AttendeeDetail;
  style?: StyleProp<ViewStyle>;
};

const MeetingVideoView = ({attendeeDetail, style}: Props) => {
  const {tileId} = attendeeDetail;
  const getStyle = () => {
    if (style) {
      if (Array.isArray(style)) {
        return [styles.mainContainer, ...style];
      }
      return [styles.mainContainer, style];
    }
    return styles.mainContainer;
  };

  return (
    <View style={getStyle()}>
      {typeof tileId === 'number' || typeof tileId === 'string' ? (
        <MeetingVideo key={tileId} style={styles.video} tileId={tileId} />
      ) : (
        <ProfileWithBadge
          profileSize={(WINDOW_WIDTH - 50) / 5}
          padding={0}
          extraMargin={0}
        />
      )}
    </View>
  );
};

export default MeetingVideoView;

const styles = StyleSheet.create({
  mainContainer: {
    height: (WINDOW_WIDTH - 50) / 2,
    width: (WINDOW_WIDTH - 50) / 2,
    overflow: 'hidden',
    margin: 10,
    borderRadius: 10,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    height: '100%',
    width: '100%',
  },
});
