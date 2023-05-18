import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import UsersGroupsListHome from '../Screens/MainScreens/User/UsersGroupsListHome';
import StackAnimation from '../Utilities/StackAnimation';

const Stack = createStackNavigator();

const UsersStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false, ...StackAnimation}}>
      <Stack.Screen
        name="UsersGroupsListHome"
        component={UsersGroupsListHome}
      />
    </Stack.Navigator>
  );
};

export default UsersStack;
