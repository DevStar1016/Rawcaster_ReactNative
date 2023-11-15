import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../Utilities/Colors';
import SVGIcon from '../SVGIcon';
import StyledText from '../StyledText';
import {FONTS} from '../../Utilities/Fonts';
import {IconType} from '../../Utilities/Icons';
import {EVENT_TYPE} from '../../Utilities/Constants';
import Reactions from './Reactions';
import {UserDataProp} from '../../Services/ChimeSocket/ChimeSocketPropTypes';
import {UserVideoItemDetailsProp} from './MeetingVideoView';
import {getSlicedText} from '../../Utilities/Methods';

export type MEETING_MENU_IDS =
  | 'in_call_message'
  | 'exit_meeting'
  | 'end_meeting'
  | 'participants'
  | 'screenshare_permission'
  | 'rename'
  | 'enable_disable_audio'
  | 'enable_disable_video'
  | 'raise_hand'
  | 'remove_user'
  |'make_co_host';

type OptionsProp = {
  id: MEETING_MENU_IDS;
  buttonText: string;
  icon: IconType;
  isShow?: boolean;
  highLightedTextColor?: string;
};

type Props = {
  onPress: (buttonId: MEETING_MENU_IDS) => void;
  onPressEmoji?: (emoji: string) => void;
  onClose?: () => void;
  eventType?: number;
  isAllowedScreenShare?: boolean;
  selfUserId: number;
  hostUserId: number;
  isCoHost:boolean
  userData?: UserDataProp | UserVideoItemDetailsProp;
  visibleMenuIds: MEETING_MENU_IDS[];
  isEnableReactionsWithCondition?: boolean;
};

type MenuListProps = {
  hostUserId: number;
  selfUserId: number;
  eventType?: number;
  isCoHost?:boolean;
  isAllowedScreenShare?: boolean;
  userData?: UserDataProp | UserVideoItemDetailsProp;
  visibleMenuIds: MEETING_MENU_IDS[];
};

export const GetMeetingOptionsMenuList = ({
  hostUserId,
  selfUserId,
  userData,
  isCoHost,
  isAllowedScreenShare,
  eventType,
  visibleMenuIds,
}: MenuListProps): OptionsProp[] => {
  let menuList: OptionsProp[] = [
    {
      id: 'rename',
      buttonText: 'Rename',
      icon: 'edit_name_white',
      isShow: (hostUserId === selfUserId || isCoHost || userData?.userId == selfUserId),
     // isShow: true,
    //  isShow: userData?.isCoHost? true:userData?.isHost?true: false

    },
    {
      id: 'make_co_host',
      buttonText:
        userData && userData.isCoHost
          ? 'Remove Co Host'
          : 'Make Co Host',
      icon: 'chat_white',
     // isShow: userData ? userData.userId !== selfUserId : false,
      isShow: (hostUserId == selfUserId && userData?.userId !== selfUserId)? true:false,

    },
    
    {
      id: 'in_call_message',
      buttonText:
        userData && userData.userId !== selfUserId 
          ? 'Chat'
          : 'Chat',
      icon: 'chat_white',
      isShow: true,
    },
    {
      id: 'enable_disable_audio',
      buttonText: userData?.audio ? 'Mute' : 'Un Mute',
      icon: userData?.audio ? 'mic_white' : 'mic_off_white',
      isShow: userData
        ?( hostUserId === selfUserId || isCoHost)
          ? true
          : userData.userId === selfUserId
        : false,
    },
    {
      id: 'enable_disable_video',
      buttonText: `${userData?.video ? 'Stop' : 'Start'} Video`,
      icon:
        userData?.video &&
        // @ts-ignore
        (typeof userData.tileId === 'number' ||
          // @ts-ignore
          typeof userData.tileId === 'string')
          ? 'video_call_white'
          : 'video_disabled_white',
      isShow: userData
        ? ( hostUserId === selfUserId || isCoHost)
          ? true
          : userData.userId === selfUserId
        : false,
    },
    {
      id: 'raise_hand',
      buttonText: `${userData?.handRaised ? 'Drop' : 'Raise'} Hand`,
      icon: userData?.handRaised ? 'hand_secondary' : 'hand_white',
      isShow: userData ? userData.userId === selfUserId : false,
      highLightedTextColor: userData?.handRaised ? COLORS.secondary : undefined,
    },

    {
      id: 'participants',
      buttonText: 'Participants',
      icon: 'participants_white',
      isShow: true,
    },
    {
      id: 'screenshare_permission',
      buttonText: `${isAllowedScreenShare ? 'Discard' : 'Allow'} Screen-Share In Meeting`,
      icon: isAllowedScreenShare
        ? 'screen_share_disable_pink'
        : 'screen_share_enable',
        
      isShow: (eventType === EVENT_TYPE.event )&& (selfUserId === hostUserId || isCoHost ),
      highLightedTextColor: isAllowedScreenShare ? COLORS.secondary : undefined,
    },
    {
      id: 'remove_user',
      buttonText: 'Remove User',
      icon: 'remove_user_white',
      isShow:
       ( userData && userData.userId !== selfUserId && hostUserId === selfUserId)||(userData && userData.userId !== selfUserId && isCoHost),
    },
    {
      id: 'exit_meeting',
      buttonText: `Leave Streaming`,
      icon: 'exit_white',
      isShow:hostUserId === selfUserId?false: true,
    },
    {
      id: 'end_meeting',
      buttonText: `Stop Streaming`,
      icon: 'exit_white',
      isShow: (hostUserId === selfUserId || isCoHost),
    },
  ];
  menuList = [...menuList].filter(
    item => visibleMenuIds.includes(item.id) && item.isShow,
  );
  //console.log('returning_here',menuList);
  return [...menuList];
};

