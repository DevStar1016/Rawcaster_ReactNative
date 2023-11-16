import { BackHandler, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import HOCView from '../../../../Components/HOCView';
import { COLORS } from '../../../../Utilities/Colors';
import {
    MeetingEvent,
    Meeting,
    MeetingEmitter,
} from '../../../../Native/Bridges/ChimeMeetingBridge';
import { useNavigation } from '@react-navigation/native';
import { useProfile, useToken } from '../../../../Utilities/StoreData';
import Toast from '../../../../Components/Toast';
import { endMeeting } from '../../../../Services/ApiService';
import { getSlicedText } from '../../../../Utilities/Methods';
import { EVENT_TYPE } from '../../../../Utilities/Constants';
import { joinEventRoom, joinRequest, meetingEndAlert, userLeft } from '../../../../Services/ChimeSocket/ChimeSocketRequests';
import { useDispatch, useSelector } from 'react-redux';
import { setExistFromHost } from '../../../../Store/Slices/MeetingExitSlice';
import MeetingUITalkShow from '../../../../Components/Meeting/MeetingUITalkshow';

var isMount = true;
var onMeetingStartSubscription = undefined;
var onMeetingEndSubscription = undefined;
var onErrorSubscription = undefined;

const TalkShowHostScreen = ({ route }) => {
    const navigation = useNavigation();
    const profile = useProfile();
    const dispatch = useDispatch();

    const meetingExit = useSelector((state) => state.meeting_exit_slice.value);
    const {
        meetingData,
        attendeeData,
        eventType,
        meetingSetting,
        requestsList,
        usersList,
    } = route.params ?? {};
    const token = useToken();
    const [loaderData, setloaderData] = useState({
        status: true,
        //text: 'Meeting being started',
        text: 'Starting meeting. Please wait...',
    });
    const [isInMeeting, setisInMeeting] = useState(false);
    const [isKicked, setisKicked] = useState(false);

    useEffect(() => {
        console.log("talkshow_meeting_data   " + JSON.stringify(meetingData) + "   ", "attendi_data   " + JSON.stringify(attendeeData));
        isMount = true;

        let abc = { ...attendeeData };
        // abc.ExternalUserId = '11111222';
        Meeting.start(meetingData, attendeeData);
        return () => {
            isMount = false;
        };
    }, []);

    // User will not be back with physical back actions. So that will restricted with this.
    useEffect(() => {
        const backAction = () => {
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => {
            backHandler.remove();
        };
    }, []);

    // Chime Meeting SDK - Meeting Start, Stop and Error Listeners
    useEffect(() => {
        /**
         * Subscribe to the "onStart" event of the MeetingEmitter to perform actions when a meeting starts.
         * @param {function} callback - The callback function to be executed when the meeting starts.
         * @returns None
         */
        onMeetingStartSubscription = MeetingEmitter.addListener(
            MeetingEvent.onStart,
            () => {
                if (isMount) {
                    setisInMeeting(true);
                    stopLoader();
                    console.log('meeting_started');
                    // console.log('meeting_started_here' + profile.user_id + " meeting", meetingSetting);
                    // if (meetingSetting.created_by == profile?.user_id) {
                    joinEventRoom({
                        refId: meetingSetting.ref_id,
                        userId: profile?.user_id,
                        userRefId: profile?.user_ref_id,

                    });

                }
            },
        );

        /**
         * Subscribe to the "onEnd" event emitted by the MeetingEmitter when a meeting ends.
         * Perform necessary actions such as updating the meeting status, stopping the loader,
         * notifying other users, displaying appropriate toast messages, and navigating back.
         * @returns None
         */
        onMeetingEndSubscription = MeetingEmitter.addListener(
            MeetingEvent.onEnd,
            () => {

                if (isMount) {
                    setisInMeeting(false);
                    stopLoader();
                }
                console.log('saqiiiiii', attendeeData);
                console.log('meeting_exist', meetingExit);
                if (!meetingExit) {
                    meetingEndAlert({
                        userId: profile.user_id,
                        refId: meetingSetting.ref_id,
                    });
                }

                //Meeting.stop();
                // Meeting.stop();
                // handleEndMeeting(true);


                // userLeft({
                //     user_id: profile.user_id,
                //     meetingId: meetingData.MeetingId,
                //     user_name: getSlicedText(profile.name, 18),
                // });
                if (isKicked) {
                    Toast.fail('You are removed from the meeting by host.');
                } else {
                    Toast.success('Meeting has been ended');
                }
                navigation.goBack();
            },
        );

        /**
         * Subscribe to the onError event emitted by the MeetingEmitter.
         * When an error occurs during a meeting, this callback function will be executed.
         * It updates the isInMeeting state to false, stops the loader, displays an error toast message,
         * and navigates back to the previous screen.
         * @param {Function} message - The error message received from the MeetingEmitter.
         * @returns None
         */
        onErrorSubscription = MeetingEmitter.addListener(
            MeetingEvent.onError,
            message => {
                if (isMount) {
                    setisInMeeting(false);
                    stopLoader();
                }
                if (message) {
                    Toast.fail(message.toString());
                }
                navigation.goBack();
            },
        );

        return () => {
            if (onMeetingEndSubscription) {
                onMeetingEndSubscription.remove();
            }
            if (onMeetingStartSubscription) {
                onMeetingStartSubscription.remove();
            }
            if (onErrorSubscription) {
                onErrorSubscription.remove();
            }
        };
    }, [isKicked]);

    const startLoader = (message = '') => {
        if (isMount) {
            setloaderData({
                status: true,
                text: message,
            });
        }
    };

    const stopLoader = () => {
        if (isMount) {
            setloaderData({
                status: false,
                text: '',
            });
        }
    };

    /**
     * Handles the process of ending a meeting.
     * @returns None
     */
    const handleEndMeeting = () => {
        // startLoader('Meeting being ended');
        startLoader('Ending meeting. Please wait...');
        if (isMount) {
            setloaderData({
                status: true,
                text: 'Ending meeting. Please wait...',
            });
        }
        const formData = new FormData();
        formData.append('token', token);
        formData.append('meeting_id', meetingData.MeetingId);
        endMeeting(formData)
            .then(res => {
                if (res.data.status === 1) {
                    Meeting.stop();
                    meetingEndAlert({
                        userId: profile.user_id,
                        refId: meetingSetting.ref_id,
                    });
                } else if (res.data.status === 0) {
                    Toast.fail(res.data.msg);
                    stopLoader();
                }
            })
            .catch(e => {
                Toast.fail(e.message);
                stopLoader();
            });
    };

    // If it is Talkshow then the header will be different. So this will return the header props according to the event type
    const talkshowHeaderProps = () => {
        if (eventType === EVENT_TYPE.talkshow) {
            return {
                rightButtonType: 'text',
                rightButtonText: 'Talkshow',
                rightTextButtonLeftIcon: 'record_white',
                isEnableRightIcon: true,
                rightTextButtonStyle: {
                    flexDirection: 'row',
                    alignItems: 'center',
                },
            };
        }
        return {
            isEnableRightIcon: true,
            rightIconSize: 23,
            rightIcon: 'switch_camera',
            onPressRightIcon: () => {
                Meeting.switchCamera();
            },
        };
    };

    return (
        <HOCView
            backHeaderProps={{
                title: getSlicedText(meetingSetting?.title, 20),
                bgColor: COLORS.transparent,
                isTitleCenter: true,
                isEnableBackButton: eventType === EVENT_TYPE.talkshow,
                backIcon: 'switch_camera',
                backIconSize: 23,
                backIconMarginLeft: 15,
                onPressBack: () => {
                    Meeting.switchCamera();
                },
                ...talkshowHeaderProps(),
            }}
            isLoading={loaderData.status}
            loaderProps={{
                loaderText: loaderData.text,
            }}
            isEnableRLogo={false}
            isEnableDefaultBackground
            paddingHorizontal={0}>
            {isInMeeting && (
                // This is the Meeting UI If the Meeting Started then this component will be rendered
                <MeetingUITalkShow
                    eventType={eventType}
                    handleEndMeeting={isEnd => {
                        if (isEnd) {
                            console.log('zzzzzzz');
                            console.log('meeting_should_end_only');

                            handleEndMeeting();
                        } else {
                            console.log('yyyyyyy');
                            console.log('meeting_should_stop_only');
                            Meeting.stop();
                            // handleEndMeeting();
                            // handleExitMeeting();
                        }
                    }}
                    handleExitMeeting={isKicked => {
                        if (isMount) {
                            console.log('this one called user_id', profile.user_id);
                            setisKicked(isKicked);

                            // dispatch(setExistFromHost(false));

                        }
                        Meeting.stop();
                    }}
                    selfAttendeeId={attendeeData.AttendeeId}
                    membersList={usersList}
                    eventSettings={meetingSetting}
                    requestsList={requestsList}
                />
            )}
        </HOCView>
    );
};

export default TalkShowHostScreen;
