import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import UsersGroupsListHome from '../Screens/MainScreens/User/UsersGroupsListHome';

const Stack = createStackNavigator();

const UsersStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="UsersGroupsListHome"
        component={UsersGroupsListHome}
      />
    </Stack.Navigator>
  );
};

export default UsersStack;
