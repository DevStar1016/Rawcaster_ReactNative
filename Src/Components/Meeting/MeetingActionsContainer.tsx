import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import SVGIcon from '../SVGIcon';
import StyledText from '../StyledText';
import {COLORS} from '../../Utilities/Colors';
import {IconType} from '../../Utilities/Icons';

type Props = {
  onChangeVideoStatus: () => void;
  onChangeMicStatus: () => void;
  onPressMenu: () => void;
  onPressParticipants: () => void;
  isMuted?: boolean;
  isVideoEnabled: boolean;
};

type ActionButtonProps = {
  text: string;
  icon: IconType;
  onPress: () => void;
};

const MeetingActionsContainer = ({
  onChangeVideoStatus,
  onPressMenu,
  onPressParticipants,
  onChangeMicStatus,
  isMuted,
  isVideoEnabled,
}: Props) => {
  const ActionButton = ({text = '', icon, onPress}: ActionButtonProps) => {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={{alignItems: 'center'}}
          activeOpacity={0.8}
          onPress={onPress}>
          <SVGIcon icon={icon} marginBottom={5} />
          <StyledText style={{color: COLORS.white}}>{text}</StyledText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.mainContainer]}>
      <ActionButton
        text={isMuted ? 'Un Mute' : 'Mute'}
        icon={isMuted ? 'mic_off_white' : 'mic_white'}
        onPress={onChangeMicStatus}
      />
      <ActionButton
        text={isVideoEnabled ? 'Stop Video' : 'Start Video'}
        icon={isVideoEnabled ? 'video_disabled_white' : 'video_call_white'}
        onPress={onChangeVideoStatus}
      />
      {/* <ActionButton text="Speaker" icon="speaker_white" onPress={() => {}} /> */}
      <ActionButton
        text="Participants"
        icon="participants_white"
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
  },
});
