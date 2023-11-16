import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../../Utilities/Colors';
import StyledText from '../StyledText';
import {FONTS} from '../../Utilities/Fonts';
import SVGIcon from '../SVGIcon';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import ProfileWithBadge from '../ProfileWithBadge';
import RoundedIconButton from '../RoundedIconButton';
import {getSlicedText} from '../../Utilities/Methods';
import RBSheetTextInput from '../RBSheetTextInput';
import {
  JoinRequestMessageData,
  UserDataProp,
} from '../../Services/ChimeSocket/ChimeSocketPropTypes';
import {UserVideoItemDetailsProp} from './MeetingVideoView';

type renderProps = {
  item: UserVideoItemDetailsProp | UserDataProp | undefined;
  index: number;
};

type GlobalSettingsProps = {
  participantsAudio: boolean;
  participantsVideo: boolean;
};

type Props = {
  onClose?: () => void;
  participantsList: (UserVideoItemDetailsProp | UserDataProp | undefined)[];
  onPressAccept?: (data: JoinRequestMessageData) => void;
  onPressReject?: (userId: number) => void;
  onPressMic?: (userId: number, requestStatus: boolean) => void;
  onPressVideo?: (userId: number, requestStatus: boolean) => void;
  onPressGlobalMic?: (requestStatus: boolean) => void;
  onPressGlobalVideo?: (requestStatus: boolean) => void;
  isLoading?: boolean;
  meetingRefId: string;
  hostUserId?: number;
  selfUserId?: number;
  isShowActionsButtons?: boolean;
  isEnableItemPress?: boolean;
  onPressItem?: (
    item: UserVideoItemDetailsProp | UserDataProp | undefined,
  ) => void;
  listTitle?: string;
  isShowCount?: boolean;
  isCoHost:boolean;
  globalSettingsData?: GlobalSettingsProps;
};

