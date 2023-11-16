import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet } from 'react-native';
import { COLORS } from '../Utilities/Colors';
import SVGIcon, { SVGIconProps } from '../Components/SVGIcon';
import { FONTS } from '../Utilities/Fonts';
import SubmitButton from '../Components/SubmitButton';
import StyledText from '../Components/StyledText';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import TextBox from '../Components/TextBox';




const validationSchema = Yup.object({
    email_id: Yup.string().email().required("Email is required"),
    name: Yup.string().required('Name is required'),
});


const PublicJoinEventCredentialModal = ({ isVisible, closeModal, onJoinMeeting }) => {
    const [email, setEmail] = useState('abc@gmail.com');
    const [name, setName] = useState('Hamas Khan');


    const { handleSubmit, handleChange, values, errors, touched } = useFormik({
        initialValues: {
            email_id: '',
            name: '',
        },
        validationSchema: validationSchema,
        onSubmit: values => {
            // setisLoading(true);
            console.log(values);
            handleJoinMeeting(values.email_id, values.name)

        },
    });

    const handleJoinMeeting = (email, name) => {
        onJoinMeeting(email, name);
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}

        >
            <View style={styles.modalContainer}>
                <View style={styles.subContainer}>


                    <View style={[styles.titleContainer]}>
                        <View style={{ width: '10%' }} />
                        <View style={styles.logoContainer}>

                            <SVGIcon icon="app_text_logo_colored" height={40} width={'75%'} />

                        </View>

                    </View>


                    <View style={{ paddingHorizontal: 15, paddingBottom: 15 }}>
                        <View style={styles.contentContainer}>
                            <StyledText
                                style={{ fontSize: 14, paddingVertical: 5 }} >
                                {"Enter Your Email And Name To Join This Meeting"}
                            </StyledText>
                        </View>

                        <TextBox
                            iconColor={COLORS.placeHolderColor}
                            placeHolder="Email address"
                            title="Email"
                            onChangeText={handleChange('email_id')}
                            errorText={
                                errors.email_id && touched.email_id ? errors.email_id : ''
                            }
                            value={values.email_id}
                        />
                        <TextBox
                            iconColor={COLORS.placeHolderColor}
                            placeHolder="User Name"
                            title="Name"
                            onChangeText={handleChange('name')}
                            errorText={
                                errors.name && touched.name ? errors.name : ''
                            }
                            value={values.name}
                        />

                        <View style={styles.buttonsContainer}>
                            <SubmitButton
                                buttonText={"JOIN MEETING"}
                                marginTop={10}
                                buttonTextStyle={{ fontSize: 14 }}
                                onPress={handleSubmit}
                            />

                            <SubmitButton
                                buttonText={"CANCEL"}
                                marginTop={10}
                                buttonTextStyle={{ fontSize: 14 }}
                                bgColor={COLORS.white}
                                textColor={COLORS.secondary}
                                onPress={closeModal}
                            />

                        </View>
                    </View>
                </View>
            </View>
        </Modal >
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.transparentDimColor,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'



    },
    subContainer: {
        backgroundColor: COLORS.white,
        width: '85%',
        borderRadius: 10,

    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 15,
        paddingHorizontal: 15,
        borderRadius: 10,

    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '70%',
    },
    titleText: {
        fontSize: 16,
        fontFamily: FONTS.DMSans.bold,
    },
    buttonsContainer: {
        paddingBottom: 10,
    },
    contentContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
});

export default PublicJoinEventCredentialModal;
