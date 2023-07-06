import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import lodash from 'lodash';
import NuggetItem from './NuggetItem';
import TextOnlyNugget from './NuggetItemTypes/TextOnlyNugget';
import {DIMENSIONS, NUGGET_SHARE_TYPE} from '../../../Utilities/Constants';
import {
  useConnectionsList,
  useGroupsList,
  useInsets,
  useNuggetsList,
  useSearchedNuggetsList,
  useToken,
  useTranslatedNuggetsList,
} from '../../../Utilities/StoreData';
import PollNugget from './NuggetItemTypes/PollNugget';
import {
  nuggetAbuseReportService,
  nuggetContentAudioService,
  shareNuggetService,
} from '../../../Services/ApiService';
import Loader from '../../../Components/Loader';
import {COLORS} from '../../../Utilities/Colors';
import Toast from '../../../Components/Toast';
import {
  setSavedNuggetsList,
  setSearchedNuggetsList,
} from '../../../Store/Slices/HomeSlice';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import MultiItemsSelectList from '../../../Modals/MultiItemsSelectList';
import ItemSelectionMiniList from '../../../Components/ItemSelectionMiniList';
import {
  NuggetItemActionsContext,
  useNuggetParentActions,
} from '../../../Utilities/Contexts';
import InputPopup from '../../../Modals/InputPopup';
import {setNuggetsList} from '../../../Store/Slices/NuggetsListSlice';
import {
  getNuggetsReduxStoreDataFormate,
  htmlDecodeText,
} from '../../../Utilities/Methods';
import {
  becomeFan,
  blockUnblockUser,
  deleteNugget,
  likeAndUnlikeNugget,
  saveAndUnsaveNugget,
} from '../../../Store/ThunkAPIServices';
import {
  addEditedNugget,
  setTranslatedNuggets,
} from '../../../Store/Slices/NuggetActionsSlice';

