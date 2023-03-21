import {LayoutChangeEvent, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import {removeToken} from '../Utilities/Methods';
import {useDispatch} from 'react-redux';
import {useToken} from '../Utilities/StoreData';
import {useNavigation} from '@react-navigation/native';
import {setIsOpenLoginAlert} from '../Store/Slices/UtilitySlice';

export type CustomHomeHeaderProps = {
  bgColor?: string;
  isEnableAddUserButton?: boolean;
  paddingTop?: number;
};

const CustomHomeHeader = ({
  bgColor = COLORS.primary,
  isEnableAddUserButton = true,
  paddingTop,
}: CustomHomeHeaderProps) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useToken();

  const isLogin = () => {
    if (token) {
      return true;
    }
    dispatch(setIsOpenLoginAlert(true));
  };

  return (
    <View
      style={[styles.mainContainer, {backgroundColor: bgColor, paddingTop}]}>
      <View style={styles.subContainer}>
        <SVGIcon
          icon="app_logo_white"
          isButton
          height={30}
          width={30}
          onPress={() => {
            removeToken(dispatch);
          }}
        />
      </View>
      <View style={styles.subContainer}></View>
      <View style={[styles.subContainer, {justifyContent: 'flex-end'}]}>
        <SVGIcon
          icon="search"
          isButton
          onPress={() => {
            if (isLogin()) {
              navigation.navigate('GlobalSearchStack');
            }
          }}
        />
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
        {isEnableAddUserButton && (
          <SVGIcon
            icon="user_plus"
            height={28}
            width={28}
            onPress={() => {
              if (isLogin()) {
              }
            }}
            marginLeft={5}
            isButton
          />
        )}
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
    flex: 1,
    flexDirection: 'row',
  },
});
