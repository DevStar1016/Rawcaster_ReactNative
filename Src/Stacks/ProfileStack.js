import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import ClaimAccount from '../Modals/ClaimAccount';
import Profile from '../Screens/MainScreens/ProfileDashboard/Profile';
import ProfileSeeAllUsersList from '../Screens/MainScreens/ProfileDashboard/ProfileSeeAllUsersList';
import InfluencerChat from '../Modals/InfluencerChat';

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
      <Stack.Screen name="InfluencerChat" component={InfluencerChat} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
