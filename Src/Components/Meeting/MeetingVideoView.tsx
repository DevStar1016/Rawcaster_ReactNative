import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import React from 'react';
import {COLORS} from '../../Utilities/Colors';
import ProfileWithBadge from '../ProfileWithBadge';
import {DIMENSIONS} from '../../Utilities/Constants';
import {MeetingVideo} from '../../Native/Components/MeetingVideo';
import StyledText from '../StyledText';
import SVGIcon from '../SVGIcon';
import {getSlicedText} from '../../Utilities/Methods';

export interface AttendeeDetail {
  attendeeId: string;
  attendeeName?: string;
  userId: number;
  isMuted?: boolean;
  isHandRaised?: boolean;
  tileId?: number | string;
}

type Props = {
  attendeeDetail: AttendeeDetail;
  style?: StyleProp<ViewStyle>;
  hostUserId: number;
  selfUserId: number;
  nameCharactersLength?: number;
};

const WINDOW_WIDTH = DIMENSIONS.window.width;
const MeetingVideoView = ({
  attendeeDetail,
  style,
  hostUserId,
  selfUserId,
  nameCharactersLength = 20,
}: Props) => {
  const {tileId, attendeeName, userId, isMuted} = attendeeDetail;

  const getStyle = () => {
    if (style) {
      if (Array.isArray(style)) {
        return [styles.mainContainer, ...style];
      }
      return [styles.mainContainer, style];
    }
    return styles.mainContainer;
  };

  const getIsHost = () => hostUserId === userId;
  const getIsSelf = () => selfUserId === userId;

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
      <View style={styles.userDataContainer}>
        <SVGIcon
          icon={isMuted ? 'mic_off_fill_secondary' : 'mic_fill_secondary'}
          height={18}
          width={18}
          marginRight={5}
        />

        <StyledText style={styles.nameText}>
          {`${getSlicedText(
            attendeeName,
            getIsSelf() ? nameCharactersLength - 3 : nameCharactersLength,
          )} ${getIsSelf() ? '( You )' : ''}`}
        </StyledText>
      </View>
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
  userDataContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    color: COLORS.white,
  },
});
