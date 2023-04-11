import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import ConnectionsList from '../Screens/MainScreens/User/ConnectionsList';

const Stack = createStackNavigator();

const ConnectionsListStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ConnectionsList" component={ConnectionsList} />
    </Stack.Navigator>
  );
};

export default ConnectionsListStack;
