import React, {Component} from 'react';
import {View, Text, ScrollView, Animated, StyleSheet} from 'react-native';

class TextScroll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollY: new Animated.Value(0),
    };
  }

  render() {
    const headerHeight = this.state.scrollY.interpolate({
      inputRange: [0, 200],
      outputRange: [200, 100],
      extrapolate: 'clamp',
    });

    return (
      <View style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.container}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
            {useNativeDriver: false},
          )}
          scrollEventThrottle={16}>
          {/* Scrollable content below the header */}
          <View style={styles.content}>
            <Text>{this.props.text}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 20,
  },
  content: {
    padding: 16,
  },
});

export default TextScroll;
