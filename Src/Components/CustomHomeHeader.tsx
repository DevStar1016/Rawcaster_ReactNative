import {StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import {useDispatch} from 'react-redux';
import {useInsets, useToken} from '../Utilities/StoreData';
import {useNavigation} from '@react-navigation/native';
import {setIsOpenLoginAlert} from '../Store/Slices/UtilitySlice';
import StyledText from './StyledText';
import {FONTS} from '../Utilities/Fonts';

export type CustomHomeHeaderProps = {
  bgColor?: string;
  isEnableAddUserButton?: boolean;
  isEnableProfile?: boolean;
  isEnableSettings?: boolean;
  paddingTop?: number;
  isEnableSafeArea?: boolean;
  isEnableSearch?: boolean;
  title?: string;
  isEnableLive?: boolean;
  isEnableBack?: boolean;
  isEnableNuggetFilterTabs?: boolean;
  selectedTab?: 'first' | 'second';
  onPressFirstFilterTab?: () => void;
  onPressBack?: () => void;
  onPressSecondFilterTab?: () => void;
  onPressAddUserButton?: () => void;
};

const CustomHomeHeader = ({
  bgColor = COLORS.primary,
  isEnableAddUserButton = false,
  isEnableProfile = true,
  isEnableSearch = true,
  isEnableSettings = false,
  paddingTop = 0,
  title = '',
  onPressBack,
  isEnableLive = true,
  isEnableBack = false,
  isEnableSafeArea = false,
  isEnableNuggetFilterTabs = false,
  onPressFirstFilterTab,
  onPressSecondFilterTab,
  onPressAddUserButton,
  selectedTab = 'second',
}: CustomHomeHeaderProps) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useToken();
  const insets = useInsets();

  const isLogin = () => {
    if (token) {
      return true;
    }
    dispatch(setIsOpenLoginAlert(true));
  };

  return (
    <View
      style={[
        styles.mainContainer,
        {
          backgroundColor: bgColor,
          paddingTop: isEnableSafeArea
            ? insets.top
              ? insets.top + paddingTop
              : StatusBar.currentHeight
              ? StatusBar.currentHeight + paddingTop
              : paddingTop
            : paddingTop,
        },
      ]}>
      <View style={styles.subContainer}>
        {isEnableBack ? (
          <SVGIcon
            icon="back"
            height={18}
            isButton
            width={18}
            onPress={onPressBack}
          />
        ) : (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('PlansAndPrice');
            }}>
            <SVGIcon icon="app_logo_white" height={30} width={30} />
          </TouchableOpacity>
        )}
      </View>
      <View
        style={[
          styles.subContainer,
          {
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 10,
          },
        ]}>
        {isEnableNuggetFilterTabs && token && (
          <>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPressFirstFilterTab}>
              <StyledText
                style={[
                  styles.tabText,
                  {
                    color:
                      selectedTab === 'first' ? COLORS.secondary : COLORS.white,
                  },
                ]}>
                Influencing
              </StyledText>
            </TouchableOpacity>
            <View style={styles.dot} />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPressSecondFilterTab}>
              <StyledText
                style={[
                  styles.tabText,
                  {
                    color:
                      selectedTab === 'second'
                        ? COLORS.secondary
                        : COLORS.white,
                  },
                ]}>
                For You
              </StyledText>
            </TouchableOpacity>
          </>
        )}
        {title ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <StyledText style={styles.title}>{title}</StyledText>
          </View>
        ) : null}
      </View>
      <View style={[styles.subContainer, {justifyContent: 'flex-end'}]}>
        {isEnableSearch && (
          <SVGIcon
            icon="search"
            isButton
            onPress={() => {
              if (isLogin()) {
                navigation.navigate('GlobalSearchStack');
              }
            }}
          />
        )}
        {isEnableSettings && (
          <SVGIcon
            icon="settings_white"
            marginLeft={5}
            height={26}
            width={26}
            onPress={() => {
              navigation.navigate('SettingsStack');
            }}
            isButton
          />
        )}

        {isEnableLive && (
          <SVGIcon
            icon="live"
            isButton
            height={28}
            width={28}
            marginLeft={5}
            onPress={() => {
              if (isLogin()) {
              }
            }}
          />
        )}
        {isEnableAddUserButton && (
          <SVGIcon
            icon="user_plus"
            height={28}
            width={28}
            onPress={onPressAddUserButton}
            marginLeft={5}
            isButton
          />
        )}

        {isEnableProfile && (
          <SVGIcon
            icon="user"
            marginLeft={5}
            height={28}
            width={28}
            onPress={() => {
              if (isLogin()) {
                navigation.navigate('ProfileStack');
              }
            }}
            isButton
          />
        )}
      </View>
    </View>
  );
};

export default CustomHomeHeader;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    color: COLORS.white,
  },
  dot: {
    height: 7,
    width: 7,
    borderRadius: 7 / 2,
    backgroundColor: COLORS.white,
    marginHorizontal: 10,
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
    paddingLeft: 30,
  },
});