const MeetingMoreOptionsTalkshow = ({
  onPress,
  onPressEmoji,
  eventType,
  isAllowedScreenShare,
  selfUserId,
  hostUserId,
  userData,
  isCoHost,
  visibleMenuIds = [],
  onClose,
  isEnableReactionsWithCondition = true,
}: Props) => {
  const getMenuOptions = (): OptionsProp[] => {
    return GetMeetingOptionsMenuList({
      hostUserId,
      selfUserId,
      userData,
      eventType,
      isCoHost,
      isAllowedScreenShare,
      visibleMenuIds,
    });
  };

  return (
    <View
      style={[
        styles.mainContainer,
        eventType === EVENT_TYPE.event &&
          isEnableReactionsWithCondition && {paddingHorizontal: 0},
          
      ]}>
      {eventType !== EVENT_TYPE.event && isEnableReactionsWithCondition && (
        <Reactions onPressEmoji={onPressEmoji} />
      )}
      {userData ? (
        <View style={styles.titleContainer}>
          <View style={{width: '10%'}} />

          <StyledText style={styles.title}>
            {getSlicedText(userData.name, 20)}
          </StyledText>
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
      ) : null}
      <View style={styles.subContainer}>
        {getMenuOptions().map((item: OptionsProp) => {
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.buttonContainer}
              activeOpacity={0.7}
              onPress={() => {
                onPress(item.id);
              }}>
              <SVGIcon icon={item.icon} marginBottom={5} />
              <StyledText
                style={[
                  styles.buttonText,
                  {color: item.highLightedTextColor ?? COLORS.white},
                ]}>
                {item.buttonText}
              </StyledText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default MeetingMoreOptionsTalkshow;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 10,
   
  },
  subContainer: {
    flex: 1,
    backgroundColor: COLORS.transparentDimColor,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    alignItems: 'flex-start',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.4,
    borderColor: COLORS.grey,
  },
  title: {
    fontFamily: FONTS.DMSans.bold,
    color: COLORS.white,
    fontSize: 16,
  },
  buttonContainer: {
    width: '28%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: FONTS.DMSans.medium,
  },
});