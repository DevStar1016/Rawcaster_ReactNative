import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import ClaimAccount from '../Modals/ClaimAccount';
import Profile from '../Screens/MainScreens/ProfileDashboard/Profile';
import ProfileSeeAllUsersList from '../Screens/MainScreens/ProfileDashboard/ProfileSeeAllUsersList';
import MyFansChat from '../Modals/MyFansChat';

const Stack = createStackNavigator();

const ProfileStack = ({route}) => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
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
    </Stack.Navigator>
  );
};

export default ProfileStack;
