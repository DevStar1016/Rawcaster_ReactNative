import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import {
  setIsBottomTabBarAbsolute,
  setTabNuggetType,
} from '../Store/Slices/UtilitySlice';
import { useDispatch } from 'react-redux';
import StackAnimation from '../Utilities/StackAnimation';
import DashboardTopTabNavigation from '../Navigation/TopTabNavigation/DashboardCategoryTabs/DashboardTopTabNavigation';
import { useToken } from '../Utilities/StoreData';
import DashboardWithCategory from '../Screens/MainScreens/HomeScreen/DashboardWithCategory';

const Stack = createStackNavigator();

const HomeStack = () => {
  const token = useToken();
  const dispatch = useDispatch();

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, ...StackAnimation }}
      screenListeners={{
        focus: e => {
          if (
            e.target.includes('DashboardTopTabNavigation') ||
            e.target.includes('DashboardWithCategory')
          ) {
            dispatch(
              setTabNuggetType({
                tab_type: 1,
              }),
            );

            dispatch(setIsBottomTabBarAbsolute(true));
          } else {
            dispatch(
              setTabNuggetType({
                tab_type: 2,
              }),
            );

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
          initialParams={{ filterType: 0, categoryName: 'forYou' }}
        />
      )}
    </Stack.Navigator>
  );
};

export default HomeStack;
