import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ConnectionsNotifications from '../../Screens/MainScreens/Notifications/ConnectionsNotifications';
import FansNotifications from '../../Screens/MainScreens/Notifications/FansNotifications';
import GroupsNotifications from '../../Screens/MainScreens/Notifications/GroupsNotifications';
import {COLORS} from '../../Utilities/Colors';
import {FONTS} from '../../Utilities/Fonts';

const Tab = createMaterialTopTabNavigator();

function NotificationsTopTabNavigation() {
  return (
    <Tab.Navigator
      sceneContainerStyle={{backgroundColor: COLORS.transparent}}
      screenOptions={{
        tabBarIndicatorStyle: {
          backgroundColor: COLORS.secondary,
        },
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
    </Tab.Navigator>
  );
}

export default NotificationsTopTabNavigation;
