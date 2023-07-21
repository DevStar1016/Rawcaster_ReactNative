import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import ClaimAccount from '../Modals/ClaimAccount';
import Profile from '../Screens/MainScreens/ProfileDashboard/Profile';
import ProfileSeeAllUsersList from '../Screens/MainScreens/ProfileDashboard/ProfileSeeAllUsersList';
import MyFansChat from '../Modals/MyFansChat';
import StackAnimation from '../Utilities/StackAnimation';
import ReferalDashboard from '../Screens/MainScreens/Settings/Referal/ReferalDashboard';
import ReferalSocialList from '../Screens/MainScreens/Settings/Referal/ReferalSocialList';

const Stack = createStackNavigator();

const ProfileStack = ({route}) => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false, ...StackAnimation}}>
      <Stack.Screen
        name="Profile"
        component={Profile}
        initialParams={route.params}
      />
      <Stack.Screen
        name="ProfileSeeAllUsersList"
        component={ProfileSeeAllUsersList}
      />
      <Stack.Screen name="ClaimAccount" component={ClaimAccount} />
      <Stack.Screen name="MyFansChat" component={MyFansChat} />
      <Stack.Screen name="ReferalDashboard" component={ReferalDashboard} />
      <Stack.Screen name="ReferalSocialList" component={ReferalSocialList} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
