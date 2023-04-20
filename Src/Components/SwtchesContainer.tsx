import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import Switch from 'react-native-switches';
import TitleDescriptionContainer, {
  TitleDescriptionContainerProps,
} from './TitleDescriptionContainer';
import StyledText from './StyledText';
import {FONTS} from '../Utilities/Fonts';
import {COLORS} from '../Utilities/Colors';

type SwitchItem = {
  id: number | string;
  name: string;
};

type Props = {
  title?: string;
  description?: string;
  titleDescriptionContainerProps?: Omit<
    TitleDescriptionContainerProps,
    'title' | 'description'
  >;
  onStatusSwitchesIdsList?: (number | string)[];
  switchesList?: SwitchItem[];
  isSwitchesFlexStart?: boolean;
  onChangeButtonStatus: (id: number | string) => void;
};

const SwtchesContainer = ({
  title = '',
  description = '',
  onStatusSwitchesIdsList,
  switchesList = [],
  isSwitchesFlexStart = false,
  titleDescriptionContainerProps,
  onChangeButtonStatus,
}: Props) => {
  function SwitchItem({name = '', id}: SwitchItem) {
    return (
      <View style={styles.switchItemContainer}>
        <Switch
          shape={'pill'}
          colorTextOff={COLORS.white}
          colorTextOn={COLORS.white}
          animationDuration={150}
          textOn="On"
          textOff="Off"
          colorSwitchOn={COLORS.radioSelectedColor}
          colorSwitchOff={COLORS.switchOffColor}
          buttonSize={15}
          borderWidth={0}
          spaceBetween={1}
          sliderHeight={25}
          sliderWidth={55}
          buttonOffsetRight={6}
          buttonOffsetLeft={6}
          textSize={13}
          textFont={FONTS.DMSans.regular}
          onChange={() => {
            onChangeButtonStatus(id);
          }}
          value={onStatusSwitchesIdsList?.includes(id) ? true : false}
        />
        <StyledText style={{paddingLeft: 10}}>{name}</StyledText>
      </View>
    );
  }

  return (
    <View style={styles.settingItemContainer}>
      <TitleDescriptionContainer
        containerStyle={{paddingVertical: 0}}
        title={title}
        description={description}
        {...titleDescriptionContainerProps}
      />

      <View
        style={[
          styles.switchesContainer,
          {
            justifyContent: isSwitchesFlexStart
              ? 'flex-start'
              : 'space-between',
          },
        ]}>
        {switchesList.map(item => {
          return <SwitchItem key={item.id.toString()} {...item} />;
        })}
      </View>
    </View>
  );
};

export default SwtchesContainer;

const styles = StyleSheet.create({
  switchItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '32%',
  },
  settingItemContainer: {
    paddingVertical: 10,
  },
  switchesContainer: {
    flexDirection: 'row',
    marginTop: 13,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
