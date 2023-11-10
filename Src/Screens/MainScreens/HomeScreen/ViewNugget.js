import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useInsets, useProfile, useToken} from '../../../Utilities/StoreData';
import {getNuggetDetailService} from '../../../Services/ApiService';
import Loader from '../../../Components/Loader';
import Nugget from './Nugget';
import DefaultBackground from '../../../Components/DefaultBackground';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {NuggetParentActionsContext} from '../../../Utilities/Contexts';
import {BackHandler} from 'react-native';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import CustomHomeTabButton from '../../../Components/CustomHomeTabButton';
import SVGIcon from '../../../Components/SVGIcon';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
var isMount = true;
const ViewNugget = () => {
  const route = useRoute();
  const token = useToken();
  const profile = useProfile();
  const navigation = useNavigation();
  const insets = useInsets();
  const audioPlayerRef = useRef(new AudioRecorderPlayer());

  const isReadMore = route.params?.isReadMore;
  const [headerHeight, setheaderHeight] = useState(0);
  const canGoBack = navigation.getState()?.routes.length;
  const isFocused = useIsFocused();
  const [isMuted, setisMuted] = useState(true);
  const [isLoading, setisLoading] = useState(true);
  const [nuggetData, setnuggetData] = useState(null);
  const [errorText, seterrorText] = useState('');
  const [isReadMuted, setisReadMuted] = useState(false);

  useEffect(() => {
    isMount = true;
    if (!route.params?.id) {
      return;
    }
    getNuggetDetails();
    return () => {
      isMount = false;
    };
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const backAction = () => {
    if (canGoBack === 1) {
      navigation.reset({
        routes: [{name: 'DashboardProfileTopTabNavigation'}],
      });
    } else {
      navigation.goBack();
    }
    return true;
  };

  const getNuggetDetails = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', route.params.id);
    getNuggetDetailService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            seterrorText('');
            setnuggetData({...res.data.nugget_detail});
            // setnuggetData()
          }
        } else if (res.data.status === 0) {
          if (isMount) {
            seterrorText(res.data.msg);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          seterrorText(e.message);
        }
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  /**
   * Stops the audio playback and removes the playback listener.
   * If an error occurs during the process, it is caught and ignored.
   * Finally, sets the 'isReadMuted' state to false.
   * @returns None
   */
  const handleStopAudio = () => {
    try {
      audioPlayerRef.current?.stopPlayer();
      audioPlayerRef.current?.removePlayBackListener();
    } catch (e) {
    } finally {
      setisReadMuted(false);
    }
  };

  /**
   * Handles playing audio from the given URL.
   * @param {string} url - The URL of the audio file to play.
   * @returns None
   */
  const handlePlayAudio = async url => {
    handleStopAudio();
    try {
      await audioPlayerRef.current?.startPlayer(url);
      audioPlayerRef.current?.addPlayBackListener(e => {
        if (Math.floor(e.currentPosition) === 0) {
          setisReadMuted(true);
        } else if (e.currentPosition >= e.duration) {
          handleStopAudio();
        }
        return;
      });
    } catch (e) {
      setisReadMuted(false);
    }
  };

  const nuggetActions = {
    headerContainerHeight: headerHeight,
    isMuted: isMuted,
    isReadMore: isReadMore ?? false,
    isFrom: 'dashboard',
    dashboardFocused: isFocused,
    isFocused,
    setisMuted: setisMuted,
    categoryName: 'forYou',
    isAutoPlay: true,
    scrollNuggetsListToTop: () => {},
    // viewableNuggetItem: viewableItem.nugget_id,
    viewableNuggetItem: null,
    isFromGlobalSearch: false,
    isEnableADDButton: false,
    isEnableTopInsetsPadding: true,
    textNuggetNumberOfLines: 15,
    isEnableHeaderContainerHeightforTopButtons: true,
    nuggetContentController: null,
    isReadMuted: isReadMuted,
    handlePlayAudio: handlePlayAudio,
    handleStopAudio: handleStopAudio,
    onFinishPlaying: index => {},
  };

  if (!nuggetData || isLoading || errorText) {
    return (
      <DefaultBackground
        isEnableLoading={isLoading}
        centerText={
          isLoading
            ? 'Loading Nugget'
            : errorText
            ? errorText
            : 'Something went wrong'
        }
      />
    );
  }

  return (
    <NuggetParentActionsContext.Provider value={nuggetActions}>
      <View style={styles.mainContainer}>
        <View
          onLayout={e => {
            if (isMount) {
              setheaderHeight(e.nativeEvent.layout.height);
            }
          }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            zIndex: 1,
            paddingHorizontal: 10,
            paddingVertical: 10,
            top: insets.top ? insets.top : StatusBar.currentHeight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{marginRight: 10}}>
            <SVGIcon icon="app_logo_white" height={30} width={30} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginLeft: 10,
              alignItems: 'center',
            }}>
            {/* <SVGIcon
              icon="search"
              isButton
              onPress={() => {
                navigation.navigate('GlobalSearchStack');
              }}
            /> */}

            <ProfileWithBadge
              profileImage={profile?.profile_image}
              profileSize={28}
              extraMargin={0}
              padding={0}
              // badge={Badges(profile?.user_status_id)}
              // badgeSize={15}
              // badgeContainerStyle={{right: -5, bottom: -2}}
              containerStyle={{marginLeft: 5, marginRight: 0}}
              isButton
              onPressProfile={() => {
                navigation.reset({
                  routes: [
                    {name: 'DashboardProfileTopTabNavigation'},
                    {name: 'ProfileStack'},
                  ],
                });
              }}
            />
          </View>
        </View>
        <Nugget nugget={nuggetData} nuggetIndex={0} />
        <View
          style={{
            alignItems: 'center',
            height: 60,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}>
          <CustomHomeTabButton
            onPress={() => {
              navigation.reset({
                routes: [{name: 'DashboardProfileTopTabNavigation'}],
              });
            }}
            isLoading={isLoading}
          />
        </View>
      </View>
    </NuggetParentActionsContext.Provider>
  );
};

export default ViewNugget;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  errorTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
