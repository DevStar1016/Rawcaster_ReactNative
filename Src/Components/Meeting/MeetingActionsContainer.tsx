import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import SVGIcon from '../SVGIcon';
import StyledText from '../StyledText';
import {COLORS} from '../../Utilities/Colors';
import {IconType} from '../../Utilities/Icons';
import {DIMENSIONS} from '../../Utilities/Constants';
import {FONTS} from '../../Utilities/Fonts';

type Props = {
  onChangeVideoStatus: () => void;
  onChangeMicStatus: () => void;
  onPressMenu: () => void;
  onPressParticipants: () => void;
  onPressRaiseHand: () => void;
  isMuted?: boolean;
  isHandRaised?: boolean;
  isVideoEnabled: boolean;
  isVisibleRaiseHand?: boolean;
  participantsRequestCount: number;
};

type ActionButtonProps = {
  text: string;
  icon: IconType;
  onPress: () => void;
  isEnableParticipantRequestsCount?: boolean;
};

const MeetingActionsContainer = ({
  onChangeVideoStatus,
  onPressMenu,
  onPressParticipants,
  onChangeMicStatus,
  onPressRaiseHand,
  isMuted,
  isVideoEnabled,
  isHandRaised,
  isVisibleRaiseHand,
  participantsRequestCount = 0,
}: Props) => {
  const ActionButton = ({
    text = '',
    icon,
    onPress,
    isEnableParticipantRequestsCount = false,
  }: ActionButtonProps) => {
    return (
      <View
        style={[
          styles.buttonContainer,
          !isVisibleRaiseHand && {width: (DIMENSIONS.window.width - 30) / 4},
        ]}>
        <TouchableOpacity
          style={{alignItems: 'center'}}
          activeOpacity={0.8}
          onPress={onPress}>
          {isEnableParticipantRequestsCount && participantsRequestCount > 0 && (
            <View style={styles.badgeContainer}>
              <StyledText style={styles.participantCountText}>
                {participantsRequestCount <= 9
                  ? participantsRequestCount.toString()
                  : '9+'}
              </StyledText>
            </View>
          )}
          <SVGIcon icon={icon} marginBottom={5} />
          <StyledText style={{color: COLORS.white, fontSize: 10}}>
            {text}
          </StyledText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <ActionButton
        text={isMuted ? 'Un Mute' : 'Mute'}
        icon={isMuted ? 'mic_off_white' : 'mic_white'}
        onPress={onChangeMicStatus}
      />
      <ActionButton
        text={isVideoEnabled ? 'Stop Video' : 'Start Video'}
        icon={isVideoEnabled ? 'video_call_white' : 'video_disabled_white'}
        onPress={onChangeVideoStatus}
      />
      {isVisibleRaiseHand && (
        <ActionButton
          text={'Raise Hand'}
          icon={isHandRaised ? 'hand_secondary' : 'hand_white'}
          onPress={onPressRaiseHand}
        />
      )}
      {/* <ActionButton text="Speaker" icon="speaker_white" onPress={() => {}} /> */}
      <ActionButton
        text="Participants"
        icon="participants_white"
        isEnableParticipantRequestsCount={true}
        onPress={onPressParticipants}
      />
      <ActionButton
        text="More"
        icon="menu_horizontal_white"
        onPress={onPressMenu}
      />
    </View>
  );
};

export default MeetingActionsContainer;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.transparent,
    borderTopWidth: 1,
    borderColor: COLORS.grey,
  },
  buttonContainer: {
    alignItems: 'center',
    width: (DIMENSIONS.window.width - 30) / 5,
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: 10,
    height: 20,
    width: 20,
    borderRadius: 18 / 2,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  participantCountText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.DMSans.medium,
  },
});
