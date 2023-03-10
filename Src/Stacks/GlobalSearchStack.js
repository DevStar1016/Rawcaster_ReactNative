import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import GlobalSearchHome from '../Screens/MainScreens/GlobalSearch/GlobalSearchHome';

const Stack = createStackNavigator();

const GlobalSearchStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="GlobalSearch" component={GlobalSearchHome} />
    </Stack.Navigator>
  );
};

export default GlobalSearchStack;
