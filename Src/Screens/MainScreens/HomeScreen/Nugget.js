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
} from '../../../Utilities/StoreData';
import PollNugget from './NuggetItemTypes/PollNugget';
import {
  blockUnblockUserService,
  deleteNuggetService,
  followAndUnfollowService,
  nuggetAbuseReportService,
  saveAndUnsaveNuggetService,
  shareNuggetService,
} from '../../../Services/ApiService';
import Loader from '../../../Components/Loader';
import {COLORS} from '../../../Utilities/Colors';
import Toast from '../../../Components/Toast';
import {
  setSavedNuggetsCount,
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
import BigList from 'react-native-big-list';
import InputPopup from '../../../Modals/InputPopup';
import {setNuggetsList} from '../../../Store/Slices/NuggetsListSlice';
import {getNuggetsReduxStoreDataFormate} from '../../../Utilities/Methods';
import {
  likeAndUnlikeNugget,
  saveAndUnsaveNugget,
} from '../../../Store/ThunkAPIServices';

const Nugget = ({
  nugget,
  nuggetIndex,
  isFromProfile = false,
  onFinishDelete,
  onFinishSave,
}) => {
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
  const searchedNuggetsList = useSearchedNuggetsList();
  const savedNuggetsList = useSelector(state => state.home.savedNuggetsList);
  const savedNuggetsCount = useSelector(state => state.home.savedNuggetsCount);
  const flatlistRef = useRef(null);
  const insets = useInsets();
  const token = useToken();
  const [isOpenViewOnlySelectionModal, setisOpenViewOnlySelectionModal] =
    useState(false);
  const [isOpenSharTypeList, setisOpenSharTypeList] = useState(false);
  const [isOpenSelectionModal, setisOpenSelectionModal] = useState(false);
  const [selectedShareTypeId, setselectedShareTypeId] = useState(null);

  const [nuggetData, setnuggetData] = useState({...nugget});
  const [isActionLoading, setisActionLoading] = useState(false);
  const [loaderText, setloaderText] = useState('');
  const [totalComments, settotalComments] = useState(nuggetData.total_comments);
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
          nugget_id: nuggetData.nugget_id,
          total_likes: nuggetData.total_likes,
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
          nugget_id: nuggetData.nugget_id,
          signal: saveUnsaveController.signal,
        }),
      );
    }, 100),
    [],
  );

  // function updateSave() {

  //   setnuggetData(preNuggetData => {
  //     let tempNugget = {...preNuggetData};
  //     const isSaved = !tempNugget.saved;
  //     debounceOnSave(isSaved);
  //     return {...preNuggetData, saved: isSaved};
  //   });
  // }

  function updateIsFan() {
    setnuggetData(preNuggetData => {
      let tempNugget = {...preNuggetData};
      handleBecomeFan();
      return {
        ...preNuggetData,
        following: true,
        follow_count: parseInt(tempNugget.follow_count) + 1,
      };
    });
  }

  const saveAndUnsaveNuggetApiCall = status => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nuggetData.nugget_id);
    formData.append('save', status ? 1 : 2);
    saveAndUnsaveNuggetService(formData)
      .then(res => {
        if (res.data.status === 1) {
          console.log(JSON.stringify(savedNuggetsList), 'SAVE');
          let tempSavedList = [...savedNuggetsList];
          let tempList = [...nuggetsList];
          let tempIndex = tempList.findIndex(
            item => item.nugget_id === nuggetData.nugget_id,
          );
          let tempSavedIndex = tempSavedList.findIndex(
            item => item.nugget_id === nuggetData.nugget_id,
          );
          if (tempIndex !== -1) {
            dispatch(
              setNuggetsList(getNuggetsReduxStoreDataFormate(categoryName, [])),
            );
            tempList[tempIndex] = {...tempList[tempIndex], saved: status};
          }
          dispatch(
            setNuggetsList(
              getNuggetsReduxStoreDataFormate(categoryName, tempList),
            ),
          );
          if (isFromProfile) {
            onFinishSave(nuggetData.nugget_id, status);
          }
          if (status && tempSavedIndex === -1) {
            tempSavedList = [...tempSavedList, {...nuggetData, saved: status}];
          } else if (!status && tempSavedIndex !== -1) {
            tempSavedList = tempSavedList.filter(
              ele => ele.nugget_id !== nuggetData.nugget_id,
            );
          }
          console.log(JSON.stringify(tempSavedList));
          dispatch(setSavedNuggetsList(tempSavedList));
          dispatch(setSavedNuggetsCount(res.data.saved_nugget_count));
        }
      })
      .catch(e => {
        console.log(e, 'save err');
      });
  };

  const handleBecomeFan = () => {
    // 1 - follow, 2 - unfollow
    const formData = new FormData();
    formData.append('token', token);
    formData.append('follow_userid', nuggetData.user_ref_id);
    formData.append('type', 1);
    followAndUnfollowService(formData)
      .then(res => {})
      .catch(e => {});
  };

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
            setloaderText('Deleting Nugget...');
            setisActionLoading(true);
            handleDeleteNugget(nuggetData.nugget_id);
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
            setloaderText('Blocking User...');
            setisActionLoading(true);
            handleBlockUser(nuggetData.user_id);
          },
        },
      ],
      {cancelable: false},
    );

  const onEditNugget = () => {
    navigation.navigate('PostEditNugget', {
      nugget: nuggetData,
      isSearchNugget: isFromGlobalSearch,
      categoryName: categoryName ?? 'forYou',
    });
  };

  const handleDeleteNugget = nuggetId => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nuggetId);
    deleteNuggetService(formData)
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
          } else if (isFromProfile) {
            onFinishDelete(nuggetId);
          }
          let tempSavedList = [...savedNuggetsList];
          let tempIndex = tempSavedList.findIndex(
            ele => ele.nugget_id === nuggetId,
          );
          if (tempIndex !== -1) {
            dispatch(setSavedNuggetsCount(savedNuggetsCount - 1));
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
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        setloaderText('');
        setisActionLoading(false);
      });
  };

  const handleBlockUser = userId => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('user_id', userId);
    formData.append('action', 1);
    blockUnblockUserService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          if (isFromGlobalSearch) {
            dispatch(
              setSearchedNuggetsList(
                [...searchedNuggetsList].filter(
                  item => item.user_id !== userId,
                ),
              ),
            );
          }
          let tempSavedList = [...savedNuggetsList];
          let tempIndex = tempSavedList.findIndex(
            ele => ele.nugget_id === nuggetId,
          );
          if (tempIndex !== -1) {
            dispatch(setSavedNuggetsCount(savedNuggetsCount - 1));
            dispatch(
              setSavedNuggetsList(
                tempSavedList.filter(item => item.nugget_id !== nuggetId),
              ),
            );
          }
          const filteredNuggetsList = [...nuggetsList].filter(
            item => item.user_id !== userId,
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
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        setloaderText('');
        setisActionLoading(false);
      });
  };

  const handleSharNugget = (type, sharedList) => {
    setloaderText('Sharing Nugget...');
    setisActionLoading(true);
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nuggetData.nugget_id);
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
            dispatch(setSavedNuggetsCount(savedNuggetsCount - 1));
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
        if (isMount) {
          setisActionLoading(false);
          setloaderText('');
        }
      });
  }

  const onPressShare = () => {
    setisOpenSharTypeList(true);
  };

  const onPressShareType = () => {
    if (
      (nuggetData.share_type === 3 || nuggetData.share_type === 4) &&
      nuggetData?.shared_detail &&
      nuggetData?.shared_detail.length > 0
    ) {
      setselectedShareTypeId(parseInt(nuggetData.share_type));
      setisOpenViewOnlySelectionModal(true);
    }
  };

  const getSelectionList = () => {
    if (isOpenViewOnlySelectionModal) {
      return nuggetData?.shared_detail?.map(item => {
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
    nugget: nuggetData,
    parentNuggetIndex: nuggetIndex,
    updateLike: updateLike,
    updateSave: updateSave,
    updateIsFan: updateIsFan,
    totalViews: nuggetData.total_views,
    totalComments: totalComments,
    setTotalComments: settotalComments,
    isRepeatVideo: isRepeatVideo,
    setisRepeatVideo: setisRepeatVideo,
    viewableItem: viewableItem,
    onFinishPlaying: index => {
      if (index < nuggetData?.media_list?.length - 1) {
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
        {nuggetData?.media_list?.length > 0 ? (
          // <BigList
          //   ref={flatlistRef}
          //   showsHorizontalScrollIndicator={false}
          //   style={[
          //     styles.listContainer,
          //     {height: mediaHeight ?? insets.mediaHeight},
          //   ]}
          //   data={nuggetData.media_list ?? []}
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
            showsHorizontalScrollIndicator={false}
            style={[
              styles.listContainer,
              {height: mediaHeight ?? insets.mediaHeight},
            ]}
            data={nuggetData.media_list ?? []}
            horizontal
            bounces={false}
            keyExtractor={item => item.media_id.toString()}
            renderItem={renderItem}
            pagingEnabled
            decelerationRate={0.9}
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={viewConfigRef.current}
          />
        ) : nuggetData.poll_option && nuggetData.poll_option.length > 0 ? (
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
              handleReportNugget(nuggetData.nugget_id, message);
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
