import {Animated, View, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS} from '../../Utilities/Colors';
import {DIMENSIONS} from '../../Utilities/Constants';
import {FONTS} from '../../Utilities/Fonts';
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
function ConnectionsGroupsTopTab({state, descriptors, navigation, position}) {
  return (
    <View style={styles.mainContainer}>
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

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const inputRange = state.routes.map((_, i) => i);
        const opacity = position.interpolate({
          inputRange,
          outputRange: inputRange.map(i => (i === index ? 1 : 0)),
        });
        const alteropacity = position.interpolate({
          inputRange,
          outputRange: inputRange.map(i => (i === index ? 0 : 1)),
        });

        return (
          <AnimatedTouchable
            key={index.toString()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tabButton]}>
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
                opacity: opacity,
                backgroundColor: COLORS.white,
              }}
            />
            <Animated.View style={styles.textContainer}>
              <Animated.Text
                style={[
                  styles.label,
                  {
                    color: COLORS.black,
                  },
                ]}>
                {label}
              </Animated.Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.textContainer,
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
              ]}>
              <Animated.Text
                style={[
                  styles.label,
                  {
                    opacity: alteropacity,
                    color: COLORS.white,
                  },
                ]}>
                {label}
              </Animated.Text>
            </Animated.View>
          </AnimatedTouchable>
        );
      })}
    </View>
  );
}

export default ConnectionsGroupsTopTab;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingBottom: 5,
    // paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 50,
    alignItems: 'center',
    borderBottomColor: COLORS.primaryDark,
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    borderRadius: 10,
    // paddingVertical: 10,
    // alignItems: 'center',
    marginHorizontal: 5,
    overflow: 'hidden',
    // justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONTS.DMSans.medium,
    fontSize: 14,
  },
});
