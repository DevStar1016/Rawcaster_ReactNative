import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';
import SVGIcon from './SVGIcon';
import {IconType} from '../Utilities/Icons';
import StyledText from './StyledText';

type OptionsProp = {
  id: number;
  name: string;
};

type Props = {
  triggerIcon?: IconType;
  triggerButtonStyle?: ViewStyle;
  options: OptionsProp[];
  optionsMainContainerStyle?: ViewStyle;
  optionContainerStyle?: ViewStyle;
  optionTextStyle?: TextStyle;
  type?:
    | 'popover'
    | 'context_menu'
    | 'slide_in_menu'
    | 'not_animated_context_menu';
  onSelectOption: (value: any) => void;
};

const MenuPopup = ({
  triggerIcon = 'menu_vertical',
  triggerButtonStyle,
  options = [],
  optionsMainContainerStyle,
  optionContainerStyle,
  optionTextStyle,
  type = 'popover',
  onSelectOption,
}: Props) => {
  const getRenderer = () => {
    switch (type) {
      case 'popover':
        return renderers.Popover;
      case 'context_menu':
        return renderers.ContextMenu;
      case 'slide_in_menu':
        return renderers.SlideInMenu;
      case 'not_animated_context_menu':
        return renderers.NotAnimatedContextMenu;
    }
  };

  return (
    <Menu renderer={getRenderer()}>
      <MenuTrigger style={triggerButtonStyle}>
        <SVGIcon icon={triggerIcon} height={20} />
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: [
            styles.optionsContainer,
            optionsMainContainerStyle,
          ],
        }}>
        {options.map(item => {
          return (
            <MenuOption
              key={item.id}
              style={optionContainerStyle}
              onSelect={() => {
                onSelectOption(item.id);
              }}>
              <StyledText style={optionTextStyle}>{item.name}</StyledText>
            </MenuOption>
          );
        })}
      </MenuOptions>
    </Menu>
  );
};

export default MenuPopup;

const styles = StyleSheet.create({
  optionsContainer: {
    borderRadius: 10,
    width: 100,
    padding: 10,
  },
});
