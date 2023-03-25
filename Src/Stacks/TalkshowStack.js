import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import CreateEditTalkshow from '../Screens/MainScreens/Talkshow/CreateEditTalkshow';
import Talkshow from '../Screens/MainScreens/Talkshow/Talkshow';

const Stack = createStackNavigator();

const TalkshowStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Talkshow" component={Talkshow} />
      <Stack.Screen name="CreateEditTalkshow" component={CreateEditTalkshow} />
    </Stack.Navigator>
  );
};

export default TalkshowStack;
