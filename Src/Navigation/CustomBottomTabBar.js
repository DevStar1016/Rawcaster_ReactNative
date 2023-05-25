import React from 'react';

import {View, Pressable, StyleSheet, Image} from 'react-native';
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
} from '../Utilities/StoreData';
import CustomHomeTabButton from '../Components/CustomHomeTabButton';
import {useDispatch} from 'react-redux';
import {setIsOpenLoginAlert, setNuggetType} from '../Store/Slices/UtilitySlice';
import StyledText from '../Components/StyledText';

const CustomBottomTabBar = ({state, descriptors, navigation}) => {
  const isBottomTabBarAbsolute = useIsBottomTabBarAbsolute();
  const token = useToken();
  const dispatch = useDispatch();
  const nuggetType = useNuggetType();
  const unreadNotificationCount = useUnreadNotificationCount();
  const isAllNuggetsLoading = useIsNuggetsLoading();

  return (
    <View
      style={
        isBottomTabBarAbsolute
          ? styles.absoluteBarStyle
          : styles.relativeBarStyle
      }>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        let Icon;
        if (route.name === 'EventsStack') {
          Icon = EventsIcon;
        } else if (route.name === 'NotificationsStack') {
          Icon = NotificationsIcon;
        } else if (route.name === 'HomeStack') {
          Icon = EventsIcon;
        } else if (route.name === 'TalkshowStack') {
          Icon = TalkShowIcon;
        } else if (route.name === 'UsersStack') {
          Icon = UserIcon;
        }

        const isFocused = state.index === index;

        const handleChangeNuggetType = () => {
          if (index === 2) {
            let tempNuggetType = 1;
            if (nuggetType !== 1) {
              tempNuggetType = 1;
            } else {
              tempNuggetType = 2;
            }
            dispatch(setNuggetType(tempNuggetType));
            // listNuggetsAPICall(tempNuggetType);
          } else {
            dispatch(setNuggetType(0));
          }
        };

        const onPress = () => {
          if (!token && index !== 2) {
            dispatch(setIsOpenLoginAlert(true));
            return;
          }
          handleChangeNuggetType(index);

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
            {index === 2 ? (
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
