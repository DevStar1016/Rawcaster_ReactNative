import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Blocking from '../Screens/MainScreens/Settings/Blocking';
import ChangePassword from '../Screens/MainScreens/Settings/ChangePassword';
import EventSettings from '../Screens/MainScreens/Settings/EventSettings';
import GeneralSettings from '../Screens/MainScreens/Settings/GeneralSettings';
import NotificationsSettings from '../Screens/MainScreens/Settings/NotificationsSettings';
import Refer from '../Screens/MainScreens/Settings/Refer';
import SettingsHome from '../Screens/MainScreens/Settings/SettingsHome';
import ReferalContactsList from '../Screens/MainScreens/Settings/ReferalContactsList';

const Stack = createStackNavigator();

const SettingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SettingsHome" component={SettingsHome} />
      <Stack.Screen name="GeneralSettings" component={GeneralSettings} />
      <Stack.Screen
        name="NotificationsSettings"
        component={NotificationsSettings}
      />
      <Stack.Screen name="Blocking" component={Blocking} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="EventSettings" component={EventSettings} />
      <Stack.Screen name="Refer" component={Refer} />
      <Stack.Screen name="ReferalContacts" component={ReferalContactsList} />
    </Stack.Navigator>
  );
};

export default SettingsStack;
