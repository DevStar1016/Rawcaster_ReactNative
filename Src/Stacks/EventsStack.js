import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {useDispatch} from 'react-redux';
import CreateEditEvent from '../Screens/MainScreens/Events/CreateEditEvent';
import CreateEditEventSecond from '../Screens/MainScreens/Events/CreateEditEventSecond';
import Events from '../Screens/MainScreens/Events/Events';
import {setIsBottomTabBarAbsolute} from '../Store/Slices/UtilitySlice';
import StackAnimation from '../Utilities/StackAnimation';
import EventCreateSuccess from '../Screens/MainScreens/EventsAndTalkshowsCommon/EventCreateSuccess';
import EventDetailScreen from '../Screens/MainScreens/EventsAndTalkshowsCommon/EventDetailScreen';

const Stack = createStackNavigator();

const EventsStack = () => {
  const dispatch = useDispatch();
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, ...StackAnimation}}
      screenListeners={{
        focus: e => {
          if (e.target.includes('CreateEditEvent')) {
            dispatch(setIsBottomTabBarAbsolute(false));
          } else {
            dispatch(setIsBottomTabBarAbsolute(true));
          }
        },
      }}>
      <Stack.Screen name="Events" component={Events} />
      <Stack.Screen name="CreateEditEvent" component={CreateEditEvent} />
      <Stack.Screen
        name="CreateEditEventSecond"
        component={CreateEditEventSecond}
      />
      <Stack.Screen name="EventCreateSuccess" component={EventCreateSuccess} />
      {/* <Stack.Screen name="EventDetailScreen" component={EventDetailScreen} /> */}
    </Stack.Navigator>
  );
};

export default EventsStack;
