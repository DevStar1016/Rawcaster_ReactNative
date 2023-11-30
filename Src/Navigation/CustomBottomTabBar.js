import React, {useEffect, useState} from 'react';

import {View, Pressable, StyleSheet, Image, Keyboard} from 'react-native';
import {COLORS} from '../Utilities/Colors';
import EventsIcon from '../Assets/Png/event.png';
import NotificationsIcon from '../Assets/Png/notification.png';
import TalkShowIcon from '../Assets/Png/talkshow.png';
import UserIcon from '../Assets/Png/user.png';
import {
  useIsNuggetsLoading,
  useIsBottomTabBarAbsolute,
  useNuggetType,
  useToken,
  useUnreadNotificationCount,
  useTabType,
} from '../Utilities/StoreData';
import CustomHomeTabButton from '../Components/CustomHomeTabButton';
import {useDispatch} from 'react-redux';
import {setIsOpenLoginAlert, setNuggetType} from '../Store/Slices/UtilitySlice';
import StyledText from '../Components/StyledText';
import {IS_ENABLE_CHIME_FUNCTIONALITY, IS_IOS} from '../Utilities/Constants';

const CustomBottomTabBar = ({state, descriptors, navigation}) => {
  const [visible, setVisible] = useState(true);
  const isBottomTabBarAbsolute = useIsBottomTabBarAbsolute();
  const token = useToken();
  const dispatch = useDispatch();
  const nuggetType = useNuggetType();
  const tabType = useTabType();
  const unreadNotificationCount = useUnreadNotificationCount();
  const isAllNuggetsLoading = useIsNuggetsLoading();
  useEffect(() => {
    let keyboardEventListeners;
    if (!IS_IOS) {
      keyboardEventListeners = [
        Keyboard.addListener('keyboardDidShow', () => setVisible(false)),
        Keyboard.addListener('keyboardDidHide', () => setVisible(true)),
      ];
    }
    return () => {
      if (!IS_IOS) {
        keyboardEventListeners &&
          keyboardEventListeners.forEach(eventListener =>
            eventListener.remove(),
          );
      }
    };
  }, []);

  return (
    (IS_IOS || visible) && (
      <View
        style={
          isBottomTabBarAbsolute
            ? styles.absoluteBarStyle
            : styles.relativeBarStyle
        }>
        {state.routes.map((route, index) => {
          let Icon;
          if (route.name === 'EventsStack' && IS_ENABLE_CHIME_FUNCTIONALITY) {
            Icon = EventsIcon;
          } else if (route.name === 'NotificationsStack') {
            Icon = NotificationsIcon;
          } else if (route.name === 'HomeStack') {
            Icon = EventsIcon;
          } else if (
            route.name === 'TalkshowStack' &&
            IS_ENABLE_CHIME_FUNCTIONALITY
          ) {
            Icon = TalkShowIcon;
          } else if (route.name === 'UsersStack') {
            Icon = UserIcon;
          }

          const isFocused = state.index === index;

          const handleChangeNuggetType = () => {
            if (tabType === 1) {
              let tempNuggetType = nuggetType;
              if (nuggetType === 1) {
                tempNuggetType = 2;
              } else {
                tempNuggetType = 1;
              }
              dispatch(setNuggetType(tempNuggetType));
            }
          };

          const onPress = () => {
            if (!token && index !== (IS_ENABLE_CHIME_FUNCTIONALITY ? 2 : 1)) {
              dispatch(setIsOpenLoginAlert(true));
              return;
            }
            if (index === (IS_ENABLE_CHIME_FUNCTIONALITY ? 2 : 1)) {
              handleChangeNuggetType();
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <View key={index} style={styles.mainItemContainer}>
              {index === (IS_ENABLE_CHIME_FUNCTIONALITY ? 2 : 1) ? (
                <CustomHomeTabButton
                  onPress={onPress}
                  isLoading={isAllNuggetsLoading}
                />
              ) : (
                <Pressable onPress={onPress}>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      flex: 1,
                      padding: 15,
                    }}>
                    <Image
                      source={Icon}
                      style={{
                        height: 25,
                        width: 25,
                        tintColor: isFocused ? COLORS.secondary : COLORS.white,
                      }}
                    />
                    {!isFocused &&
                    route.name === 'NotificationsStack' &&
                    token &&
                    unreadNotificationCount ? (
                      <View
                        style={[
                          styles.badge,
                          {
                            width:
                              parseInt(unreadNotificationCount) > 99 ? 25 : 15,
                          },
                        ]}>
                        <StyledText
                          style={{
                            color: COLORS.white,
                            fontSize: 11,
                          }}>
                          {unreadNotificationCount > 99
                            ? '99+'
                            : unreadNotificationCount}
                        </StyledText>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  mainItemContainer: {
    flex: 1,
    justifyContent: 'center',
    height: 55,
    backgroundColor: COLORS.transparent,
    alignItems: 'center',
  },

  absoluteBarStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.transparent,
    elevation: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  relativeBarStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  badge: {
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 8,
    left: 25,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
  },
});

export default CustomBottomTabBar;
