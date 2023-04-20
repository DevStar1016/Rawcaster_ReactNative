import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Notifications from '../Screens/MainScreens/Notifications/NotificationsHome';

const Stack = createStackNavigator();

const NotificationsStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Notifications" component={Notifications} />
    </Stack.Navigator>
  );
};

export default NotificationsStack;
