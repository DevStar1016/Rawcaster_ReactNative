import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import StyledText from '../../Components/StyledText';
import SearchInput from '../../Components/SearchInput';
import HOCView from '../../Components/HOCView';
import SmallButton from '../../Components/SmallButton';
import SVGIcon from '../../Components/SVGIcon';
import {COLORS} from '../../Utilities/Colors';
import InfluencerItem from './InfluencerItem';
import {SCREEN_PADDING_HORIZONTAL} from '../../Utilities/Constants';
import {FONTS} from '../../Utilities/Fonts';
import InfluencerCategoriesList from './InfluencerCategoriesList';
import {useProfile, useToken} from '../../Utilities/StoreData';
import {
  influencerListService,
  influencerFollowService,
} from '../../Services/ApiService';
import {
  getAuthCode,
  getDoubleDigit,
  getFilteredDuplicatesList,
} from '../../Utilities/Methods';
import Loader from '../../Components/Loader';
import Toast from '../../Components/Toast';
import {setIsVisibleInfluencers} from '../../Store/Slices/UtilitySlice';
import CheckBox from '../../Components/CheckBox';

var totalPages = 1;
var currentPage = 1;
var isMount = true;
const InfluencersList = () => {
  const token = useToken();
  const dispatch = useDispatch();
  const profile = useProfile();
  const [isLoading, setisLoading] = useState(true);
  const [searchText, setsearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [errorText, seterrorText] = useState('No data found');
  const [influencersList, setinfluencersList] = useState([]);
  const [refreshing, setrefreshing] = useState(false);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [selectedInfluencersRefIds, setselectedInfluencersRefIds] = useState(
    [],
  );
  const [isSelectedAll, setisSelectedAll] = useState(false);
  const [influencersTotalCount, setinfluencersTotalCount] = useState(0);
  const [isActionLoading, setisActionLoading] = useState(false);
  const [calledBecomeFan, setcalledBecomeFan] = useState(false);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
      currentPage = 1;
      totalPages = 1;
    };
  }, []);

  useEffect(() => {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setisLoading(true);
    }
    influencerListAPICall(1);
  }, [selectedCategoryId, searchText]);

  useEffect(() => {
    if (
      selectedInfluencersRefIds.length > 0 &&
      parseInt(influencersTotalCount) > 0 &&
      selectedInfluencersRefIds.length === parseInt(influencersTotalCount)
    ) {
      setisSelectedAll(true);
    }
  }, [selectedInfluencersRefIds.length]);

  const handleSelectAllInfluencers = (
    usersList = [],
    selectAllStatus = isSelectedAll,
  ) => {
    if (selectAllStatus) {
      const userIdsList = [...usersList].map(item => item.user_ref_id);
      setselectedInfluencersRefIds(preIdsList => {
        const idsList = [...preIdsList, ...userIdsList];
        return getFilteredDuplicatesList(idsList);
      });
    }
  };

  function influencerListAPICall(pageNumber = 1) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('page_number', pageNumber);
    if (searchText) {
      formData.append('search_key', searchText);
    }
    if (selectedCategoryId) {
      formData.append('category', selectedCategoryId);
    }
    console.log(JSON.stringify(formData), 'INFLUENCERS LIST FORMDATAA');
    influencerListService(formData)
      .then(res => {
        console.log(res.data, 'RESPONSE INFLUENCER LIST');
        if (res.data.status === 1) {
          if (isMount) {
            seterrorText(null);
            if (currentPage === 1) {
              totalPages = parseInt(res.data.total_pages);
              setinfluencersTotalCount(res.data.total_influencer_count);
              setinfluencersList(res.data.users_list);
            } else {
              setinfluencersList(pre => [...pre, ...res.data.users_list]);
            }
            handleSelectAllInfluencers(res.data.users_list);
          }
        } else if (res.data.status === 0) {
          if (isMount) {
            seterrorText(res.data.msg);
            setinfluencersList([]);
          }
        }
      })
      .catch(e => {
        console.log(e, 'INFLUENCERS LIST ERROR');
        Toast.fail(e.message);
        if (isMount) {
          seterrorText(e.message);
          setinfluencersList([]);
        }
      })
      .finally(() => {
        if (isMount) {
          setisLoadMore(false);
          setrefreshing(false);
          setisLoading(false);
        }
      });
  }

  function handleFilterInfluencerList(ids = [...selectedInfluencersRefIds]) {
    let tempInfluencersList = [...influencersList];
    tempInfluencersList = tempInfluencersList.filter(item => {
      let selectedId = ids.find(subItem => subItem === item.user_ref_id);
      if (selectedId) {
        return null;
      }
      return item;
    });
    setinfluencersList(tempInfluencersList);
    // if (isSelectedAll) {
    //   setinfluencersTotalCount(pre =>
    //     pre - ids.length > 0 ? pre - ids.length : 0,
    //   );
    // }
    setselectedInfluencersRefIds([]);
  }

  function handleSelectInfluencer(id) {
    let tempSelectedInfluencersIds = [...selectedInfluencersRefIds];
    if (tempSelectedInfluencersIds.find(refId => refId === id)) {
      tempSelectedInfluencersIds = tempSelectedInfluencersIds.filter(
        refId => refId !== id,
      );
      if (isSelectedAll) {
        setisSelectedAll(false);
      }
    } else {
      tempSelectedInfluencersIds.push(id);
    }
    setselectedInfluencersRefIds(tempSelectedInfluencersIds);
  }

  function getIsSelectedInfluencer(id) {
    return [...selectedInfluencersRefIds].find(refId => refId === id);
  }

  function handleInfluencerFollow(
    ids = [...selectedInfluencersRefIds],
    isSkipScreen = false,
  ) {
    if (isMount) {
      setisActionLoading(true);
    }

    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    if (!isSelectedAll) {
      formData.append('follow_userid', JSON.stringify(ids));
    }
    formData.append('select_all', isSelectedAll ? 1 : 0);

    influencerFollowService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            setcalledBecomeFan(true);
          }
          handleFilterInfluencerList(ids);
          if (isSkipScreen) {
            dispatch(setIsVisibleInfluencers(false));
          } else {
            Toast.success(res.data.msg);
          }
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

  function onRefresh() {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setrefreshing(true);
    }
    influencerListAPICall(1);
  }

  function onEndReached() {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        influencerListAPICall(currentPage);
      }
    }
  }

  function renderItem({item}) {
    return (
      <InfluencerItem
        item={item}
        isSelected={getIsSelectedInfluencer(item.user_ref_id)}
        onPressSelect={() => {
          handleSelectInfluencer(item.user_ref_id);
        }}
        onPressBecomeFan={() => {
          handleInfluencerFollow([item.user_ref_id]);
        }}
      />
    );
  }

  function emptyComponent() {
    return errorText ? (
      <View
        style={{
          marginTop: 50,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <StyledText style={{paddingVertical: 5}}>{errorText}</StyledText>
      </View>
    ) : null;
  }

  function renderFooter() {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.primary} />
    ) : null;
  }

  return (
    <HOCView
      // isEnableTopSafeAreaHomeHeader={true}
      isEnableScroll={false}
      paddingHorizontal={0}
      headerProps={{
        isEnableProfile: false,
        isEnableSearch: false,
        isEnableLive: false,
      }}
      headerType="home_header">
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <StyledText
            style={{
              fontFamily: FONTS.DMSans.bold,
              fontSize: 18,
              paddingVertical: 5,
            }}>
            {`Welcome ${profile?.name} - Select your influencers`}
          </StyledText>
        </View>
        <View style={styles.searchContainer}>
          <View style={{flex: 1, paddingRight: 10}}>
            <SearchInput
              onSearch={setsearchText}
              placeHolderText={'Search Influencer by name'}
            />
          </View>

          <SmallButton
            buttonText={calledBecomeFan ? 'Next' : 'Skip'}
            isEnableIcon
            containerStyle={styles.smallButton}
            onPress={() => {
              Keyboard.dismiss();
              dispatch(setIsVisibleInfluencers(false));
            }}
          />
        </View>
        <InfluencerCategoriesList
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={id => {
            if (isMount) {
              setisSelectedAll(false);
              setselectedInfluencersRefIds([]);
              setSelectedCategoryId(id);
            }
          }}
        />
        <View style={{paddingHorizontal: 15}}>
          <View style={styles.listHeader}>
            <View style={{flexDirection: 'row'}}>
              <CheckBox
                isVisibleText={false}
                isSelected={isSelectedAll}
                mainContainerStyle={{marginRight: 10}}
                onPress={() => {
                  if (isMount) {
                    setisSelectedAll(pre => {
                      const updatedStatus = !pre;
                      if (updatedStatus) {
                        handleSelectAllInfluencers(
                          [...influencersList],
                          updatedStatus,
                        );
                      } else {
                        setselectedInfluencersRefIds([]);
                      }
                      return updatedStatus;
                    });
                  }
                }}
              />
              <StyledText
                style={{
                  paddingVertical: 5,
                }}>{`Selected ${isSelectedAll ? 'All' : 'Influencers'} (${
                isSelectedAll
                  ? getDoubleDigit(influencersTotalCount)
                  : getDoubleDigit(selectedInfluencersRefIds.length)
              })`}</StyledText>
            </View>
            <TouchableOpacity
              style={[
                styles.becomeFanButton,
                {opacity: selectedInfluencersRefIds.length > 0 ? 1 : 0.5},
              ]}
              activeOpacity={0.7}
              disabled={selectedInfluencersRefIds.length <= 0}
              onPress={() => {
                handleInfluencerFollow(selectedInfluencersRefIds);
              }}>
              <StyledText style={{paddingVertical: 5}}>Become a Fan</StyledText>
              <SVGIcon
                icon="right_arrow"
                height={13}
                width={13}
                marginLeft={5}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
        </View>

        <View style={styles.influencersListContainer}>
          {isLoading ? (
            <Loader
              loaderText="Fetching Influencers"
              indicatorColor={COLORS.primary}
              loaderTextColor={COLORS.primary}
            />
          ) : (
            <FlatList
              data={influencersList}
              contentContainerStyle={{paddingBottom: 15}}
              renderItem={renderItem}
              keyExtractor={(_, index) => index.toString()}
              ListEmptyComponent={emptyComponent}
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
      <Modal onRequestClose={() => {}} transparent visible={isActionLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </HOCView>
  );
};

export default InfluencersList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING_HORIZONTAL,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING_HORIZONTAL,
    paddingVertical: 10,
  },
  smallButton: {
    height: 45,
  },

  listHeader: {
    paddingTop: 5,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  becomeFanButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    backgroundColor: COLORS.borderColor,
    height: 1.5,
  },
  influencersListContainer: {
    flex: 1,
    paddingTop: 5,
    paddingHorizontal: SCREEN_PADDING_HORIZONTAL,
  },
});
