import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Dashboard from '../Screens/MainScreens/HomeScreen/Dashboard';

import {
  setIsBottomTabBarAbsolute,
  setNuggetType,
} from '../Store/Slices/UtilitySlice';
import {useDispatch} from 'react-redux';
import GlobalSearchStack from './GlobalSearchStack';

const Stack = createStackNavigator();

const HomeStack = () => {
  const dispatch = useDispatch();

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      screenListeners={{
        focus: e => {
          if (e.target.includes('Dashboard')) {
            dispatch(setNuggetType(1));
            dispatch(setIsBottomTabBarAbsolute(true));
          } else {
            dispatch(setNuggetType(0));
            dispatch(setIsBottomTabBarAbsolute(false));
          }
        },
      }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="GlobalSearchStack" component={GlobalSearchStack} />
    </Stack.Navigator>
  );
};

export default HomeStack;
