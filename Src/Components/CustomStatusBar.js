import React, {useEffect} from 'react';
import {View, StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import {setInsets} from '../Store/Slices/UtilitySlice';
import {COLORS} from '../Utilities/Colors';
import {IS_IOS} from '../Utilities/Constants';
import {useInsets} from '../Utilities/StoreData';

const CustomStatusBar = () => {
  const dispatch = useDispatch();
  const insets = useInsets();
  const {top, bottom, left, right} = useSafeAreaInsets();

  useEffect(() => {
    let tempInsets = {
      ...insets,
      top: top,
      bottom: bottom,
      right: right,
      left: left,
    };
    if (!IS_IOS) {
      tempInsets = {
        ...tempInsets,
        mediaHeight:
          insets.mediaHeight + (top > 0 ? top : StatusBar.currentHeight),
      };
    }

    dispatch(setInsets({...tempInsets}));

    return () => {};
  }, []);

  return IS_IOS ? (
    <View
      style={{
        height: top > 0 ? top : 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
      }}>
      <StatusBar translucent barStyle={'light-content'} />
    </View>
  ) : (
    <StatusBar
      backgroundColor={COLORS.transparent}
      translucent={true}
      barStyle="light-content"
    />
  );
};
export default CustomStatusBar;
