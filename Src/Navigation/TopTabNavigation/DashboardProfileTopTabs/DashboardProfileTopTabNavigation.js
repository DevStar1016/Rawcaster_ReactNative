import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import BottomTabNavigation from '../../BottomTabNavigation';
import ProfileStack from '../../../Stacks/ProfileStack';
import DefaultBackground from '../../../Components/DefaultBackground';
import {DashboardProfileContext} from '../../../Utilities/Contexts';
import {useEffect, useState} from 'react';

const Tab = createMaterialTopTabNavigator();

function DashboardProfileTopTabNavigation() {
  const [swipeEnabled, setswipeEnabled] = useState(true);
  const [focusedNuggetUserId, setfocusedNuggetUserId] = useState(null);

  const value = {
    setswipeEnabled,
    focusedNuggetUserId,
    setfocusedNuggetUserId,
  };

  return (
    <DashboardProfileContext.Provider value={value}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            display: 'none',
          },
          swipeEnabled,
          lazy: true,
          lazyPlaceholder: () => <DefaultBackground />,
        }}>
        <Tab.Screen
          name="BottomTabNavigationAfterLogin"
          component={BottomTabNavigation}
          options={{
            title: '',
          }}
        />
        <Tab.Screen
          name="SwipeableProfileStack"
          component={ProfileStack}
          options={{
            title: '',
          }}
        />
      </Tab.Navigator>
    </DashboardProfileContext.Provider>
  );
}

export default DashboardProfileTopTabNavigation;
