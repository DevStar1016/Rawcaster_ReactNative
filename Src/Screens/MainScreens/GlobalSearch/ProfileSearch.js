import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import SearchProfileItem from './SearchProfileItem';
import {useGlobalSearch} from '../../../Utilities/Contexts';
import {useToken} from '../../../Utilities/StoreData';
import {
  getAuthCode,
  getFilteredDuplicatesList,
  htmlDecodeText,
} from '../../../Utilities/Methods';
import {
  searchRawcasterUsersService,
  followAndUnfollowService,
} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import Loader from '../../../Components/Loader';
import StyledText from '../../../Components/StyledText';

var isMount = true;
var currentPage = 1;
var totalPages = 1;
const ProfileSearch = () => {
  const {searchText, setisActionLoading} = useGlobalSearch();
  const token = useToken();
  const [profileList, setprofileList] = useState([]);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [listContainerHeight, setlistContainerHeight] = useState(undefined);
  const [isRefreshing, setisRefreshing] = useState(false);

  const [isListLoading, setisListLoading] = useState(false);

  useEffect(() => {
    isMount = true;
    currentPage = 1;
    totalPages = 1;
    return () => {
      isMount = false;
      currentPage = 1;
      totalPages = 1;
    };
  }, []);

  useEffect(() => {
    if (searchText !== null) {
      setisListLoading(true);
      profileSearchAPICall(1);
    }
  }, [searchText]);

  const profileSearchAPICall = (pageNumber = 1) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('search_key', searchText);
    formData.append('auth_code', getAuthCode(token));
    formData.append('page_number', pageNumber);
    searchRawcasterUsersService(formData)
      .then(res => {
        if (isMount) {
          if (res.data.status === 1) {
            let decodedNuggetList = [...res.data.users_list].map(item => {
              return {
                ...item,
                display_name: htmlDecodeText(item.display_name),
                first_name: htmlDecodeText(item.first_name),
                last_name: htmlDecodeText(item.last_name),
              };
            });

            if (pageNumber === 1) {
              totalPages = parseInt(res.data.total_pages);
              setprofileList(decodedNuggetList);
            } else {
              setprofileList(preList => [...preList, ...decodedNuggetList]);
            }
          } else if (res.data.status === 0) {
            setprofileList([]);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          setprofileList([]);
        }
      })
      .finally(() => {
        if (isMount) {
          setisLoadMore(false);
          setisListLoading(false);
          setisRefreshing(false);
        }
      });
  };

  const handleBecomeFan = (userRefId, followType) => {
    // 1 - follow, 2 - unfollow
    if (isMount) {
      setisActionLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('follow_userid', userRefId);
    formData.append('type', followType);
    followAndUnfollowService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          setprofileList(preList => {
            let tempProfileList = [...preList];
            let tempIndex = [...preList].findIndex(
              item => item.user_ref_id === userRefId,
            );
            if (tempIndex !== -1) {
              tempProfileList[tempIndex] = {
                ...tempProfileList[tempIndex],
                follow: followType ? true : false,
              };
            }
            return tempProfileList;
          });
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
  };

  const onRefresh = () => {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setisRefreshing(true);
    }
    profileSearchAPICall(1);
  };

  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        profileSearchAPICall(currentPage);
      }
    }
  };
  const renderFooter = () => {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.primary} />
    ) : null;
  };

  const renderSeperator = () => {
    return <View style={styles.divider} />;
  };

  return (
    <View
      style={styles.mainContainer}
      onLayout={e => {
        setlistContainerHeight(e.nativeEvent.layout.height);
      }}>
      {isListLoading ? (
        <Loader indicatorColor={COLORS.primary} />
      ) : (
        <FlatList
          // data={getFilteredDuplicatesList(profileList, 'user_ref_id')}
          data={profileList}
          scrollEnabled={profileList.length > 0 ? true : false}
          renderItem={({item}) => {
            return (
              <SearchProfileItem
                item={item}
                onBecomeFan={() => {
                  handleBecomeFan(item.user_ref_id, 1);
                }}
                onConnectionRequest={() => {}}
              />
            );
          }}
          ListEmptyComponent={() => {
            return (
              <View
                style={[styles.emptyComponent, {height: listContainerHeight}]}>
                <StyledText style={{paddingVertical: 5}}>
                  We didn't find any results!
                </StyledText>
              </View>
            );
          }}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={isRefreshing}
              onRefresh={onRefresh}
            />
          }
          onEndReachedThreshold={0.2}
          onEndReached={onEndReached}
          keyExtractor={(item, _) => item.user_ref_id.toString()}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={renderSeperator}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

export default ProfileSearch;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  divider: {
    backgroundColor: COLORS.borderColor,
    height: 1,
  },
  emptyComponent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
