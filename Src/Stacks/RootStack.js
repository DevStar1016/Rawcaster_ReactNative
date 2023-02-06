import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Login from '../Screens/AuthScreens/Login';

const Stack = createStackNavigator();

const RootStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        options={{
          headerShown: false,
        }}
        component={Login}
      />
    </Stack.Navigator>
  );
};

export default RootStack;
