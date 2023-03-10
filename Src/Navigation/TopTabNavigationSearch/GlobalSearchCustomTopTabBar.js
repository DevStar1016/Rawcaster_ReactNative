import {Animated, View, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS} from '../../Utilities/Colors';
import {DIMENSIONS} from '../../Utilities/Constants';
import {FONTS} from '../../Utilities/Fonts';

function GlobalSearchCustomTopTabBar({
  state,
  descriptors,
  navigation,
  position,
}) {
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

        return (
          <TouchableOpacity
            key={index.toString()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              styles.tabButton,
              {
                backgroundColor: isFocused ? COLORS.primary : COLORS.white,
              },
            ]}>
            <Animated.Text
              style={[
                styles.label,
                {color: isFocused ? COLORS.white : COLORS.primary},
              ]}>
              {label}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default GlobalSearchCustomTopTabBar;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
    paddingHorizontal: 15,
    height: 50,
    alignItems: 'center',
    borderBottomColor: COLORS.borderColor,
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 10,
    width: (DIMENSIONS.window.width - 50) / 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONTS.DMSans.medium,
    fontSize: 14,
  },
});
