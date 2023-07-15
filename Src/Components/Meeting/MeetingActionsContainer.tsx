import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import SVGIcon from '../SVGIcon';
import StyledText from '../StyledText';
import {COLORS} from '../../Utilities/Colors';
import {IconType} from '../../Utilities/Icons';
import {useInsets} from '../../Utilities/StoreData';

type ActionButtonProps = {
  text: string;
  icon: IconType;
  onPress: () => void;
};

const MeetingActionsContainer = () => {
  const [isMuted, setisMuted] = useState(false);
  const [isVideo, setisVideo] = useState(false);
  const insets = useInsets();

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
        onPress={() => {
          setisMuted(pre => !pre);
        }}
      />
      <ActionButton
        text={isVideo ? 'Stop Video' : 'Start Video'}
        icon={isVideo ? 'video_disabled_white' : 'video_call_white'}
        onPress={() => {
          setisVideo(pre => !pre);
        }}
      />
      <ActionButton text="Speaker" icon="speaker_white" onPress={() => {}} />
      <ActionButton
        text="Participants"
        icon="participants_white"
        onPress={() => {}}
      />
      <ActionButton
        text="More"
        icon="menu_horizontal_white"
        onPress={() => {}}
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
