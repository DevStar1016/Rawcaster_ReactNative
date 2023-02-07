import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import ForgotPassword from '../Screens/AuthScreens/ForgotPassword';
import Login from '../Screens/AuthScreens/Login';
import ResetPasswordOTP from '../Screens/AuthScreens/ResetPasswordOTP';

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
      <Stack.Screen
        name="ForgotPassword"
        options={{
          headerShown: false,
        }}
        component={ForgotPassword}
      />
      <Stack.Screen
        name="ResetPasswordOTP"
        options={{
          headerShown: false,
        }}
        component={ResetPasswordOTP}
      />
    </Stack.Navigator>
  );
};

export default RootStack;
