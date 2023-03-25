import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Events from '../Screens/MainScreens/Events/Events';

const Stack = createStackNavigator();

const EventsStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Events" component={Events} />
    </Stack.Navigator>
  );
};

export default EventsStack;
