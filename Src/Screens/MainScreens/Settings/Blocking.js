import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import SearchInput from '../../../Components/SearchInput';
import SVGIcon from '../../../Components/SVGIcon';
import {useConnectionsList, useToken} from '../../../Utilities/StoreData';
import {
  blockMultipleUserService,
  blockUnblockUserService,
  listAllBlockedUsersService,
} from '../../../Services/ApiService';
import MultiItemsSelectList from '../../../Modals/MultiItemsSelectList';
import Loader from '../../../Components/Loader';
import {setConnectionsList} from '../../../Store/Slices/HomeSlice';
import Toast from '../../../Components/Toast';
import {useDispatch} from 'react-redux';
import {getSlicedText} from '../../../Utilities/Methods';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import SubmitButton from '../../../Components/SubmitButton';
import TitleDescriptionContainer from '../../../Components/TitleDescriptionContainer';
var currentPage = 1;
var totalPages = 1;
var isMount = true;
const Blocking = () => {
  const token = useToken();
  const connectionsList = useConnectionsList();
  const dispatch = useDispatch();
  const [blockedUsersList, setblockedUsersList] = useState([]);
  const [isLoading, setisLoading] = useState(true);
  const [isActionLoading, setisActionLoading] = useState(false);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [refreshing, setrefreshing] = useState(false);
  const [emptyText, setemptyText] = useState('');
  const [loaderText, setloaderText] = useState('');
  const [isOpenConnectionsList, setisOpenConnectionsList] = useState(false);

  useEffect(() => {
    isMount = true;
    listAllBlockedUsersAPICall(1);
    return () => {
      isMount = false;
    };
  }, []);

  function listAllBlockedUsersAPICall(pageNumber = 1, searchText = '') {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('page_number', pageNumber);
    if (searchText.trim()) {
      formData.append('search_key', searchText.trim());
    }
    listAllBlockedUsersService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            if (pageNumber === 1) {
              console.log(res.data.blocked_list, 'IOP');
              totalPages = parseInt(res.data.total_pages);
              setblockedUsersList(res.data.blocked_list);
            } else {
              setblockedUsersList(preList => [
                ...preList,
                ...res.data.blocked_list,
              ]);
            }
          }
        } else if (res.data.status === 0) {
          if (isMount) {
            setblockedUsersList([]);
            setemptyText(res.data.msg);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          setblockedUsersList([]);
          setemptyText(e.message);
        }
      })
      .finally(() => {
        if (isMount) {
          setisLoadMore(false);
          setisLoading(false);
          setrefreshing(false);
        }
      });
  }

  function keyExtractor(item, index) {
    return index.toString();
  }

  function onRefresh() {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setrefreshing(true);
    }
    listAllBlockedUsersAPICall(1);
  }

  function onEndReached() {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        listAllBlockedUsersAPICall(currentPage);
      }
    }
  }

  function handleBlockUsers(list) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('user_id', JSON.stringify(list));

    blockMultipleUserService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          let tempConnectionsList = [...connectionsList];
          let tempFilteredConnectionsList = [...tempConnectionsList].filter(
            item => {
              return !list.includes(item.user_id);
            },
          );
          dispatch(setConnectionsList(tempFilteredConnectionsList));
          let tempBlockedUsersList = [...tempConnectionsList].reduce(
            (result, item) => {
              if (list.includes(item.user_id)) {
                result.push(item);
              }
              return result;
            },
            [],
          );

          setblockedUsersList(preList => [...preList, ...tempBlockedUsersList]);
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisActionLoading(false);
        }
      });
  }

  function handleUnBlockUser(userId) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('user_id', userId);
    formData.append('action', 2);
    blockUnblockUserService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          setblockedUsersList(preList =>
            [...preList].filter(item => item.user_id !== userId),
          );
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisActionLoading(false);
        }
      });
  }

  function onBlockusers(list) {
    console.log(list, 'BLOCK');
    Alert.alert(
      'Block!',
      'Do you want to block the selected Users?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            if (isMount) {
              setloaderText('Blocking Selected Users');
              setisActionLoading(true);
            }
            handleBlockUsers(list);
          },
        },
      ],
      {cancelable: false},
    );
  }

  function onPressUnblockUser(userId, name) {
    Alert.alert(
      'Block!',
      `Do you want to unblock ${getSlicedText(name, 20)} ?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            if (isMount) {
              setloaderText(`UnBlocking ${getSlicedText(name, 20)}`);
              setisActionLoading(true);
            }
            handleUnBlockUser(userId);
          },
        },
      ],
      {cancelable: false},
    );
  }

  function renderBlockedUser({item}) {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemNameProfileContainer}>
          <ProfileWithBadge
            profileImage={item.profile_img}
            padding={0}
            extraMargin={0}
            profileSize={30}
          />
          <View style={styles.itemNameContainer}>
            <StyledText>{getSlicedText(item.display_name, 20)}</StyledText>
          </View>
        </View>
        <SubmitButton
          buttonText="UnBlock"
          padding={0}
          marginBottom={0}
          marginHorizontal={0}
          marginTop={0}
          paddingHorizontal={10}
          paddingVertical={3}
          borderRadius={7}
          textPaddingVertical={0}
          bgColor={COLORS.red}
          borderColor={COLORS.red}
          onPress={() => {
            onPressUnblockUser(item.user_id, item.display_name);
          }}
          buttonTextStyle={styles.itemButtonText}
        />
      </View>
    );
  }

  function renderFooter() {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.primary} />
    ) : null;
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack title="Blocking" isEnableSafeArea />
      <View style={styles.contentContainer}>
        <TitleDescriptionContainer
          title="Users Management"
          description="Search and block users in your connection list."
        />
        <TouchableOpacity
          style={styles.clickableSearchBox}
          activeOpacity={0.8}
          onPress={() => {
            if (isMount) {
              setisOpenConnectionsList(true);
            }
          }}>
          <StyledText style={{color: COLORS.placeHolderColor}}>
            Search your connections
          </StyledText>
          <View style={styles.searchIconContainer}>
            <SVGIcon icon="search" height={20} width={20} />
          </View>
        </TouchableOpacity>
        <View style={styles.blockedUsersContainer}>
          <TitleDescriptionContainer
            title="Blocked Connections"
            description="Search and unblock users in your connection list."
          />
          <SearchInput
            placeHolderText="User Name"
            onSearch={searchText => {
              if (isMount) {
                setisLoading(true);
              }
              listAllBlockedUsersAPICall(1, searchText);
            }}
            containerStyle={{backgroundColor: COLORS.white, height: 40}}
            inputContainerStyle={{
              backgroundColor: COLORS.white,
              height: 40,
              fontSize: 14,
            }}
            searchButtonStyle={{height: 40, width: 40, borderRadius: 20}}
            searchIconSize={20}
            searchButtonColor={COLORS.primary}
          />
          <View style={styles.blockedUsersListContainer}>
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator color={COLORS.primary} size={'large'} />
              </View>
            ) : (
              <FlatList
                data={blockedUsersList}
                renderItem={renderBlockedUser}
                keyboardShouldPersistTaps="handled"
                keyExtractor={keyExtractor}
                ListEmptyComponent={() => {
                  return (
                    <View style={styles.emptyContainer}>
                      <StyledText>
                        {emptyText.trim()
                          ? emptyText.trim()
                          : 'No blocked user found'}
                      </StyledText>
                    </View>
                  );
                }}
                contentContainerStyle={{paddingVertical: 5}}
                showsVerticalScrollIndicator={false}
                onEndReached={onEndReached}
                refreshControl={
                  <RefreshControl
                    tintColor={COLORS.secondary}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                onEndReachedThreshold={0.3}
                ItemSeparatorComponent={() => {
                  return <View style={{height: 10}} />;
                }}
                ListFooterComponent={renderFooter}
              />
            )}
          </View>
        </View>
      </View>

      <Modal
        visible={isOpenConnectionsList}
        statusBarTranslucent
        onRequestClose={() => {
          if (isMount) {
            setisOpenConnectionsList(false);
          }
        }}>
        <MultiItemsSelectList
          title={'Block Connection'}
          imageFieldName={'profile_img'}
          onCloseModal={() => {
            if (isMount) {
              setisOpenConnectionsList(false);
            }
          }}
          isTitleCenter={false}
          rightTextButtonStyle={{
            paddingHorizontal: 15,
            paddingVertical: 4,
            backgroundColor: COLORS.red,
          }}
          rightButtonType="text"
          rightButtonText="Block"
          displayFieldName={'display_name'}
          idFieldName={'user_id'}
          list={connectionsList}
          onSelectItems={list => {
            if (isMount) {
              setisOpenConnectionsList(false);
            }
            onBlockusers(list);
          }}
        />
      </Modal>

      <Modal visible={isActionLoading} transparent>
        <Loader bgColor={COLORS.transparentDimColor} loaderText={loaderText} />
      </Modal>
    </View>
  );
};

export default Blocking;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  clickableSearchBox: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
  },
  searchIconContainer: {
    backgroundColor: COLORS.primary,
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedUsersContainer: {
    backgroundColor: COLORS.lightGrey,
    paddingHorizontal: 10,
    flex: 1,
    borderRadius: 5,
    marginVertical: 15,
  },
  blockedUsersListContainer: {
    flex: 1,
    paddingVertical: 5,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  itemContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  itemNameContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  itemNameProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  itemButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
    fontSize: 14,
  },
});
