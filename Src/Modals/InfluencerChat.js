import React from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import HOCView from '../Components/HOCView';
import {COLORS} from '../Utilities/Colors';
import SubmitButton from '../Components/SubmitButton';
import SVGIcon from '../Components/SVGIcon';
import {getSlicedText} from '../Utilities/Methods';
import ProfileWithBadge from '../Components/ProfileWithBadge';
import Badges from '../Utilities/Badges';
import {DIMENSIONS} from '../Utilities/Constants';
import {FONTS} from '../Utilities/Fonts';

const InfluencerChat = ({navigation, route}) => {
  const {influencerId, influencerName} = route.params ?? {};
  return (
    <HOCView
      //   isLoading={isLoading}
      keyboardAwareContentContainerStyle={{flexGrow: 1}}
      paddingHorizontal={5}
      backHeaderProps={{
        bgColor: COLORS.transparent,
        title: `Send message to ${influencerName}`,
        isEnableBackButton: false,
        isTitleCenter: true,
        isEnableRightIcon: true,
        rightIcon: 'close_white',
        onPressRightIcon: () => {
          navigation.goBack();
        },
      }}
      isEnableDefaultBackground>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.mainContainer}
        onPress={() => {
          // openCloseEmojiPicker(false);
          Keyboard.dismiss();
        }}>
        <View>
          <View style={styles.topContainer}>
            {/* <View style={styles.subContainer}>
              <ProfileWithBadge
                badge={Badges(profile.user_status_id)}
                isEnableGradient={false}
                profileImage={profile.profile_image}
                padding={0}
                profileSize={38}
                badgeSize={16}
              />
              <View style={styles.nameContainer}>
                <StyledText style={styles.nameText}>
                  {getSlicedText(profile.name, 10)}
                </StyledText>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <SubmitButton
                    buttonText={getSlicedText(selectedShareType.name, 10)}
                    marginTop={2}
                    iconSize={9}
                    textMarginLeftWhenIcon={2}
                    textMarginRightWhenIcon={2}
                    buttonTextStyle={{fontSize: 10}}
                    paddingHorizontal={3}
                    paddingVertical={0}
                    marginBottom={0}
                    rightIcon={'down_fill_white'}
                    rightIconSize={7}
                    icon="lock_fill_white"
                    marginHorizontal={0}
                    padding={0}
                    bgColor={COLORS.orange}
                    borderColor={COLORS.orange}
                    onPress={() => {
                      if (isMount) {
                        setisOpenSharTypeList(true);
                      }
                    }}
                  />
                  {(selectedShareType.id === 3 ||
                    selectedShareType.id === 4) && (
                    <SVGIcon
                      icon="edit"
                      height={13}
                      width={13}
                      marginLeft={10}
                      isButton
                      onPress={() => {
                        setisOpenSelectionModal(true);
                      }}
                    />
                  )}
                </View>
              </View>
            </View> */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder={`What’s on your mind for ${influencerName}!`}
                style={styles.textInput}
                multiline
                maxLength={500}
                // onFocus={() => {
                //   openCloseEmojiPicker(false);
                // }}
                // value={typedText}
                // onChangeText={settypedText}
                numberOfLines={5}
                textAlignVertical={'top'}
                placeholderTextColor={COLORS.placeHolderColor}
              />
              {/* <View style={styles.emojiIconContainer}>
                <SVGIcon
                  icon={'emojee'}
                  // height={30}
                  // width={30}
                  isButton
                  onPress={() => {
                    Keyboard.dismiss();
                    // openCloseEmojiPicker(true);
                  }}
                />
              </View> */}
            </View>
            <View
              style={[
                styles.subContainer,
                {justifyContent: 'flex-end', paddingLeft: 15},
              ]}>
              <SVGIcon
                icon="mic_fill_white"
                height={21}
                width={21}
                marginLeft={8}
                isButton
                // onPress={() => {
                //   handleOpenAudioRecorder();
                // }}
              />
              <SVGIcon
                icon="camera_fill_white"
                height={21}
                width={21}
                marginLeft={8}
                isButton
                // onPress={() => {
                //   handleOpenCamera();
                // }}
              />
              <SVGIcon
                icon="video_fill_white"
                height={22}
                width={22}
                marginLeft={8}
                isButton
                // onPress={() => {
                //   pickMedia('video');
                // }}
              />
            </View>
          </View>
        </View>
        <View>
          <View>
            <SubmitButton
              buttonText="Send"
              // isDisabled={isDisabledPostButton()}
              disabledColor={COLORS.dimColor}
              // onPress={() => {
              //   if (!isDisabledPostButton()) {
              //     if (
              //       (selectedShareType.id === 3 ||
              //         selectedShareType.id === 4) &&
              //       shareConnectionsGroupsIdsList.length <= 0
              //     ) {
              //       Toast.fail(
              //         selectedShareType.id === 3
              //           ? 'Select groups'
              //           : 'Select connections',
              //       );
              //       setisOpenSelectionModal(true);
              //       return;
              //     }
              //     if (nugget) {
              //       handleEditNugget();
              //     } else {
              //       handlePostNuggets();
              //     }
              //   }
              // }}
            />
          </View>
        </View>
      </TouchableOpacity>
    </HOCView>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  subContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainContainer: {
    flexGrow: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  nameContainer: {
    paddingLeft: 5,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  nameText: {
    fontSize: 15,
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingVertical: 10,
    maxHeight: 200,
    minHeight: 70,
    alignItems: 'flex-start',
  },
  textInput: {
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.white,
    fontSize: 17,
    width: '88%',
    height: '100%',
  },
  emojiIconContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 5,
    height: 35,
    width: 35,
    // paddingTop: 5,
  },
  emojiContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: DIMENSIONS.window.height / 2 + 10,
  },
  selectedNuggetsContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderStyle: 'dashed',
    padding: 5,
    // height: 130,
  },

  backgroundVideo: {
    width: '100%',
    height: '100%',
  },

  removeIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  emojiContaine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 15,
    height: DIMENSIONS.screen.height / 2 - 50,
  },
  playIconContainer: {
    height: 25,
    width: 25,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    borderRadius: 25,
  },
  itemActionButtonsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeSelectedItemIconContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 3,
    backgroundColor: COLORS.secondary,
    borderRadius: 20 / 2,
    height: 20,
    width: 20,
  },
  itemRemoveIconContainer: {
    position: 'absolute',
    right: 3,
    top: 3,
    height: 22,
    width: 22,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    borderRadius: 25,
  },
});

export default InfluencerChat;
