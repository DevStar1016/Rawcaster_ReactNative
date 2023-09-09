import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {useDispatch} from 'react-redux';
import CreateEditTalkshow from '../Screens/MainScreens/Talkshow/CreateEditTalkshow';
import Talkshow from '../Screens/MainScreens/Talkshow/Talkshow';
import {setIsBottomTabBarAbsolute} from '../Store/Slices/UtilitySlice';
import StackAnimation from '../Utilities/StackAnimation';
import EventCreateSuccess from '../Screens/MainScreens/EventsAndTalkshowsCommon/EventCreateSuccess';

const Stack = createStackNavigator();

const TalkshowStack = () => {
  const dispatch = useDispatch();
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, ...StackAnimation}}
      screenListeners={{
        focus: e => {
          if (e.target.includes('CreateEditTalkshow')) {
            dispatch(setIsBottomTabBarAbsolute(false));
          } else {
            dispatch(setIsBottomTabBarAbsolute(true));
          }
        },
      }}>
      <Stack.Screen name="Talkshow" component={Talkshow} />
      <Stack.Screen name="CreateEditTalkshow" component={CreateEditTalkshow} />
      <Stack.Screen name="EventCreateSuccess" component={EventCreateSuccess} />
    </Stack.Navigator>
  );
};

export default TalkshowStack;
