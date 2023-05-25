import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import ConnectionsGroupsTopTab from './ConnectionsGroupsTopTab';
import {useMyConnections} from '../../../Utilities/Contexts';
import GroupsList from '../../../Screens/MainScreens/User/GroupsList';
import ConnectionsList from '../../../Screens/MainScreens/User/ConnectionsList';

const Tab = createMaterialTopTabNavigator();

function ConnectionsGroupsTopTabNavigation() {
  const {setFocusedTab} = useMyConnections();

  return (
    <Tab.Navigator
      tabBar={props => <ConnectionsGroupsTopTab {...props} />}
      screenListeners={{
        focus: e => {
          if (e.target.includes('ConnectionsList')) {
            setFocusedTab(1);
          } else if (e.target.includes('GroupsList')) {
            setFocusedTab(2);
          }
        },
      }}>
      <Tab.Screen
        name="ConnectionsList"
        component={ConnectionsList}
        options={{
          title: 'User List',
        }}
      />
      <Tab.Screen
        name="GroupsList"
        component={GroupsList}
        options={{
          title: 'Group List',
        }}
      />
    </Tab.Navigator>
  );
}

export default ConnectionsGroupsTopTabNavigation;