const ParticipantsList = ({
  onClose,
  participantsList = [],
  onPressAccept,
  onPressReject,
  onPressMic,
  onPressVideo,
  isLoading,
  hostUserId,
  selfUserId,
  meetingRefId,
  isCoHost,
  isShowActionsButtons = true,
  isEnableItemPress = false,
  onPressItem,
  onPressGlobalMic,
  onPressGlobalVideo,
  globalSettingsData,
  listTitle = 'Participants',
  isShowCount = true,
}: Props) => {
  const [searchText, setsearchText] = useState('');

  /**
   * Retrieves a list of participants based on the search text.
   * If a search text is provided, it filters the participants list based on the name
   * that includes the search text (case-insensitive).
   * If no search text is provided, it returns the entire participants list.
   * @returns {Array} - A list of participants that match the search text (if provided) or the entire participants list.
   */
  const getParticipantsList = (): Array<
    UserVideoItemDetailsProp | UserDataProp | undefined
  > => {
    if (searchText) {
      return [...participantsList].filter(item =>
        item?.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    return [...participantsList];
  };

  const renderParticipant = ({item, index}: renderProps) => {
    if (!item) {
      return null;
    }
    const isHost = hostUserId === item.userId;
    const isCoHost = item.isCoHost;
    const isSelf = selfUserId === item.userId;
    const isVideoEnabled =
      //@ts-ignore
      (typeof item.tileId === 'number' || typeof item.tileId === 'string') &&
      item.video;
    const isEnableAudioVideoActions =
      hostUserId === selfUserId || selfUserId === item.userId;

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={item.isRequested ? 1 : 0.7}
        disabled={!isEnableItemPress}
        onPress={() => {
          if (onPressItem && !item.isRequested) {
            onPressItem(item);
          }
        }}>
        <View style={styles.profileImgNameContainer}>
          <ProfileWithBadge
            profileSize={35}
            extraMargin={0}
            padding={0}
            // profileImage={item.user_img}
          />
          <View style={{flex: 1}}>
            <StyledText style={styles.nameText}>
              {`${getSlicedText(item.name, isSelf ? 17 : 20)} ${
                isSelf ? '( You )' : ''
              }`}
            </StyledText>
          </View>
        </View>
        {isShowActionsButtons && (
          <View style={styles.actionButtonsContainer}>
            {item.isRequested ? (
              <>
                <RoundedIconButton
                  icon="tick"
                  bgColor={COLORS.green}
                  buttonSize={25}
                  buttonStyle={{marginHorizontal: 10}}
                  iconSize={17}
                  onPress={() => {
                    if (onPressAccept) {
                      console.log("this_is_pressed_item",item)

                      onPressAccept({
                        name: item.name,
                        image: item.image,
                        userId: item.userId,
                        refId: meetingRefId,
                        userRefId:item.userRefId,
                      });
                    }
                  }}
                />
                <RoundedIconButton
                  icon="close_white"
                  bgColor={COLORS.red}
                  buttonSize={25}
                  iconSize={13}
                  onPress={() => {
                    if (onPressReject) {
                      onPressReject(item.userId);
                    }
                  }}
                />
              </>
            ) : (
              <>
                {item.handRaised && (
                  <SVGIcon
                    icon={'hand_secondary'}
                    height={22}
                    width={22}
                    marginRight={10}
                    marginLeft={10}
                  />
                )}
                {isHost && (
                  <View
                    style={[
                      styles.hostTextContainer,
                      {marginLeft: item.handRaised ? 0 : 10},
                    ]}>
                    <StyledText style={styles.hostText}>Host</StyledText>
                  </View>
                )}
                {isCoHost && (
                  <View
                    style={[
                      styles.hostTextContainer,
                      {marginLeft: item.handRaised ? 0 : 10},
                    ]}>
                    <StyledText style={styles.hostText}>Co Host</StyledText>
                  </View>
                )}

                <SVGIcon
                  icon={item.audio ? 'mic_white' : 'mic_off_white'}
                  height={22}
                  width={22}
                  marginRight={10}
                  onPress={() => {
                    if (onPressMic) {
                      onPressMic(item.userId, !item.audio);
                    }
                  }}
                  isButton={isEnableAudioVideoActions}
                />
                <SVGIcon
                  icon={
                    isVideoEnabled ? 'video_call_white' : 'video_disabled_white'
                  }
                  isButton={isEnableAudioVideoActions}
                  onPress={() => {
                    if (onPressVideo) {
                      onPressVideo(item.userId, !isVideoEnabled);
                    }
                  }}
                />
                 <SVGIcon
                 height={15}
                  icon={
                    isVideoEnabled ? 'menu_vertical' : 'menu_vertical'
                  }
                  isButton={isEnableAudioVideoActions}
                  onPress={() => {
                    if (onPressItem && !item.isRequested) {
                      onPressItem(item);
                    }
                  }}
                />
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <View style={{height: 16, width: 16}} />
        <StyledText style={styles.titleText}>{`${listTitle} ${
          isShowCount ? '( ' + getParticipantsList().length + ' )' : ''
        }`}</StyledText>
        <SVGIcon
          icon="close_white"
          height={16}
          width={16}
          isButton
          onPress={onClose}
        />
      </View>
      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.loaderEmptyDataContainer}>
            <ActivityIndicator color={COLORS.white} size={'large'} />
            <StyledText style={{color: COLORS.white}}>
              Loading Attendees List
            </StyledText>
          </View>
        ) : (
          <>
            <View style={{paddingHorizontal: 5, paddingBottom: 10}}>
              <RBSheetTextInput
                isSearchBar
                placeholderText="Search Participant"
                isInsideTextChange={false}
                onChangeText={setsearchText}
                text={searchText}
              />
            </View>
            {isShowActionsButtons && ((hostUserId === selfUserId)|| isCoHost) && (
              <View style={styles.globalSettingsContainer}>
                <StyledText style={styles.globalSettingsText}>
                  Global Settings
                </StyledText>
                <View style={styles.actionButtonsContainer}>
                  <SVGIcon
                    icon={
                      globalSettingsData?.participantsAudio
                        ? 'mic_white'
                        : 'mic_off_white'
                    }
                    height={22}
                    width={22}
                    marginRight={10}
                    onPress={() => {
                      console.log('onGlobleMic');
                      if (onPressGlobalMic) {
                        onPressGlobalMic(
                          !globalSettingsData?.participantsAudio,
                        );
                      }
                    }}
                    isButton={true}
                  />
                  <SVGIcon
                    icon={
                      globalSettingsData?.participantsVideo
                        ? 'video_call_white'
                        : 'video_disabled_white'
                    }
                    isButton={true}
                    onPress={() => {
                      if (onPressGlobalVideo) {
                        onPressGlobalVideo(
                          !globalSettingsData?.participantsVideo,
                        );
                      }
                    }}
                  />
                  
                </View>
              </View>
            )}
            {getParticipantsList().length > 0 ? (
              <BottomSheetFlatList
                data={getParticipantsList()}
                renderItem={renderParticipant}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={() => {
                  return <View style={{height: 10}} />;
                }}
              />
            ) : (
              <View style={styles.loaderEmptyDataContainer}>
                <StyledText style={{color: COLORS.white}}>
                  No Participants found
                </StyledText>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default ParticipantsList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.transparentDimColor,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.4,
    borderColor: COLORS.grey,
  },
  titleText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  emptyComponentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  profileImgNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameText: {
    color: COLORS.white,
    marginLeft: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loaderEmptyDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostTextContainer: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
  },
  hostText: {
    color: COLORS.white,
    fontSize: 13,
  },
  globalSettingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginHorizontal: 5,
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  globalSettingsText: {
    color: COLORS.white,
    fontSize: 16,
  },
});
