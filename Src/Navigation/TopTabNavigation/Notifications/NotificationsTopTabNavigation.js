import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ConnectionsNotifications from '../../../Screens/MainScreens/Notifications/ConnectionsNotifications';
import EventsNotifications from '../../../Screens/MainScreens/Notifications/EventsNotifications';
import FansNotifications from '../../../Screens/MainScreens/Notifications/FansNotifications';
import GroupsNotifications from '../../../Screens/MainScreens/Notifications/GroupsNotifications';
import NuggetsNotifications from '../../../Screens/MainScreens/Notifications/NuggetsNotifications';
import PollResultsNotifications from '../../../Screens/MainScreens/Notifications/PollResultsNotifications';
import {COLORS} from '../../../Utilities/Colors';
import {FONTS} from '../../../Utilities/Fonts';
import {
  DIMENSIONS,
  IS_ENABLE_CHIME_FUNCTIONALITY,
} from '../../../Utilities/Constants';

const Tab = createMaterialTopTabNavigator();

function NotificationsTopTabNavigation() {
  return (
    <Tab.Navigator
      sceneContainerStyle={{backgroundColor: COLORS.transparent}}
      screenOptions={{
        tabBarIndicatorStyle: {
          backgroundColor: COLORS.secondary,
        },
        tabBarScrollEnabled: true,
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: COLORS.placeHolderColor,
        tabBarStyle: {
          borderWidth: 0,
          elevation: 0,
          backgroundColor: COLORS.transparent,
        },
        tabBarItemStyle: {
          borderColor: COLORS.transparent,
          borderWidth: 0,
          width: 160,
        },
        tabBarLabelStyle: {
          textTransform: 'capitalize',
          fontFamily: FONTS.DMSans.bold,
          fontSize: 14,
        },
      }}>
      <Tab.Screen
        name="FansNotifications"
        component={FansNotifications}
        options={{
          title: 'Fans',
        }}
      />
      <Tab.Screen
        name="GroupsNotifications"
        component={GroupsNotifications}
        options={{
          title: 'Groups',
        }}
      />
      <Tab.Screen
        name="ConnectionsNotifications"
        component={ConnectionsNotifications}
        options={{
          title: 'Connections',
        }}
      />
      {IS_ENABLE_CHIME_FUNCTIONALITY && (
        <Tab.Screen
          name="Events"
          component={EventsNotifications}
          options={{
            title: 'Events',
          }}
        />
      )}
      <Tab.Screen
        name="Nuggets"
        component={NuggetsNotifications}
        options={{
          title: 'Nuggets',
        }}
      />
      <Tab.Screen
        name="PollResults"
        component={PollResultsNotifications}
        options={{
          title: 'Poll Results',
        }}
      />
    </Tab.Navigator>
  );
}

export default NotificationsTopTabNavigation;
