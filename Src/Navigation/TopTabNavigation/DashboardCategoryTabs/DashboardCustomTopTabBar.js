import {
  Animated,
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import {COLORS} from '../../../Utilities/Colors';
import {
  DIMENSIONS,
  IS_ENABLE_CHIME_FUNCTIONALITY,
} from '../../../Utilities/Constants';
import {FONTS} from '../../../Utilities/Fonts';
import {
  useInfluencerCategoryList,
  useInsets,
  useProfile,
  useToken,
} from '../../../Utilities/StoreData';
import {useEffect, useRef} from 'react';
import {useDashboardTopTabCategories} from '../../../Utilities/Contexts';
import SVGIcon from '../../../Components/SVGIcon';
import {useDispatch} from 'react-redux';
import {setIsOpenLoginAlert} from '../../../Store/Slices/UtilitySlice';
import {useNavigation} from '@react-navigation/native';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import Badges from '../../../Utilities/Badges';
import Toast from '../../../Components/Toast';
import LiveGif from '../../../Assets/Gif/live.gif';

function DashboardCustomTopTabBar({state, descriptors, navigation, position}) {
  const dispatch = useDispatch();
  const insets = useInsets();
  const profile = useProfile();
  const categoryList = useInfluencerCategoryList() ?? [];
  const mainNavigation = useNavigation();
  const token = useToken();
  const scrollViewRef = useRef(null);
  const {setheaderContainerHeight} = useDashboardTopTabCategories();

  useEffect(() => {
    scrollViewRef.current.scrollTo({x: state.index * 50, y: 0, animated: true});
  }, [state.index]);

  /**
   * Checks if a user is logged in by verifying the presence of a token.
   * If the user is not logged in, it dispatches an action to set the isOpenLoginAlert state to true.
   * @returns {boolean} - true if the user is logged in, false otherwise.
   */
  const isLogin = () => {
    if (token) {
      return true;
    }
    dispatch(setIsOpenLoginAlert(true));
  };

  return (
    <View
      onLayout={e => {
        setheaderContainerHeight(e.nativeEvent.layout.height);
      }}
      style={[
        styles.mainContainer,
        {top: insets.top ? insets.top : StatusBar.currentHeight},
      ]}>
      <TouchableOpacity disabled style={{marginRight: 10}}>
        <SVGIcon icon="app_logo_white" height={30} width={30} />
      </TouchableOpacity>
      <ScrollView
        style={{
          flexGrow: 1,
          flex: 1,
          paddingVertical: 10,
        }}
        onContentSizeChange={() => {
          console.log('TESTTTT');
          // scrollViewRef?.current?.scrollTo({
          //   x: state.routes.length * 50,
          //   y: 0,
          //   animated: true,
          // });
        }}
        showsHorizontalScrollIndicator={false}
        horizontal
        ref={list => (scrollViewRef.current = list)}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // The `merge: true` option makes sure that the params inside the tab screen are preserved
              navigation.navigate({name: route.name, merge: true});
            }
          };

          const inputRange = state.routes.map((_, i) => i);
          const alteropacity = position.interpolate({
            inputRange,
            outputRange: inputRange.map(i => (i === index ? 0 : 1)),
          });

          return (
            <TouchableOpacity
              key={index.toString()}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabButton}>
              <Animated.View>
                <Animated.Text
                  style={[styles.label, {color: COLORS.secondary}]}>
                  {label}
                </Animated.Text>
              </Animated.View>
              <Animated.View
                style={{
                  position: 'absolute',
                  right: 0,
                  left: 0,
                  bottom: 0,
                  top: 0,
                }}>
                <Animated.Text
                  style={[
                    styles.label,
                    {opacity: alteropacity, color: COLORS.white},
                  ]}>
                  {label}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View
        style={{flexDirection: 'row', marginLeft: 10, alignItems: 'center'}}>
        <SVGIcon
          icon="search"
          isButton
          onPress={() => {
            if (isLogin()) {
              mainNavigation.navigate('GlobalSearchStack');
            }
          }}
        />
        {IS_ENABLE_CHIME_FUNCTIONALITY && (
          <TouchableOpacity
            onPress={() => {
              if (isLogin()) {
              }
            }}
            activeOpacity={0.7}
            style={styles.gifContainer}>
            <Image source={LiveGif} style={styles.gif} />
          </TouchableOpacity>
        )}
        <ProfileWithBadge
          profileImage={profile?.profile_image}
          profileSize={28}
          extraMargin={0}
          padding={0}
          badge={Badges(profile?.user_status_id)}
          badgeSize={15}
          badgeContainerStyle={{right: -5, bottom: -2}}
          containerStyle={{marginLeft: 5, marginRight: 0}}
          isButton
          onPressProfile={() => {
            if (isLogin()) {
              mainNavigation.navigate('ProfileStack');
            }
          }}
        />
      </View>
    </View>
  );
}

export default DashboardCustomTopTabBar;

const styles = StyleSheet.create({
  mainContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  tabButton: {
    width: 'auto',
    borderColor: COLORS.transparent,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingRight: 0,
    paddingLeft: 0,
    marginHorizontal: 10,
  },
  label: {
    fontFamily: FONTS.DMSans.medium,
    fontSize: 14,
  },
  gifContainer: {
    height: 28,
    width: 28,
    marginLeft: 5,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
  },
  gif: {
    height: 28,
    width: 28,
    borderRadius: 14,
  },
});
