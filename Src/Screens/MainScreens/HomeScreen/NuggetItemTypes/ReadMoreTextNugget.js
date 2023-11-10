import {
  Linking,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useRef, useState} from 'react';
import NuggetActionsOverlay from '../NuggetActionsOverlay';
import {
  ReadMoreTextNuggetContext,
  useNuggetItemActions,
  useNuggetParentActions,
} from '../../../../Utilities/Contexts';
import {useInsets, useToken} from '../../../../Utilities/StoreData';
import ReadMoreView from '../../../../Components/ReadMoreView';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {COLORS} from '../../../../Utilities/Colors';
import ConfirmationPopup from '../../../../Modals/ConfirmationPopup';
import {nuggetContentAudioService} from '../../../../Services/ApiService';
import Toast from '../../../../Components/Toast';

const ReadMoreTextNugget = ({
  onPressShare,
  onPressShareType,
  onEditNugget,
  onDeleteNugget,
  onBlockUser,
  onReportAbouseNugget,
  numberOfLines,

  ...props
}) => {
  const token = useToken();
  const [isTranslated, setisTranslated] = useState(false);
  const snapPoints = useMemo(() => ['90%'], []);
  const [DisplayText, setDisplayText] = useState(null);
  const readmoreSheetRef = useRef();
  const [url, seturl] = useState('');
  const [openUrlConfirmation, setopenUrlConfirmation] = useState(false);
  const [isTranslateLoading, setisTranslateLoading] = useState(false);
  const [urlConfirmationMetaData, seturlConfirmationMetaData] = useState(null);
  const insets = useInsets();
  const {
    nuggetContentController,
    handlePlayAudio,
    isFrom,
    searchFocused,
    dashboardFocused,
    profileFocused,
    isReadMuted,
    setisMuted,
    handleStopAudio,
  } = useNuggetParentActions();
  const {nugget, handleNuggetContentTranslate, ...values} =
    useNuggetItemActions() ?? {};
  const [isReadLoading, setisReadLoading] = useState(false);

  const getIsFocused = useMemo(() => {
    return (
      (isFrom === 'search' && searchFocused) ||
      (isFrom === 'dashboard' && dashboardFocused) ||
      (isFrom === 'profile' && profileFocused)
    );
  }, [isFrom, searchFocused, dashboardFocused, profileFocused]);

  const onPressUrl = value => {
    if (value) {
      if (value.includes('rawcaster')) {
        Linking.openURL(value)
          .then(res => {})
          .catch(e => {});
      } else {
        if (nugget && nugget.metadata) {
          let metaDataList = JSON.parse(nugget.metadata);
          const isArrayData = Array.isArray(metaDataList);
          if (!isArrayData) {
            metaDataList = [{...metaDataList}];
          }
          const singleMetaData = [...metaDataList].find(
            item => item.url === value,
          );

          if (singleMetaData) {
            seturlConfirmationMetaData(singleMetaData);
          }
        }

        seturl(value);
        setopenUrlConfirmation(true);
      }
    }
  };

  /**
   * Makes an API call to retrieve audio content for a nugget.
   * @param {number} [type=1] - The type of audio content to retrieve. Default is 1.
   * @returns None
   */
  const nuggetContentAudioAPICall = (type = 1) => {
    if (
      nuggetContentController &&
      nuggetContentController.current &&
      type === 1
    ) {
      nuggetContentController.current.abort();
    }
    nuggetContentController.current = new AbortController();
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nugget.nugget_id);
    formData.append('translation_type', type);
    nuggetContentAudioService(formData, nuggetContentController.current.signal)
      .then(res => {
        if (res.data?.status === 1) {
          if (type === 1) {
            if (getIsFocused) {
              if (handlePlayAudio) {
                handlePlayAudio(res.data.file_path);
              }
            }
          } else {
            handleNuggetContentTranslate(res.data.translation);
            setisTranslated(true);
          }
        } else if (res.data?.status === 0) {
          Toast.fail(res.data.msg);
          if (type === 2) {
            setisTranslated(false);
          }
        }
      })
      .catch(e => {
        if (!e.message.includes('cancel')) {
          Toast.fail(e.message);
        }
      })
      .finally(() => {
        if (type === 1) {
          setisReadLoading(false);
        } else {
          setisTranslateLoading(false);
        }
      });
  };

  const getTranslatedContent = () => {
    if (nugget.translated_content) {
      setisTranslated(true);
    } else {
      setisTranslateLoading(true);
      nuggetContentAudioAPICall(2);
    }
  };

  const ReadMoreTextNuggetContextValues = {
    ...values,
    isTranslated,
    setisTranslated,
    onPressUrl,
    isTranslateLoading,
    setisTranslateLoading,
    getTranslatedContent,
    url,
    seturl,
    nuggetContentAudioAPICall,
    isReadLoading,
    setisReadLoading,
    nuggetContentController,
    getIsFocused,
    nugget,
    isReadMuted,
    setisMuted,
    handleStopAudio,
    setpaused: props.setpaused,
  };

  return (
    <ReadMoreTextNuggetContext.Provider value={ReadMoreTextNuggetContextValues}>
      <NuggetActionsOverlay
        {...props}
        onEditNugget={onEditNugget}
        onDeleteNugget={onDeleteNugget}
        onPressShare={onPressShare}
        onPressShareType={onPressShareType}
        onBlockUser={onBlockUser}
        onReportAbouseNugget={onReportAbouseNugget}
        nuggetContentController={nuggetContentController}
        numberOfLines={numberOfLines ?? 15}
        onReadMore={val => {
          if (val.status) {
            setDisplayText(val.text);
            readmoreSheetRef.current?.present();
          } else {
            readmoreSheetRef.current?.close();
          }
        }}
      />
      <BottomSheetModal
        ref={readmoreSheetRef}
        handleStyle={{display: 'none'}}
        enableOverDrag={false}
        enableContentPanningGesture={false}
        enablePanDownToClose={false}
        topInset={insets.top ? insets.top : StatusBar.currentHeight}
        bottomInset={insets.bottom}
        stackBehavior="push"
        keyboardBlurBehavior={'restore'}
        android_keyboardInputMode="adjustPan"
        backgroundComponent={() => <View />}
        snapPoints={snapPoints}
        backdropComponent={props => {
          return (
            <TouchableOpacity
              style={{
                flex: 1,
                position: 'absolute',
                backgroundColor: COLORS.transparentDimColor,
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
              activeOpacity={1}
              onPress={() => {
                readmoreSheetRef.current?.close();
              }}
            />
          );
        }}>
        <ReadMoreView
          {...ReadMoreTextNuggetContextValues}
          onPressBack={() => {
            readmoreSheetRef.current?.close();
          }}
        />
      </BottomSheetModal>
      <Modal visible={openUrlConfirmation} transparent>
        <ConfirmationPopup
          metaData={urlConfirmationMetaData}
          onClose={() => {
            setopenUrlConfirmation(false);
            seturl('');
            seturlConfirmationMetaData(null);
          }}
          onPressPositiveButton={() => {
            if (url) {
              setopenUrlConfirmation(false);
              Linking.openURL(url)
                .then(res => {})
                .catch(e => {});
            }
          }}
          onPressNegativeButton={() => {
            setopenUrlConfirmation(false);
            seturlConfirmationMetaData(null);
            seturl('');
          }}
          positiveButtonText="Continue"
          negativeButtonText="Cancel"
          content={
            'The site you have requested is not managed by Rawcaster.com, we cannot vouch for the contents of the site. We recommend, that you excercise precautions before you click unknown sites.'
          }
        />
      </Modal>
    </ReadMoreTextNuggetContext.Provider>
  );
};

export default ReadMoreTextNugget;

const styles = StyleSheet.create({});
