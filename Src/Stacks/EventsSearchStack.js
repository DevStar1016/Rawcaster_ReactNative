import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import StackAnimation from '../Utilities/StackAnimation';
import EventsSearch from '../Screens/MainScreens/GlobalSearch/EventsSearch';
import CreateEditEvent from '../Screens/MainScreens/Events/CreateEditEvent';
import CreateEditEventSecond from '../Screens/MainScreens/Events/CreateEditEventSecond';

const Stack = createStackNavigator();

const EventsSearchStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false, ...StackAnimation}}>
      <Stack.Screen name="EventsSearch" component={EventsSearch} />
      <Stack.Screen name="CreateEditSearchEvent" component={CreateEditEvent} />
      <Stack.Screen
        name="CreateEditSearchEventSecond"
        component={CreateEditEventSecond}
      />
    </Stack.Navigator>
  );
};

export default EventsSearchStack;
