import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useDispatch} from 'react-redux';
import EventsSearch from '../../Screens/MainScreens/GlobalSearch/EventsSearch';
import NuggetsSearch from '../../Screens/MainScreens/GlobalSearch/NuggetsSearch';
import ProfileSearch from '../../Screens/MainScreens/GlobalSearch/ProfileSearch';
import TagsSearch from '../../Screens/MainScreens/GlobalSearch/TagsSearch';
import {setIsBottomTabBarAbsolute} from '../../Store/Slices/UtilitySlice';
import {useGlobalSearch} from '../../Utilities/Contexts';
import GlobalSearchCustomTopTabBar from './GlobalSearchCustomTopTabBar';
import EventsSearchStack from '../../Stacks/EventsSearchStack';

const Tab = createMaterialTopTabNavigator();

function GlobalSearchTopTabNavigation() {
  const {setFocusedTab} = useGlobalSearch();
  const dispatch = useDispatch();

  return (
    <Tab.Navigator
      tabBar={props => <GlobalSearchCustomTopTabBar {...props} />}
      screenOptions={{swipeEnabled: false}}
      screenListeners={{
        focus: e => {
          if (e.target.includes('ProfileSearch')) {
            // dispatch(setIsBottomTabBarAbsolute(false));
            setFocusedTab('Profile');
          } else if (e.target.includes('NuggetsSearch')) {
            // dispatch(setIsBottomTabBarAbsolute(true));
            setFocusedTab('Nuggets');
          } else if (e.target.includes('EventsSearch')) {
            // dispatch(setIsBottomTabBarAbsolute(false));
            setFocusedTab('Events');
          } else if (e.target.includes('TagsSearch')) {
            // dispatch(setIsBottomTabBarAbsolute(false));
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
