import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import DashboardWithCategory from '../../../Screens/MainScreens/HomeScreen/DashboardWithCategory';
import {COLORS} from '../../../Utilities/Colors';
import {FONTS} from '../../../Utilities/Fonts';
import {StatusBar, View} from 'react-native';
import {
  useInfluencerCategoryList,
  useInsets,
  useToken,
} from '../../../Utilities/StoreData';
import {DashboardCategoryTopTabContext} from '../../../Utilities/Contexts';
import {useState} from 'react';
import CustomHomeHeader from '../../../Components/CustomHomeHeader';

const Tab = createMaterialTopTabNavigator();

function DashboardTopTabNavigation() {
  const insets = useInsets();
  const categoryList = useInfluencerCategoryList();
  const token = useToken();
  const [
    headerRightButtonsContainerWidth,
    setheaderRightButtonsContainerWidth,
  ] = useState(0);
  const [headerLeftButtonContainerWidth, setheaderLeftButtonContainerWidth] =
    useState(0);
  const [headerContainerHeight, setheaderContainerHeight] = useState(0);

  const categoriesListData = {
    headerContainerHeight,
    setheaderContainerHeight,
  };

  return (
    <DashboardCategoryTopTabContext.Provider value={categoriesListData}>
      {token && (
        <View
          onLayout={e => {
            setheaderContainerHeight(e.nativeEvent.layout.height);
          }}
          style={{
            position: 'absolute',
            top: insets.top ? insets.top : StatusBar.currentHeight,
            left: 0,
            right: 0,
            zIndex: 1,
          }}>
          <CustomHomeHeader
            bgColor={COLORS.transparent}
            onLeftContainerLayout={setheaderLeftButtonContainerWidth}
            onRightContainerLayout={setheaderRightButtonsContainerWidth}
            // isEnableNuggetFilterTabs
            // selectedTab={selectedFilterTab === 1 ? 'first' : 'second'}
            // onPressFirstFilterTab={() => {
            //   if (selectedFilterTab !== 1) {
            //     setselectedFilterTab(1);
            //     dispatch(setNuggetFilterType(1));
            //     resetViewabilityItem();
            //   }
            // }}
            // onPressSecondFilterTab={() => {
            //   if (selectedFilterTab !== 0) {
            //     setselectedFilterTab(0);
            //     dispatch(setNuggetFilterType(0));
            //     resetViewabilityItem();
            //   }
            // }}
          />
        </View>
      )}
      <Tab.Navigator
        initialRouteName="ForYou"
        screenOptions={{
          tabBarIndicatorStyle: {
            backgroundColor: COLORS.transparent,
          },
          tabBarScrollEnabled: true,
          tabBarActiveTintColor: COLORS.secondary,
          tabBarInactiveTintColor: COLORS.white,
          tabBarStyle: {
            borderWidth: 0,
            elevation: 0,
            position: 'absolute',
            left: headerLeftButtonContainerWidth + 20,
            right: headerRightButtonsContainerWidth + 20,
            top: insets.top ? insets.top : StatusBar.currentHeight,
            alignItems: 'center',
            backgroundColor: COLORS.transparent,
          },
          tabBarItemStyle: {
            borderColor: COLORS.transparent,
            borderWidth: 0,
            paddingHorizontal: 0,
            paddingRight: 0,
            paddingLeft: 0,
          },
          tabBarLabelStyle: {
            textTransform: 'capitalize',
            fontFamily: FONTS.DMSans.bold,
            fontSize: 13,
          },
        }}
        //   screenListeners={{
        //     focus: e => {
        //       if (e.target.includes('ConnectionsList')) {
        //         setFocusedTab(1);
        //       } else if (e.target.includes('GroupsList')) {
        //         setFocusedTab(2);
        //       }
        //     },
        //   }}
      >
        {categoryList.map(item => {
          return (
            <Tab.Screen
              key={item.id.toString()}
              name={item.name}
              component={DashboardWithCategory}
              options={{
                title: item.name,
              }}
              initialParams={{
                categoryType: item.id,
                categoryName: item.name?.split(' ').join(''),
                filterType: 0,
              }}
            />
          );
        })}

        <Tab.Screen
          name="Influencing"
          component={DashboardWithCategory}
          options={{
            title: 'Influencing',
          }}
          initialParams={{filterType: 1, categoryName: 'influencing'}}
        />
        <Tab.Screen
          name="ForYou"
          component={DashboardWithCategory}
          options={{
            title: 'For You',
          }}
          initialParams={{filterType: 0, categoryName: 'forYou'}}
        />
      </Tab.Navigator>
    </DashboardCategoryTopTabContext.Provider>
  );
}

export default DashboardTopTabNavigation;
