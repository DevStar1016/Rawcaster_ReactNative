import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
  setIsBottomTabBarAbsolute,
  setNuggetType,
} from '../Store/Slices/UtilitySlice';
import {useDispatch} from 'react-redux';
import PlansAndPrice from '../Screens/MainScreens/PlansAndPrice';
import StackAnimation from '../Utilities/StackAnimation';
import DashboardTopTabNavigation from '../Navigation/TopTabNavigation/DashboardCategoryTabs/DashboardTopTabNavigation';
import {useToken} from '../Utilities/StoreData';
import DashboardWithCategory from '../Screens/MainScreens/HomeScreen/DashboardWithCategory';

const Stack = createStackNavigator();

const HomeStack = () => {
  const token = useToken();
  const dispatch = useDispatch();

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, ...StackAnimation}}
      screenListeners={{
        focus: e => {
          if (
            e.target.includes('DashboardTopTabNavigation') ||
            e.target.includes('DashboardWithCategory')
          ) {
            dispatch(setNuggetType(1));
            dispatch(setIsBottomTabBarAbsolute(true));
          } else {
            dispatch(setNuggetType(0));
            dispatch(setIsBottomTabBarAbsolute(false));
          }
        },
      }}>
      {token ? (
        <Stack.Screen
          name="DashboardTopTabNavigation"
          component={DashboardTopTabNavigation}
        />
      ) : (
        <Stack.Screen
          name="DashboardWithCategory"
          component={DashboardWithCategory}
        />
      )}
      <Stack.Screen name="PlansAndPrice" component={PlansAndPrice} />
    </Stack.Navigator>
  );
};

export default HomeStack;