const Nugget = ({nugget, nuggetIndex}) => {
  const {
    scrollNuggetsListToTop,
    isFromGlobalSearch,
    mediaHeight,
    onFinishPlaying,
    categoryName,
  } = useNuggetParentActions();
  let likeUnlikeController = undefined;
  let saveUnsaveController = undefined;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const nuggetsList = useNuggetsList();
  const connectionsList = useConnectionsList();
  const groupsList = useGroupsList();
  const translatedNuggetsList = useTranslatedNuggetsList();
  const searchedNuggetsList = useSearchedNuggetsList();
  const savedNuggetsList = useSelector(state => state.home.savedNuggetsList);
  const flatlistRef = useRef(null);
  const insets = useInsets();
  const token = useToken();
  const [isOpenViewOnlySelectionModal, setisOpenViewOnlySelectionModal] =
    useState(false);
  const [isOpenSharTypeList, setisOpenSharTypeList] = useState(false);
  const [isOpenSelectionModal, setisOpenSelectionModal] = useState(false);
  const [selectedShareTypeId, setselectedShareTypeId] = useState(null);

  const [isActionLoading, setisActionLoading] = useState(false);
  const [loaderText, setloaderText] = useState('');
  const [totalComments, settotalComments] = useState(nugget.total_comments);
  const [isRepeatVideo, setisRepeatVideo] = useState(false);
  const [viewableItem, setviewableItem] = useState('');
  const [isOpenReportModal, setisOpenReportModal] = useState(false);
  const viewConfigRef = useRef({
    waitForInteraction: false,
    minimumViewTime: 100,
    viewAreaCoveragePercentThreshold: 30,
  });
  const onViewRef = useRef(viewableItems => {
    if (viewableItems?.viewableItems?.length > 0)
      setviewableItem(viewableItems.viewableItems[0].item.media_id || 0);
  });

  useEffect(() => {
    return () => {
      likeUnlikeController = undefined;
      saveUnsaveController = undefined;
    };
  }, []);

  const updateLike = useCallback(
    lodash.debounce(() => {
      if (likeUnlikeController) {
        likeUnlikeController.abort();
      }
      likeUnlikeController = new AbortController();
      dispatch(
        likeAndUnlikeNugget({
          nugget_id: nugget.nugget_id,
          total_likes: nugget.total_likes,
          signal: likeUnlikeController.signal,
        }),
      );
    }, 100),
    [],
  );

  const updateSave = useCallback(
    lodash.debounce(() => {
      if (saveUnsaveController) {
        saveUnsaveController.abort();
      }
      saveUnsaveController = new AbortController();
      dispatch(
        saveAndUnsaveNugget({
          nugget_id: nugget.nugget_id,
          signal: saveUnsaveController.signal,
        }),
      );
    }, 100),
    [],
  );

  function updateIsFan() {
    dispatch(
      becomeFan({
        user_id: nugget.user_id,
        follow_count: nugget.follow_count,
        user_ref_id: nugget.user_ref_id,
      }),
    );
  }

  const deleteButtonAlert = () =>
    Alert.alert(
      'Delete!',
      'Do you want to delete this nugget?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            // setloaderText('Deleting Nugget...');
            // setisActionLoading(true);
            // handleDeleteNugget(nugget.nugget_id);
            dispatch(deleteNugget({nugget_id: nugget.nugget_id}));
          },
        },
      ],
      {cancelable: false},
    );

  const onBlockUser = () =>
    Alert.alert(
      'Block!',
      'Do you want to block this user?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            handleBlockUser(nugget.user_id);
          },
        },
      ],
      {cancelable: false},
    );

  const onEditNugget = () => {
    navigation.navigate('PostEditNugget', {
      nugget: nugget,
      isSearchNugget: isFromGlobalSearch,
      categoryName: categoryName ?? 'forYou',
    });
  };

  const handleBlockUser = userId => {
    dispatch(
      blockUnblockUser({
        user_id: userId,
        action: 1, // 1 - block, 2 - unblock
      }),
    );
  };

  const handleSharNugget = (type, sharedList) => {
    setloaderText('Sharing Nugget...');
    setisActionLoading(true);
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nugget.nugget_id);
    formData.append('share_type', type);
    if (type === 3) {
      formData.append('share_with', JSON.stringify({groups: sharedList}));
    } else if (type === 4) {
      formData.append('share_with', JSON.stringify({friends: sharedList}));
    }
    shareNuggetService(formData)
      .then(res => {
        if (res.data.status === 1) {
          dispatch(
            setNuggetsList(
              getNuggetsReduxStoreDataFormate(categoryName, [
                res.data.nugget_detail,
                ...nuggetsList,
              ]),
            ),
          );
          scrollNuggetsListToTop && scrollNuggetsListToTop();
        }
      })
      .catch(e => {})
      .finally(() => {
        setloaderText('');
        setisActionLoading(false);
      });
  };

  const onShareNugget = type => {
    if (type === 3 || type === 4) {
      setselectedShareTypeId(type);
      setisOpenSelectionModal(true);
    } else {
      Alert.alert(
        'Share!',
        'Do you want to share this nugget?',
        [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              handleSharNugget(type);
            },
          },
        ],
        {cancelable: false},
      );
    }
  };
  function handleNuggetContentTranslate(setisTranslated) {
    setloaderText('Translating this Nugget');
    setisActionLoading(true);
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nugget.nugget_id);
    formData.append('translation_type', 2);
    nuggetContentAudioService(formData)
      .then(res => {
        if (res.data.status === 1) {
          let tempList = [...nuggetsList];
          let temp = tempList.find(ele => ele.nugget_id === nugget.nugget_id);
          if (temp !== -1) {
            temp = {
              ...temp,
              translated_content: htmlDecodeText(res.data.translation),
            };
            dispatch(setTranslatedNuggets([...translatedNuggetsList, temp]));
          }
          setisTranslated(true);
        } else if (res.data.status === 0) {
          setisTranslated(false);
          Toast.fail(res.data.msg);
        }
      })
      .catch(() => {
        setisTranslated(false);
        Toast.fail(e.message);
      })
      .finally(() => {
        setisActionLoading(false);
        setloaderText('');
      });
  }

  function handleReportNugget(nuggetId, message = '') {
    setloaderText('Reporting this Nugget');
    setisActionLoading(true);
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nuggetId);
    formData.append('message', message.trim());
    nuggetAbuseReportService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          if (isFromGlobalSearch) {
            dispatch(
              setSearchedNuggetsList(
                [...searchedNuggetsList].filter(
                  item => item.nugget_id !== nuggetId,
                ),
              ),
            );
          }
          let tempSavedList = [...savedNuggetsList];
          let tempIndex = tempSavedList.findIndex(
            ele => ele.nugget_id === nuggetId,
          );
          if (tempIndex !== -1) {
            dispatch(
              setSavedNuggetsList(
                tempSavedList.filter(item => item.nugget_id !== nuggetId),
              ),
            );
          }
          const filteredNuggetsList = [...nuggetsList].filter(
            item => item.nugget_id !== nuggetId,
          );
          dispatch(
            setNuggetsList(
              getNuggetsReduxStoreDataFormate(
                categoryName,
                filteredNuggetsList,
              ),
            ),
          );
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(() => {
        Toast.fail(e.message);
      })
      .finally(() => {
        setisActionLoading(false);
        setloaderText('');
      });
  }

  const onPressShare = () => {
    setisOpenSharTypeList(true);
  };

  const onPressShareType = () => {
    if (
      (nugget.share_type === 3 || nugget.share_type === 4) &&
      nugget?.shared_detail &&
      nugget?.shared_detail.length > 0
    ) {
      setselectedShareTypeId(parseInt(nugget.share_type));
      setisOpenViewOnlySelectionModal(true);
    }
  };

  const getSelectionList = () => {
    if (isOpenViewOnlySelectionModal) {
      return nugget?.shared_detail?.map(item => {
        if (selectedShareTypeId === 3) {
          return {
            group_name: item.name,
            group_icon: item.img,
          };
        }
        return {
          display_name: item.name,
          profile_img: item.img,
        };
      });
    }
    return selectedShareTypeId === 3 ? groupsList : connectionsList;
  };

  const nuggetItemActions = {
    nugget: nugget,
    parentNuggetIndex: nuggetIndex,
    updateLike: updateLike,
    updateSave: updateSave,
    updateIsFan: updateIsFan,
    totalViews: nugget.total_views,
    totalComments: totalComments,
    setTotalComments: settotalComments,
    isRepeatVideo: isRepeatVideo,
    setisRepeatVideo: setisRepeatVideo,
    viewableItem: viewableItem,
    handleNuggetContentTranslate: handleNuggetContentTranslate,
    onFinishPlaying: index => {
      if (index < nugget?.media_list?.length - 1) {
        flatlistRef.current.scrollToIndex({
          index: index + 1,
        });
      } else {
        onFinishPlaying(nuggetIndex);
      }
    },
  };

  const keyExtractor = useCallback(item => item.media_id.toString(), []);

  function renderItem({item, index}) {
    return (
      <NuggetItem
        mediaItem={item}
        onEditNugget={onEditNugget}
        onDeleteNugget={() => {
          deleteButtonAlert();
        }}
        onPressShare={onPressShare}
        index={index}
        onPressShareType={onPressShareType}
        onBlockUser={() => {
          onBlockUser();
        }}
        onReportAbouseNugget={() => {
          setisOpenReportModal(true);
        }}
      />
    );
  }

  return (
    <NuggetItemActionsContext.Provider value={nuggetItemActions}>
      <View style={styles.mainContainer}>
        {nugget?.media_list?.length > 0 ? (
          // <BigList
          //   ref={flatlistRef}
          //   showsHorizontalScrollIndicator={false}
          //   style={[
          //     styles.listContainer,
          //     {height: mediaHeight ?? insets.mediaHeight},
          //   ]}
          //   data={nugget.media_list ?? []}
          //   horizontal
          //   bounces={false}
          //   keyExtractor={keyExtractor}
          //   renderItem={renderItem}
          //   pagingEnabled
          //   itemHeight={mediaHeight ?? insets.mediaHeight}
          //   onViewableItemsChanged={onViewRef.current}
          // />

          <FlatList
            ref={flatlistRef}
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            style={[
              styles.listContainer,
              {height: mediaHeight ?? insets.mediaHeight},
            ]}
            data={nugget.media_list ?? []}
            horizontal
            scrollEnabled={false}
            bounces={false}
            keyExtractor={item => item.media_id.toString()}
            renderItem={renderItem}
            pagingEnabled
            decelerationRate={0.9}
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={viewConfigRef.current}
          />
        ) : nugget.poll_option && nugget.poll_option.length > 0 ? (
          <PollNugget
            onEditNugget={onEditNugget}
            onDeleteNugget={() => {
              deleteButtonAlert();
            }}
            onPressShareType={onPressShareType}
            onPressShare={onPressShare}
            onBlockUser={() => {
              onBlockUser();
            }}
            onReportAbouseNugget={() => {
              setisOpenReportModal(true);
            }}
          />
        ) : (
          <TextOnlyNugget
            onEditNugget={onEditNugget}
            onDeleteNugget={() => {
              deleteButtonAlert();
            }}
            onPressShareType={onPressShareType}
            onPressShare={onPressShare}
            onBlockUser={() => {
              onBlockUser();
            }}
            onReportAbouseNugget={() => {
              setisOpenReportModal(true);
            }}
          />
        )}

        <Modal
          visible={isOpenSharTypeList}
          onRequestClose={() => {
            setisOpenSharTypeList(false);
          }}
          transparent
          style={{backgroundColor: COLORS.transparentDimColor}}>
          <SafeAreaView
            style={{flex: 1, backgroundColor: COLORS.transparentDimColor}}>
            <ItemSelectionMiniList
              maxHeight={DIMENSIONS.screen.height / 2 - 100}
              onClose={() => {
                setisOpenSharTypeList(false);
              }}
              fieldName={'name'}
              listData={NUGGET_SHARE_TYPE}
              onSelectItem={item => {
                setisOpenSharTypeList(false);
                onShareNugget(item.id);
              }}
            />
          </SafeAreaView>
        </Modal>

        <Modal
          visible={isOpenSelectionModal || isOpenViewOnlySelectionModal}
          statusBarTranslucent
          onRequestClose={() => {
            setisOpenSelectionModal(false);
            setisOpenViewOnlySelectionModal(false);
          }}>
          <MultiItemsSelectList
            title={
              selectedShareTypeId === 3
                ? 'Specific Group'
                : 'Specific Connection'
            }
            isEnableLocalSearch={!isOpenViewOnlySelectionModal}
            isEnableRightIcon={!isOpenViewOnlySelectionModal}
            isEnableSelection={!isOpenViewOnlySelectionModal}
            imageFieldName={
              selectedShareTypeId === 3 ? 'group_icon' : 'profile_img'
            }
            onCloseModal={() => {
              setisOpenSelectionModal(false);
              setisOpenViewOnlySelectionModal(false);
            }}
            displayFieldName={
              selectedShareTypeId === 3 ? 'group_name' : 'display_name'
            }
            idFieldName={selectedShareTypeId === 3 ? 'group_id' : 'user_id'}
            list={getSelectionList()}
            onSelectItems={list => {
              setisOpenSelectionModal(false);
              setisOpenViewOnlySelectionModal(false);
              if (selectedShareTypeId) {
                handleSharNugget(selectedShareTypeId, list);
              }
            }}
            noDataText={
              selectedShareTypeId === 3
                ? 'No Groups Found'
                : 'No Connections Found'
            }
          />
        </Modal>

        <Modal transparent visible={isActionLoading}>
          <Loader
            bgColor={COLORS.transparentDimColor}
            loaderText={loaderText}
          />
        </Modal>

        <Modal
          visible={isOpenReportModal}
          transparent
          onRequestClose={() => {
            setisOpenReportModal(false);
          }}>
          <InputPopup
            closePopup={() => {
              setisOpenReportModal(false);
            }}
            title={'Report this nugget to Rawcaster'}
            submitButtonProps={{
              buttonText: 'Report',
            }}
            requiredErrorText="Report Reason is required"
            textInputProps={{
              placeHolder: 'Enter your message',
              multiline: true,
              inputContainerHeight: 100,
              textAlignVertical: 'top',
            }}
            onSubmit={message => {
              setisOpenReportModal(false);
              handleReportNugget(nugget.nugget_id, message);
            }}
          />
        </Modal>
      </View>
    </NuggetItemActionsContext.Provider>
  );
};

export default Nugget;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    width: DIMENSIONS.window.width,
  },
});
