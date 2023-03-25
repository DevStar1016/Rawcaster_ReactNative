import React, {useState} from 'react';

import {View, Pressable, StyleSheet, Image} from 'react-native';
import {COLORS} from '../Utilities/Colors';
import EventsIcon from '../Assets/Png/event.png';
import NotificationsIcon from '../Assets/Png/notification.png';
import TalkShowIcon from '../Assets/Png/talkshow.png';
import UserIcon from '../Assets/Png/user.png';
import {
  useIsBottomTabBarAbsolute,
  useNuggetType,
  useToken,
} from '../Utilities/StoreData';
import CustomHomeTabButton from '../Components/CustomHomeTabButton';
import {useDispatch} from 'react-redux';
import {setIsOpenLoginAlert, setNuggetType} from '../Store/Slices/UtilitySlice';
import {listNuggetsService} from '../Services/ApiService';
import {setNuggetsList} from '../Store/Slices/HomeSlice';
import Toast from '../Components/Toast';
import {htmlDecodeText} from '../Utilities/Methods';

const CustomBottomTabBar = ({state, descriptors, navigation}) => {
  const isBottomTabBarAbsolute = useIsBottomTabBarAbsolute();
  const token = useToken();
  const dispatch = useDispatch();
  const nuggetType = useNuggetType();
  const [isLoading, setisLoading] = useState(false);

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
        } else if (route.name === 'Notifications') {
          Icon = NotificationsIcon;
        } else if (route.name === 'HomeStack') {
          Icon = EventsIcon;
        } else if (route.name === 'TalkshowStack') {
          Icon = TalkShowIcon;
        } else if (route.name === 'User') {
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
            listNuggetsAPICall(tempNuggetType);
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

        const listNuggetsAPICall = tempNuggetType => {
          setisLoading(true);
          const formData = new FormData();
          formData.append('token', token ?? 'RAWCAST');
          formData.append('page_number', 1);
          formData.append('nugget_type', tempNuggetType);
          listNuggetsService(formData)
            .then(res => {
              if (res.data.status === 1) {
                let decodedNuggetList = [...res.data.nuggets_list].map(item => {
                  return {
                    ...item,
                    content: htmlDecodeText(item.content),
                    original_user_name: htmlDecodeText(item.original_user_name),
                    user_name: htmlDecodeText(item.user_name),
                  };
                });

                dispatch(setNuggetsList(decodedNuggetList));
                dispatch(setNuggetType(tempNuggetType));
              } else if (res.data.status === 0) {
                Toast.fail(res.data.msg);
              }
            })
            .catch(e => {
              Toast.fail(e.message);
            })
            .finally(() => {
              setisLoading(false);
            });
        };

        return (
          <View key={index} style={styles.mainItemContainer}>
            {index === 2 ? (
              <CustomHomeTabButton onPress={onPress} isLoading={isLoading} />
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
});

export default CustomBottomTabBar;
