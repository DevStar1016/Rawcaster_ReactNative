import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import BottomTabNavigation from '../Navigation/BottomTabNavigation';
import EmailPhoneVerification from '../Screens/AuthScreens/EmailPhoneVerification';
import ForgotPassword from '../Screens/AuthScreens/ForgotPassword';
import Login from '../Screens/AuthScreens/Login';
import ResetPasswordOTP from '../Screens/AuthScreens/ResetPasswordOTP';
import Signup from '../Screens/AuthScreens/SignupScreens/Signup';
import SignupWithPhone from '../Screens/AuthScreens/SignupScreens/SignupWithPhone';

const Stack = createStackNavigator();

const RootStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="BottomTabNavigationBeforeLogin"
        component={BottomTabNavigation}
      />

      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="SignupWithPhone" component={SignupWithPhone} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen
        name="EmailPhoneVerification"
        component={EmailPhoneVerification}
      />
      <Stack.Screen name="ResetPasswordOTP" component={ResetPasswordOTP} />
    </Stack.Navigator>
  );
};

export default RootStack;
