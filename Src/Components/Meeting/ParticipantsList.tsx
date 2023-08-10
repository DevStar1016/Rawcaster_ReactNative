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

export interface ParticipantProp {
  id: number;
  name: string;
  image?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  isRequested?: boolean;
  isMuted?: boolean;
  isHandRaised?: boolean;
  tileId?: number | string;
}

type renderProps = {
  item: ParticipantProp;
  index: number;
};

type Props = {
  onClose?: () => void;
  participantsList: ParticipantProp[];
  onPressAccept?: (userId: number) => void;
  onPressReject?: (userId: number) => void;
  onPressMic?: (userId: number, requestStatus: boolean) => void;
  onPressVideo?: (userId: number, requestStatus: boolean) => void;
  isLoading?: boolean;
  hostUserId?: number;
  selfUserId?: number;
  isShowActionsButtons?: boolean;
  isEnableItemPress?: boolean;
  onPressItem?: (item: ParticipantProp) => void;
  listTitle?: string;
  isShowCount?: boolean;
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
  isShowActionsButtons = true,
  isEnableItemPress = false,
  onPressItem,
  listTitle = 'Participants',
  isShowCount = true,
}: Props) => {
  const [searchText, setsearchText] = useState('');

  const getParticipantsList = () => {
    if (searchText) {
      return [...participantsList].filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    return [...participantsList];
  };

  const renderParticipant = ({item, index}: renderProps) => {
    const isHost = hostUserId === item.id;
    const isSelf = selfUserId === item.id;
    const isVideoEnabled =
      typeof item.tileId === 'number' || typeof item.tileId === 'string';
    const isEnableAudioVideoActions =
      hostUserId === selfUserId || selfUserId === item.id;

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        disabled={!isEnableItemPress}
        onPress={() => {
          if (onPressItem) {
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
                      onPressAccept(item.id);
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
                      onPressReject(item.id);
                    }
                  }}
                />
              </>
            ) : (
              <>
                {item.isHandRaised && (
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
                      {marginLeft: item.isHandRaised ? 0 : 10},
                    ]}>
                    <StyledText style={styles.hostText}>Host</StyledText>
                  </View>
                )}

                <SVGIcon
                  icon={item.isMuted ? 'mic_off_white' : 'mic_white'}
                  height={22}
                  width={22}
                  marginRight={10}
                  onPress={() => {
                    if (onPressMic) {
                      onPressMic(item.id, item.isMuted ?? false);
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
                      onPressVideo(item.id, !isVideoEnabled);
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
    paddingHorizontal: 10,
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
});
