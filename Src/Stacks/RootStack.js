import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import ForgotPassword from '../Screens/AuthScreens/ForgotPassword';
import Login from '../Screens/AuthScreens/Login';
import OTPVerification from '../Screens/AuthScreens/OTPVerification';
import ResetPasswordOTP from '../Screens/AuthScreens/ResetPasswordOTP';
import Signup from '../Screens/AuthScreens/SignupScreens/Signup';
import SignupWithPhone from '../Screens/AuthScreens/SignupScreens/SignupWithPhone';

const Stack = createStackNavigator();

const RootStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="SignupWithPhone" component={SignupWithPhone} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPasswordOTP" component={ResetPasswordOTP} />
      <Stack.Screen name="OTPVerification" component={OTPVerification} />
    </Stack.Navigator>
  );
};

export default RootStack;
