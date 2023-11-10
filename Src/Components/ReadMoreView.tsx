import {BackHandler, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import StyledText from './StyledText';
import {FONTS} from '../Utilities/Fonts';
import LoadingDots from './LoadingDots';

import {setIsOpenLoginAlert} from '../Store/Slices/UtilitySlice';
import {useDispatch} from 'react-redux';
import {useToken} from '../Utilities/StoreData';
import {
  useNuggetItemActions,
  useNuggetParentActions,
  useReadMoreTextNuggetContext,
} from '../Utilities/Contexts';
import {htmlDecodeText} from '../Utilities/Methods';

const ReadMoreView = (props: any) => {
  const {
    isTranslated,
    setisTranslated,
    setisVideoBackground,
    onPressUrl,
    getTranslatedContent,
    nuggetContentController,
    isReadLoading,
    setisReadLoading,
    setpaused,
    isTranslateLoading,
    nuggetContentAudioAPICall,
    nugget,
    isReadMuted,
    setisMuted,
    handleStopAudio,
    onPressBack,
  } = props ?? {};

  const dispatch = useDispatch();
  const token = useToken();

  const isLogin = () => {
    if (token) {
      return true;
    }
    if (setisVideoBackground) {
      setisVideoBackground(true);
    }
    dispatch(setIsOpenLoginAlert(true));
    return false;
  };

  useEffect(() => {
    const backAction = () => {
      onPressBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.titleContainer}>
        <View style={{width: '10%'}} />

        <View style={{width: '10%', paddingRight: 5}}>
          <SVGIcon
            icon="close_white"
            height={15}
            width={15}
            isButton
            onPress={() => {
              onPressBack();
            }}
          />
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          width: '95%',
          padding: 15,
          flexGrow: 0.95,
        }}>
        <StyledText
          textMode="read_more_hyper_link"
          isReadmoreEnable={false}
          onPressUrl={onPressUrl}
          style={{
            color: COLORS.white,
            // fontSize: 15.5,
            fontSize: 18,
            opacity: 0.8,
            lineHeight: 22,
            width: '100%',
          }}>
          {htmlDecodeText(
            isTranslated && nugget?.translated_content?.trim()
              ? nugget?.translated_content.trim()
              : nugget?.content.trim(),
          )}
        </StyledText>

        <View
          style={{
            alignItems: 'flex-start',
            flexDirection: 'row',
            marginVertical: 5,
            marginBottom: 15,
          }}>
          {isReadLoading ? (
            <LoadingDots size={6} bounceHeight={4} dots={3} borderRadius={3} />
          ) : (
            <SVGIcon
              // height={15.5}
              // height={17.5}
              height={20}
              icon={
                !isReadLoading
                  ? !isReadMuted
                    ? 'mic_fill_white'
                    : 'mic_off_fill_secondary'
                  : undefined
              }
              isButton
              onPress={() => {
                if (isLogin()) {
                  if (!isReadMuted) {
                    if (setpaused) {
                      setpaused(true);
                    }
                    if (setisMuted) {
                      setisMuted(true);
                    }

                    if (
                      nuggetContentController &&
                      nuggetContentController.current
                    ) {
                      nuggetContentController.current.abort();
                    }
                    setisReadLoading(true);
                    nuggetContentAudioAPICall();
                  } else {
                    if (handleStopAudio) {
                      handleStopAudio();
                    }
                  }
                }
              }}
            />
          )}
          <View
            style={{
              width: 2,
              height: 20,
              marginHorizontal: 5,
              backgroundColor: COLORS.white,
            }}
          />
          {isTranslateLoading ? (
            <LoadingDots size={6} bounceHeight={4} dots={3} borderRadius={3} />
          ) : (
            <SVGIcon
              // height={15.5}
              // height={17.5}
              height={20}
              icon={
                !isTranslateLoading
                  ? isTranslated
                    ? 'translation_secondary'
                    : 'translation_white'
                  : undefined
              }
              isButton
              onPress={() => {
                if (isLogin()) {
                  if (isTranslated) {
                    setisTranslated(false);
                  } else {
                    getTranslatedContent();
                  }
                }
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ReadMoreView;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.commentsBg,
    borderTopEndRadius: 25,
    borderTopStartRadius: 25,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontFamily: FONTS.DMSans.bold,
    color: COLORS.white,
    fontSize: 16,
  },
  commentsListContainer: {
    paddingHorizontal: 15,
    flex: 1,
    justifyContent: 'flex-end',
  },

  bottomContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});
