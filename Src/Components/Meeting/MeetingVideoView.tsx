import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {COLORS} from '../../Utilities/Colors';
import ProfileWithBadge from '../ProfileWithBadge';
import {DIMENSIONS} from '../../Utilities/Constants';
import {MeetingVideo} from '../../Native/Components/MeetingVideo';
import StyledText from '../StyledText';
import SVGIcon from '../SVGIcon';
import {getSlicedText} from '../../Utilities/Methods';
import {UserDataProp} from '../../Services/ChimeSocket/ChimeSocketPropTypes';
import BOX_SHADOW from '../../Utilities/BoxShadow';

export interface AttendeeDetailProp {
  attendeeId: string;
  tileId?: number | string;
  userId: number;
  userRefId:string;
  
}

export interface UserVideoItemDetailsProp
  extends UserDataProp,
    Omit<AttendeeDetailProp, 'userId'> {}

type Props = {
  attendeeDetail: UserVideoItemDetailsProp;
  style?: StyleProp<ViewStyle>;
  isEnableFullScreen?: boolean;
  hostUserId: number;
  selfUserId: number;
  isCoHost:boolean;
  nameCharactersLength?: number;
  onPressName?: () => void;
  onPressFullScreen?: () => void;
  onPressRemoveUser?: (userId: number, name: string) => void;
  onPressVideo?: (userId: number, requestStatus: boolean) => void;
  onPressMic?: (userId: number, requestStatus: boolean) => void;
};

const WINDOW_WIDTH = DIMENSIONS.window.width;
const MeetingVideoView = ({
  attendeeDetail,
  style,
  hostUserId,
  selfUserId,
  
  isEnableFullScreen,
  nameCharactersLength = 20,
  onPressName,
  onPressFullScreen,
  onPressRemoveUser,
  onPressVideo,
  onPressMic,
}: Props) => {
  const timer: any = useRef();
  const [isViewOverlay, setisViewOverlay] = useState(false);
  const {tileId, name, userId,userRefId, audio, video, attendeeId, image,isCoHost} =
    attendeeDetail;
  //console.log('i_am_in_video_view',userRefId)  
  const isVideoEnabled =
    //@ts-ignore
    (typeof tileId === 'number' || typeof tileId === 'string') && video;
  /**
   * Retrieves the style for the main container element.
   * @returns {Array} An array of styles for the main container element.
   */
  const getStyle = () => {
    if (style) {
      if (Array.isArray(style)) {
        return [styles.mainContainer, ...style];
      }
      return [styles.mainContainer, style];
    }
    return [styles.mainContainer];
  };

  const getIsHost = () => hostUserId === userId;
  const getIsSelf = () => selfUserId === userId;
  const getIsScreenShare = () => attendeeDetail.attendeeId.includes('#content');

  /**
   * Automatically disables the overlay after a certain period of time.
   * If a timer is already running, it is cleared before starting a new one.
   * @returns None
   */
  const autoDisableOverlay = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      setisViewOverlay(false);
      clearTimeout(timer.current);
    }, 2000);
  };

  return (
    <TouchableOpacity
      // key={attendeeId.toString()}
      activeOpacity={1}
      style={getStyle()}
      onPress={() => {
        setisViewOverlay(true);
        autoDisableOverlay();
        // if ((hostUserId === selfUserId || getIsSelf()) && !getIsScreenShare()) {

        // }
      }}>
      {(typeof tileId === 'number' || typeof tileId === 'string') &&
      (video || attendeeId.includes('#content')) ? (
        <MeetingVideo
          // key={attendeeId.toString()}
          style={styles.video}
          tileId={tileId}
        />
      ) : (
        <ProfileWithBadge
          profileImage={image}
          profileSize={(WINDOW_WIDTH - 50) / 5}
          padding={0}
          extraMargin={0}
        />
      )}
      <View style={styles.userDataContainer}>
        <SVGIcon
          icon={audio ? 'mic_fill_secondary' : 'mic_off_fill_secondary'}
          height={18}
          width={18}
          marginRight={5}
        />
        <TouchableOpacity
          activeOpacity={hostUserId === selfUserId ? 0.7 : 1}
          onPress={() => {
            if (onPressName && hostUserId === selfUserId) {
              onPressName();
            }
          }}>
          <StyledText
            style={styles.nameText}
            normalTextModeTextProps={{numberOfLines: 1}}>
            {`${
              getIsSelf()
                ? 'You'
                : getSlicedText(
                    name,
                    (getIsHost()|| isCoHost)
                      ? nameCharactersLength - 9
                      : nameCharactersLength,
                  )
            }`}
          </StyledText>
        </TouchableOpacity>
        {getIsHost() && (
          <View style={styles.hostTextContainer}>
            <StyledText style={[styles.nameText, {fontSize: 12}]}>
              Host
            </StyledText>
          </View>
        )}
        {isCoHost && (!getIsHost())&&(
          <View style={styles.hostTextContainer}>
            <StyledText style={[styles.nameText, {fontSize: 12}]}>
              Co Host
            </StyledText>
          </View>
        )}
        
      </View>
      {isViewOverlay && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (timer.current) {
              clearTimeout(timer.current);
            }
            setisViewOverlay(false);
          }}
          style={styles.overlayContainer}>
          {!getIsScreenShare() && (
            <TouchableOpacity style={styles.actionsContainer} activeOpacity={1}>
              <SVGIcon
                icon={audio ? 'mic_fill_white' : 'mic_off_fill_white'}
                marginRight={10}
                height={20}
                width={20}
                isButton
                onPress={() => {
                  if (onPressMic) {
                    onPressMic(userId, !audio);
                   // onPressMic(userId, true);
                    autoDisableOverlay();
                  }
                }}
              />
              <SVGIcon
                icon={
                  isVideoEnabled
                    ? 'video_call_fill_white'
                    : 'video_disabled_white'
                }
                height={20}
                width={20}
                marginRight={10}
                isButton
                onPress={() => {
                  if (onPressVideo) {
                    onPressVideo(userId, !isVideoEnabled);
                    autoDisableOverlay();
                  }
                }}
              />
              {hostUserId === selfUserId && !getIsSelf() && (
                <SVGIcon
                  icon="close_rounded_white"
                  height={20}
                  width={20}
                  isButton
                  onPress={() => {
                    if (onPressRemoveUser) {
                      onPressRemoveUser(userId, name);
                      autoDisableOverlay();
                    }
                  }}
                />
              )}
            </TouchableOpacity>
          )}
          <View style={styles.fullScreenButtonContainer}>
            <SVGIcon
              icon={
                isEnableFullScreen ? 'mini_screen_white' : 'full_screen_white'
              }
              width={20}
              height={20}
              isButton
              onPress={() => {
                if (onPressFullScreen) {
                  onPressFullScreen();
                  autoDisableOverlay();
                }
              }}
            />
          </View>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default MeetingVideoView;

const styles = StyleSheet.create({
  mainContainer: {
    height: (WINDOW_WIDTH - 50) / 2,
    width: (WINDOW_WIDTH - 50) / 2,
    overflow: 'hidden',
    margin: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    height: '100%',
    width: '100%',
  },
  userDataContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    color: COLORS.white,
  },
  hostTextContainer: {
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    paddingHorizontal: 5,
    marginLeft: 5,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.transparentDimColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenButtonContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  actionsContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    flexDirection: 'row',
  },
});
