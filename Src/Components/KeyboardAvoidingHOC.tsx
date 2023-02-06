import {KeyboardAvoidingView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {IS_IOS} from '../Utilities/Constants';

type Props = {
  children: JSX.Element | JSX.Element[];
};

const KeyboardAvoidingHOC = ({children}: Props) => {
  return (
    <KeyboardAvoidingView
      style={{flexGrow: 1}}
      behavior={IS_IOS ? 'padding' : undefined}
      keyboardVerticalOffset={20}>
      {children}
    </KeyboardAvoidingView>
  );
};

export default KeyboardAvoidingHOC;

const styles = StyleSheet.create({});
