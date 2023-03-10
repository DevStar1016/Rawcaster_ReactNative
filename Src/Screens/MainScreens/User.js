import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const User = () => {
  return (
    <View style={styles.mainContainer}>
      <Text>User under development</Text>
    </View>
  );
};

export default User;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
