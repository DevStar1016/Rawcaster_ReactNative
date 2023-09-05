import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import SVGIcon from '../SVGIcon';
import StyledText from '../StyledText';
import {COLORS} from '../../Utilities/Colors';
import {IconType} from '../../Utilities/Icons';
import {DIMENSIONS, EVENT_TYPE} from '../../Utilities/Constants';
import {FONTS} from '../../Utilities/Fonts';
import BOX_SHADOW from '../../Utilities/BoxShadow';

type Props = {
  onChangeVideoStatus: () => void;
  onChangeMicStatus: () => void;
  onPressMenu: () => void;
  onPressParticipants: () => void;
  onPressRaiseHand: () => void;
  onPressEnd: () => void;
  isMuted?: boolean;
  isHandRaised?: boolean;
  isVideoEnabled: boolean;
  isVisibleRaiseHand?: boolean;
  eventType: number;
  participantsRequestCount: number;
};

type ActionButtonProps = {
  text: string;
  icon: IconType;
  buttonBgColor?: string;
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
  isVisibleRaiseHand = true,
  participantsRequestCount = 0,
  onPressEnd,
  eventType,
}: Props) => {
  const ActionButton = ({
    text = '',
    icon,
    onPress,
    isEnableParticipantRequestsCount = false,
    buttonBgColor = COLORS.transparentDimColor,
  }: ActionButtonProps) => {
    return (
      <View
        style={[
          styles.buttonContainer,
          !isVisibleRaiseHand &&
            eventType !== EVENT_TYPE.talkshow && {
              width: (DIMENSIONS.window.width - 30) / 4,
            },
        ]}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            eventType === EVENT_TYPE.talkshow && {
              height: (DIMENSIONS.window.width - 120) / 5,
              width: (DIMENSIONS.window.width - 120) / 5,
              borderRadius: (DIMENSIONS.window.width - 120) / 5 / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: buttonBgColor,
              ...BOX_SHADOW,
            },
          ]}
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
          <SVGIcon
            icon={icon}
            marginBottom={eventType === EVENT_TYPE.event ? 5 : 0}
          />
          {eventType === EVENT_TYPE.event && (
            <StyledText style={{color: COLORS.white, fontSize: 10}}>
              {text}
            </StyledText>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.mainContainer,
        eventType === EVENT_TYPE.talkshow && {
          borderTopWidth: 0,
          paddingBottom: 10,
        },
      ]}>
      <ActionButton
        text={isMuted ? 'Un Mute' : 'Mute'}
        icon={isMuted ? 'mic_off_white' : 'mic_white'}
        onPress={onChangeMicStatus}
        buttonBgColor={
          !isMuted && eventType === EVENT_TYPE.talkshow
            ? COLORS.secondary
            : COLORS.transparentDimColor
        }
      />
      <ActionButton
        text={isVideoEnabled ? 'Stop Video' : 'Start Video'}
        icon={isVideoEnabled ? 'video_call_white' : 'video_disabled_white'}
        onPress={onChangeVideoStatus}
        buttonBgColor={
          isVideoEnabled && eventType === EVENT_TYPE.talkshow
            ? COLORS.secondary
            : COLORS.transparentDimColor
        }
      />
      {eventType === EVENT_TYPE.talkshow && (
        <ActionButton
          text="Stop"
          icon="hang_off"
          onPress={onPressEnd}
          buttonBgColor={COLORS.red}
        />
      )}
      {(isVisibleRaiseHand || eventType === EVENT_TYPE.talkshow) && (
        <ActionButton
          text={'Raise Hand'}
          icon={
            isHandRaised && eventType !== EVENT_TYPE.talkshow
              ? 'hand_secondary'
              : 'hand_white'
          }
          buttonBgColor={
            eventType === EVENT_TYPE.talkshow && isHandRaised
              ? COLORS.secondary
              : COLORS.transparentDimColor
          }
          onPress={onPressRaiseHand}
        />
      )}
      {/* <ActionButton text="Speaker" icon="speaker_white" onPress={() => {}} /> */}
      {eventType !== EVENT_TYPE.talkshow && (
        <ActionButton
          text="Participants"
          icon="participants_white"
          isEnableParticipantRequestsCount={true}
          onPress={onPressParticipants}
        />
      )}
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
  actionButton: {
    alignItems: 'center',
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
