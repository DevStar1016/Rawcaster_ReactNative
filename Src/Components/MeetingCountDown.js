import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../Utilities/Colors';
import { FONTS } from '../Utilities/Fonts';
import StyledText from './StyledText';

const MeetingCountDown = ({ initialTimeInMilliseconds, onTimeFinish }) => {
    const [time, setTime] = useState(initialTimeInMilliseconds / 1000);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (time > 0) {
                setTime(time - 1);
            } else {
                clearInterval(intervalId);
                if (onTimeFinish) {
                    onTimeFinish();
                }
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [time]);

    // Helper function to format the time as "MM:SS"
    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    };

    return (
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <StyledText style={styles.timerText}>
                {formatTime(time)} mins
            </StyledText>
            {/* <Text style={[{ textAlignVertical: 'center', textAlign: 'center', color: COLORS.white, padding: 0 }]} >{formatTime(time)} mins</Text> */}
        </View>
    );
};

export default MeetingCountDown;

const styles = StyleSheet.create({
    timerText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.DMSans.bold,
        alignSelf: 'center',
        paddingVertical: 5,
    },
});
