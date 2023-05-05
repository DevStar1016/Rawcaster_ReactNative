import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import StyledText from '../Components/StyledText';
import SVGIcon from '../Components/SVGIcon';
import TextBox from '../Components/TextBox';
import SubmitButton from '../Components/SubmitButton';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';
import {useFormik} from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object().shape({
  email: yup.string().email('Enter valid Email').required('Required'),
});

const InviteFanModal = ({setModal, onSubmit}) => {
  const {handleSubmit, handleChange, values, errors, touched} = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      onSubmit(values.email);
    },
  });

  return (
    <View style={styles.mainContainer}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'handled'}
        style={{flexGrow: 0}}
        contentContainerStyle={{
          justifyContent: 'center',
          paddingVertical: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.subContainer}>
          <View style={styles.titleContainer}>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <StyledText style={styles.titleText}>Invite Fans</StyledText>
            </View>
            <SVGIcon
              icon="close_rounded_black"
              isButton
              height={20}
              width={20}
              onPress={() => {
                setModal(false);
              }}
            />
          </View>

          <TextBox
            title="Invite your friends via email"
            placeHolder="Your friend's email..."
            value={values.email}
            errorText={errors.email && touched.email ? errors.email : ''}
            onChangeText={handleChange('email')}
          />
          <SubmitButton
            buttonText="SUBMIT"
            marginTop={5}
            onPress={() => {
              handleSubmit();
            }}
          />
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default InviteFanModal;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: COLORS.transparentDimColor,
  },
  subContainer: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 15,
  },
});
