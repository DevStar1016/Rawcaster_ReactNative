import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import GroupsList from '../Screens/MainScreens/User/GroupsList';

const Stack = createStackNavigator();

const GroupsListStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="GroupsList" component={GroupsList} />
    </Stack.Navigator>
  );
};

export default GroupsListStack;
