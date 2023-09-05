import {BackHandler, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import lodash from 'lodash';
import {COLORS} from '../../Utilities/Colors';
import StyledText from '../StyledText';
import {FONTS} from '../../Utilities/Fonts';
import SVGIcon from '../SVGIcon';
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import RBSheetTextInput from '../RBSheetTextInput';
import ParticipantsList from './ParticipantsList';
import DropDownPicker from '../DropDownPicker';
import CustomBottomSheetModal from '../CustomBottomSheetModal';
import {getSlicedText} from '../../Utilities/Methods';
import ProfileWithBadge from '../ProfileWithBadge';
import EmojiContainer from 'react-native-emoji-container';
import {DIMENSIONS, EVENT_TYPE} from '../../Utilities/Constants';
import {UserDataProp} from '../../Services/ChimeSocket/ChimeSocketPropTypes';
import {UserVideoItemDetailsProp} from './MeetingVideoView';

export interface MessageData extends UserDataProp {
  message: string;
  refId: string;
  isPrivate?: boolean;
  send_to?: UserDataProp;
  from_user_id: number;
}

type RenderProps = {
  item: MessageData;
  index: number;
};

type Props = {
  onClose?: () => void;
  participantsList: (UserDataProp | undefined)[];
  messagesList?: MessageData[];
  onSendMessage?: (text: string, toUserData: UserDataProp) => void;
  setisEnableContentPanningGesture: (val: boolean) => void;
  selfUserId: number;
  hostUserId?: number;
  eventType: number;
  meetingRefId: string;
  userData?: UserDataProp | UserVideoItemDetailsProp;
};

var isMount = true;

const InCallMessages = ({
  onClose,
  participantsList,
  messagesList = [],
  selfUserId,
  hostUserId,
  onSendMessage,
  setisEnableContentPanningGesture,
  eventType,
  meetingRefId,
  userData,
}: Props) => {
  const [typedText, settypedText] = useState('');
  const [isOpenEmojiContainer, setisOpenEmojiContainer] = useState(false);
  const [selectedParticipant, setselectedParticipant] = useState<UserDataProp>(
    userData && userData.userId !== selfUserId
      ? userData
      : {
          userId: -1,
          name: 'Everyone',
        },
  );

  const participantsListModalRef = useRef<BottomSheetModal>();
  const isParticipantModal = useRef(false);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  useEffect(() => {
    /**
     * Performs a back action based on the current state of the application.
     * If the participant modal is open, it will close it.
     * If the emoji container is open, it will close it and disable content panning gesture.
     * If there is an onClose function provided, it will call it.
     * @returns {boolean} - Returns true after performing the back action.
     */
    const backAction = (): boolean => {
      if (isParticipantModal.current) {
        handleCloseParticipantsModal();
      } else if (isOpenEmojiContainer) {
        setisOpenEmojiContainer(false);
        setisEnableContentPanningGesture(false);
      } else if (onClose) {
        onClose();
      }
      return true;
    };

    /**
     * Adds a hardware back press event listener and returns a cleanup function to remove the listener.
     * @param {function} backAction - The function to be called when the back button is pressed.
     * @returns A cleanup function that removes the event listener.
     */
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => {
      backHandler.remove();
    };
  }, []);

  /**
   * Closes the participants modal and updates the state to reflect that the modal is closed.
   * @returns None
   */
  const handleCloseParticipantsModal = () => {
    isParticipantModal.current = false;
    participantsListModalRef.current?.close();
  };

  /**
   * Handles the opening of the participants modal.
   * Sets the isParticipantModal.current flag to true and presents the participants list modal.
   * @returns None
   */
  const handleOpenParticipantsModal = () => {
    isParticipantModal.current = true;
    participantsListModalRef.current?.present();
  };

  /**
   * A dummy view component that renders an empty View element with optional styling based on the value of `isSelf`.
   * @param {boolean} isSelf - Indicates whether the view is for the self user.
   * @returns {JSX.Element} - The rendered dummy view component.
   */
  const DummyView = ({isSelf}: {isSelf: boolean}): JSX.Element => {
    return (
      <View
        style={[
          styles.dummyViewContainer,
          isSelf ? {marginRight: 5} : {marginLeft: 5},
        ]}
      />
    );
  };

  /**
   * Renders an item in a chat list with proper styling based on the item's properties.
   * @param {RenderProps} item - The item to render.
   * @param {number} index - The index of the item in the list.
   * @returns A React component representing the rendered item.
   */
  const renderItem = ({item, index}: RenderProps) => {
    const isSelf = item.from_user_id === selfUserId;
    const isPrivateMessage = item.send_to ? true : false;
    const hasPreIndex = index < messagesList.length - 1;
    const isPreIdSame =
      hasPreIndex && item.userId === messagesList[index + 1].userId;
    const isPreMessageTypeSame =
      hasPreIndex &&
      lodash.isEqual(item.send_to, messagesList[index + 1].send_to);
    const isPreMessageSame = isPreIdSame && isPreMessageTypeSame;
    return (
      <View
        style={[
          styles.chatItemContainer,
          {
            justifyContent: isSelf ? 'flex-end' : 'flex-start',
            marginTop: isPreMessageSame ? 3 : 10,
            flexDirection: 'row',
          },
        ]}>
        {!isSelf && !isPreMessageSame ? (
          <ProfileWithBadge
            // profileImage={item?.image}
            profileSize={22}
            extraMargin={0}
            padding={0}
            containerStyle={!isSelf ? {marginRight: 5} : {marginLeft: 5}}
          />
        ) : (
          <DummyView isSelf={isSelf} />
        )}
        <View
          style={[
            styles.messageContainer,
            isSelf && !isPreMessageSame
              ? {borderTopEndRadius: 0}
              : !isPreMessageSame && {
                  borderTopStartRadius: 0,
                },
          ]}>
          {!isPreMessageSame && (
            <View style={styles.nameTitleContainer}>
              <StyledText
                style={[
                  styles.nameText,
                  isSelf &&
                    eventType === EVENT_TYPE.event && {color: COLORS.white},
                ]}>
                {isSelf
                  ? 'You'
                  : getSlicedText(item.name, isPrivateMessage ? 10 : 20)}
              </StyledText>
              {eventType === EVENT_TYPE.event && (
                <>
                  <StyledText style={styles.toText}>{' to '}</StyledText>
                  <StyledText
                    style={[
                      styles.toNameText,
                      isPrivateMessage &&
                        item.send_to?.userId === selfUserId && {
                          color: COLORS.white,
                        },
                    ]}>
                    {`${
                      isPrivateMessage
                        ? item.send_to?.userId === selfUserId
                          ? 'you'
                          : getSlicedText(item.send_to?.name, 10)
                        : 'Everyone'
                    }`}
                  </StyledText>
                </>
              )}
            </View>
          )}
          <StyledText style={styles.messageText}>{item.message}</StyledText>
        </View>

        {isSelf && !isPreMessageSame ? (
          <ProfileWithBadge
            // profileImage={item?.image}
            profileSize={22}
            extraMargin={0}
            padding={0}
            containerStyle={!isSelf ? {marginRight: 5} : {marginLeft: 5}}
          />
        ) : (
          <DummyView isSelf={isSelf} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.titleContainer}>
        <View style={{width: '10%'}} />

        <StyledText style={styles.title}>In-call Messages</StyledText>
        <View style={{width: '10%', paddingRight: 5}}>
          <SVGIcon
            icon="close_white"
            height={15}
            width={15}
            isButton
            onPress={onClose}
          />
        </View>
      </View>
      <View style={styles.chatListContainer}>
        <BottomSheetFlatList
          data={messagesList}
          keyboardShouldPersistTaps="handled"
          style={{flexGrow: 0}}
          inverted
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View style={{paddingHorizontal: 15}}>
        {eventType === EVENT_TYPE.event && (
          <DropDownPicker
            value={selectedParticipant}
            fieldName="name"
            placeHolderText={'Select Participant to Message'}
            valueTextColor={COLORS.white}
            backgroundColor="rgba(255, 255, 255, 0.18)"
            dropDownIcon="down_arrow_white"
            dropDownIconSize={25}
            isInsideList={false}
            borderColor="rgba(255, 255, 255, 0.18)"
            onPress={() => {
              handleOpenParticipantsModal();
            }}
          />
        )}
        <View style={{marginBottom: 10}}>
          <RBSheetTextInput
            placeholderText={`Send Message...`}
            onPressSend={() => {
              if (onSendMessage) {
                onSendMessage(typedText, selectedParticipant);
                if (isMount) {
                  settypedText('');
                }
              }
            }}
            onPressEmoji={() => {
              if (isMount) {
                setisOpenEmojiContainer(true);
                setisEnableContentPanningGesture(true);
              }
            }}
            isInsideTextChange={false}
            onChangeText={settypedText}
            text={typedText}
            actionsContainerPaddingTop={5}
            isDisableSend={false}
            isKeyboardCloseWhenSend={false}
            onFocus={() => {
              if (isMount) {
                setisOpenEmojiContainer(false);
                setisEnableContentPanningGesture(true);
              }
            }}
            onBlur={() => {
              if (isMount) {
                setisEnableContentPanningGesture(false);
              }
            }}
          />
        </View>
        {isOpenEmojiContainer ? (
          <TouchableOpacity
            activeOpacity={1}
            style={{
              height: DIMENSIONS.window.height / 2 - 80,
              backgroundColor: COLORS.white,
              borderTopStartRadius: 10,
              borderTopEndRadius: 10,
            }}>
            <BottomSheetView style={{flex: 1}}>
              <EmojiContainer
                titleTextStyle={{
                  fontFamily: FONTS.DMSans.medium,
                  fontSize: 14,
                  color: COLORS.black,
                }}
                emojisContainerWidth={DIMENSIONS.window.width - 30}
                onPressEmoji={emojiItem => {
                  if (isMount) {
                    settypedText(pre => {
                      if (pre.length < 500) {
                        return pre + emojiItem.emoji;
                      }
                      return pre;
                    });
                  }
                }}
              />
            </BottomSheetView>
          </TouchableOpacity>
        ) : null}
      </View>
      {/* Participants List Modal */}
      <CustomBottomSheetModal
        // @ts-ignore
        refValue={participantsListModalRef}
        onCloseModal={handleCloseParticipantsModal}>
        <ParticipantsList
          onClose={handleCloseParticipantsModal}
          // @ts-ignore
          participantsList={[
            {userId: -1, name: 'Everyone'},
            ...participantsList,
          ]}
          isShowActionsButtons={false}
          isEnableItemPress
          onPressItem={participant => {
            if (isMount) {
              //@ts-ignore
              setselectedParticipant(participant);
            }
            handleCloseParticipantsModal();
          }}
          isShowCount={false}
          listTitle="Select Participant to Message"
          meetingRefId={meetingRefId}
        />
      </CustomBottomSheetModal>
    </View>
  );
};

export default InCallMessages;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
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
  chatListContainer: {
    paddingHorizontal: 15,
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatItemContainer: {
    paddingHorizontal: 5,
  },
  messageContainer: {
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 10,
    maxWidth: '70%',
  },
  messageText: {
    color: COLORS.white,
  },
  nameTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  nameText: {
    color: COLORS.secondary,
    fontFamily: FONTS.DMSans.bold,
  },
  toNameText: {
    color: COLORS.secondary,
    fontFamily: FONTS.DMSans.bold,
  },
  toText: {
    color: COLORS.white,
  },
  dummyViewContainer: {
    height: 22,
    width: 22,
  },
});
