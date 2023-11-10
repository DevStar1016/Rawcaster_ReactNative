import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Blocking from '../Screens/MainScreens/Settings/Blocking';
import ChangePassword from '../Screens/MainScreens/Settings/ChangePassword';
import EventSettings from '../Screens/MainScreens/Settings/EventSettings';
import GeneralSettings from '../Screens/MainScreens/Settings/GeneralSettings';
import NotificationsSettings from '../Screens/MainScreens/Settings/NotificationsSettings';
import SettingsHome from '../Screens/MainScreens/Settings/SettingsHome';
import StackAnimation from '../Utilities/StackAnimation';
import ReferalDashboard from '../Screens/MainScreens/Settings/Referal/ReferalDashboard';
import ReferalSocialList from '../Screens/MainScreens/Settings/Referal/ReferalSocialList';
import Development from '../Screens/MainScreens/Settings/Development';

const Stack = createStackNavigator();

const SettingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false, ...StackAnimation}}>
      <Stack.Screen name="SettingsHome" component={SettingsHome} />
      <Stack.Screen name="GeneralSettings" component={GeneralSettings} />
      <Stack.Screen
        name="NotificationsSettings"
        component={NotificationsSettings}
      />
      <Stack.Screen name="Blocking" component={Blocking} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="EventSettings" component={EventSettings} />
      <Stack.Screen name="ReferalSocialList" component={ReferalSocialList} />
      <Stack.Screen name="ReferalDashboard" component={ReferalDashboard} />
      <Stack.Screen name="Development" component={Development} />
    </Stack.Navigator>
  );
};

export default SettingsStack;
