import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ConnectionsNotifications from '../../../Screens/MainScreens/Notifications/ConnectionsNotifications';
import EventsNotifications from '../../../Screens/MainScreens/Notifications/EventsNotifications';
import FansNotifications from '../../../Screens/MainScreens/Notifications/FansNotifications';
import GroupsNotifications from '../../../Screens/MainScreens/Notifications/GroupsNotifications';
import NuggetsNotifications from '../../../Screens/MainScreens/Notifications/NuggetsNotifications';
import PollResultsNotifications from '../../../Screens/MainScreens/Notifications/PollResultsNotifications';
import {COLORS} from '../../../Utilities/Colors';
import {FONTS} from '../../../Utilities/Fonts';
import {useNotications} from '../../../Utilities/Contexts';

const Tab = createMaterialTopTabNavigator();

function NotificationsTopTabNavigation() {
  const {setFocusedTab} = useNotications();
  return (
    <Tab.Navigator
      sceneContainerStyle={{backgroundColor: COLORS.transparent}}
      screenListeners={{
        focus: e => {
          if (e.target.includes('Nuggets')) {
            setFocusedTab(1);
          } else if (e.target.includes('Events')) {
            setFocusedTab(2);
          } else if (e.target.includes('ConnectionsNotifications')) {
            setFocusedTab(3);
          } else if (e.target.includes('GroupsNotifications')) {
            setFocusedTab(4);
          } else if (e.target.includes('FansNotifications')) {
            setFocusedTab(5);
          } else if (e.target.includes('PollResults')) {
            setFocusedTab(6);
          }
        },
      }}
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
        },
        tabBarLabelStyle: {
          textTransform: 'capitalize',
          fontFamily: FONTS.DMSans.bold,
          fontSize: 15,
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
      <Tab.Screen
        name="Events"
        component={EventsNotifications}
        options={{
          title: 'Events',
        }}
      />
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
