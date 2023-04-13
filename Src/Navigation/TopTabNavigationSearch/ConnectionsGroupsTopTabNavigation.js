import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ConnectionsListStack from '../../Stacks/ConnectionsListStack';
import GroupsListStack from '../../Stacks/GroupsListStack';
import {useMyConnections} from '../../Utilities/Contexts';
import ConnectionsGroupsTopTab from './ConnectionsGroupsTopTab';

const Tab = createMaterialTopTabNavigator();

function ConnectionsGroupsTopTabNavigation() {
  const {setFocusedTab} = useMyConnections();

  return (
    <Tab.Navigator
      tabBar={props => <ConnectionsGroupsTopTab {...props} />}
      screenListeners={{
        focus: e => {
          if (e.target.includes('ConnectionsListStack')) {
            setFocusedTab(1);
          } else if (e.target.includes('GroupsListStack')) {
            setFocusedTab(2);
          }
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
