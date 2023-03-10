import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const Events = () => {
  return (
    <View style={styles.mainContainer}>
      <Text>Events under development</Text>
    </View>
  );
};

export default Events;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
