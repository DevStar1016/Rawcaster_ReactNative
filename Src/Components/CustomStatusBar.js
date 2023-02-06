import React, {useEffect} from 'react';
import {View, StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import {setInsets} from '../Store/Slices/UtilitySlice';
import {COLORS} from '../Utilities/Colors';
import {IS_IOS} from '../Utilities/Constants';

const CustomStatusBar = ({
  barBackgroundColor = COLORS.primary,
  isContentLight = false,
}) => {
  const dispatch = useDispatch();
  const {top, bottom, left, right} = useSafeAreaInsets();

  useEffect(() => {
    dispatch(
      setInsets({
        top,
        bottom,
        right,
        left,
      }),
    );

    return () => {};
  }, []);

  return (
    <View
      style={[
        IS_IOS
          ? {
              height: top > 0 ? top : 20,
              backgroundColor: barBackgroundColor,
            }
          : {
              height: StatusBar.currentHeight,
            },
      ]}>
      <StatusBar
        translucent
        backgroundColor={barBackgroundColor}
        barStyle={isContentLight ? 'light-content' : 'dark-content'}
      />
    </View>
  );
};
export default CustomStatusBar;
