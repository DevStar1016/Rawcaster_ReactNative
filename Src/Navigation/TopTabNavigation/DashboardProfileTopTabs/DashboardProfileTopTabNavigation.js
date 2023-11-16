import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import BottomTabNavigation from '../../BottomTabNavigation';
import ProfileStack from '../../../Stacks/ProfileStack';
import DefaultBackground from '../../../Components/DefaultBackground';
import { DashboardProfileContext } from '../../../Utilities/Contexts';
import { useState } from 'react';
import { useProfile, useToken } from '../../../Utilities/StoreData';

const Tab = createMaterialTopTabNavigator();

function DashboardProfileTopTabNavigation() {
  const [swipeEnabled, setswipeEnabled] = useState(true);
  const [focusedNuggetUserId, setfocusedNuggetUserId] = useState(null);

  const token = useToken();
  const profile = useProfile();

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
        {token ?
          <>
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
            /></> :
          <Tab.Screen
            name="BottomTabNavigationBeforeLogin"
            component={BottomTabNavigation}
            options={{
              title: '',
            }}
          />
        }
      </Tab.Navigator>
    </DashboardProfileContext.Provider>
  );
}

export default DashboardProfileTopTabNavigation;
