import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Talkshow from '../Screens/MainScreens/Talkshow';

const Stack = createStackNavigator();

const TalkshowStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Talkshow" component={Talkshow} />
    </Stack.Navigator>
  );
};

export default TalkshowStack;
