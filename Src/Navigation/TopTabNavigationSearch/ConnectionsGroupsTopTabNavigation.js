import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ConnectionsListStack from '../../Stacks/ConnectionsListStack';
import GroupsListStack from '../../Stacks/GroupsListStack';
import {COLORS} from '../../Utilities/Colors';
import ConnectionsGroupsTopTab from './ConnectionsGroupsTopTab';

const Tab = createMaterialTopTabNavigator();

function ConnectionsGroupsTopTabNavigation() {
  return (
    <Tab.Navigator
      tabBar={props => <ConnectionsGroupsTopTab {...props} />}
      // screenOptions={({route}) => ({
      //   tabBarStyle: {
      //     backgroundColor: 'rgba(255, 255, 255, 0.2)',
      //     padding: 5,
      //     // opacity: 0.1,
      //   },
      //   tabBarGap: 10,
      // })}
      screenListeners={{
        focus: e => {
          //   if (e.target.includes('ProfileSearch')) {
          //     // dispatch(setIsBottomTabBarAbsolute(false));
          //     setFocusedTab('Profile');
          //   } else if (e.target.includes('NuggetsSearch')) {
          //     // dispatch(setIsBottomTabBarAbsolute(true));
          //     setFocusedTab('Nuggets');
          //   } else if (e.target.includes('EventsSearch')) {
          //     // dispatch(setIsBottomTabBarAbsolute(false));
          //     setFocusedTab('Events');
          //   } else if (e.target.includes('TagsSearch')) {
          //     // dispatch(setIsBottomTabBarAbsolute(false));
          //     setFocusedTab('#Tags');
          //   }
        },
      }}>
      <Tab.Screen
        name="ConnectionsListStack"
        component={ConnectionsListStack}
        options={{
          title: 'User List',
        }}
      />
      <Tab.Screen
        name="GroupsListStack"
        component={GroupsListStack}
        options={{
          title: 'Group List',
        }}
      />
    </Tab.Navigator>
  );
}

export default ConnectionsGroupsTopTabNavigation;
