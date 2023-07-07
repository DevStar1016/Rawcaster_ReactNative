import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useDispatch} from 'react-redux';

import GlobalSearchCustomTopTabBar from './GlobalSearchCustomTopTabBar';

import NuggetsSearch from '../../../Screens/MainScreens/GlobalSearch/NuggetsSearch';
import EventsSearchStack from '../../../Stacks/EventsSearchStack';
import TagsSearch from '../../../Screens/MainScreens/GlobalSearch/TagsSearch';
import ProfileSearch from '../../../Screens/MainScreens/GlobalSearch/ProfileSearch';
import {useGlobalSearch} from '../../../Utilities/Contexts';

const Tab = createMaterialTopTabNavigator();

function GlobalSearchTopTabNavigation() {
  const {setFocusedTab} = useGlobalSearch();

  return (
    <Tab.Navigator
      tabBar={props => <GlobalSearchCustomTopTabBar {...props} />}
      screenOptions={{swipeEnabled: false}}
      screenListeners={{
        focus: e => {
          if (e.target.includes('ProfileSearch')) {
            setFocusedTab('Profile');
          } else if (e.target.includes('NuggetsSearch')) {
            setFocusedTab('Nuggets');
          } else if (e.target.includes('EventsSearch')) {
            setFocusedTab('Events');
          } else if (e.target.includes('TagsSearch')) {
            setFocusedTab('#Tags');
          }
        },
      }}>
      <Tab.Screen
        name="ProfileSearch"
        component={ProfileSearch}
        options={{title: 'Profile'}}
      />
      <Tab.Screen
        name="NuggetsSearch"
        component={NuggetsSearch}
        options={{title: 'Nuggets'}}
      />
      <Tab.Screen
        name="EventsSearchStack"
        component={EventsSearchStack}
        options={{title: 'Events'}}
      />
      <Tab.Screen
        name="TagsSearch"
        component={TagsSearch}
        options={{title: '#Tags'}}
      />
    </Tab.Navigator>
  );
}

export default GlobalSearchTopTabNavigation;
