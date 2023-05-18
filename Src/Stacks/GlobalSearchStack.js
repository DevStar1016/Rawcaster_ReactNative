import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import GlobalSearchHome from '../Screens/MainScreens/GlobalSearch/GlobalSearchHome';
import StackAnimation from '../Utilities/StackAnimation';

const Stack = createStackNavigator();

const GlobalSearchStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false, ...StackAnimation}}>
      <Stack.Screen name="GlobalSearch" component={GlobalSearchHome} />
    </Stack.Navigator>
  );
};

export default GlobalSearchStack;
