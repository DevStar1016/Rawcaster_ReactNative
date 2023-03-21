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
import {useNavigation} from '@react-navigation/native';
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
import {getAuthCode, getDoubleDigit} from '../../Utilities/Methods';
import Loader from '../../Components/Loader';
import Toast from '../../Components/Toast';
import {setIsVisibleInfluencers} from '../../Store/Slices/UtilitySlice';

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
  const [isActionLoading, setisActionLoading] = useState(false);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
      currentPage = 1;
      totalPages = 1;
    };
  }, []);

  useEffect(() => {
    if (isMount) {
      setisLoading(true);
    }
    influencerListAPICall(1);
  }, [selectedCategoryId, searchText]);

  const influencerListAPICall = (pageNumber = 1) => {
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

    influencerListService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            seterrorText(null);
            if (currentPage === 1) {
              totalPages = parseInt(res.data.total_pages);
              setinfluencersList(res.data.users_list);
            } else {
              setinfluencersList(pre => [...pre, ...res.data.users_list]);
            }
          }
        } else if (res.data.status === 0) {
          if (isMount) {
            seterrorText(res.data.msg);
          }
        }
      })
      .catch(e => {
        Toast.fail(e.message);
        if (isMount) {
          seterrorText(e.message);
        }
      })
      .finally(() => {
        if (isMount) {
          setisLoadMore(false);
          setrefreshing(false);
          setisLoading(false);
        }
      });
  };

  const handleFilterInfluencerList = (ids = [...selectedInfluencersRefIds]) => {
    let tempInfluencersList = [...influencersList];
    tempInfluencersList = tempInfluencersList.filter(item => {
      let selectedId = ids.find(subItem => subItem === item.user_ref_id);
      if (selectedId) {
        return null;
      }
      return item;
    });
    setinfluencersList(tempInfluencersList);
    setselectedInfluencersRefIds([]);
  };

  const handleSelectInfluencer = id => {
    let tempSelectedInfluencersIds = [...selectedInfluencersRefIds];
    if (tempSelectedInfluencersIds.find(refId => refId === id)) {
      tempSelectedInfluencersIds = tempSelectedInfluencersIds.filter(
        refId => refId !== id,
      );
    } else {
      tempSelectedInfluencersIds.push(id);
    }
    setselectedInfluencersRefIds(tempSelectedInfluencersIds);
  };

  const getIsSelectedInfluencer = id => {
    return [...selectedInfluencersRefIds].find(refId => refId === id);
  };

  const handleInfluencerFollow = (
    ids = [...selectedInfluencersRefIds],
    isSkipScreen = false,
  ) => {
    if (isMount) {
      setisActionLoading(true);
    }

    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('follow_userid', JSON.stringify(ids));
    influencerFollowService(formData)
      .then(res => {
        if (res.data.status === 1) {
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
  };

  const onRefresh = () => {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setrefreshing(true);
    }
    influencerListAPICall(1);
  };

  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        influencerListAPICall(currentPage);
      }
    }
  };

  const renderItem = ({item}) => {
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
  };

  const emptyComponent = () => {
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
  };

  const renderFooter = () => {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.primary} />
    ) : null;
  };

  return (
    <HOCView
      isEnableTopSafeAreaHomeHeader={true}
      isEnableScroll={false}
      paddingHorizontal={0}
      headerType="home_header">
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <StyledText
            style={{
              fontFamily: FONTS.DMSans.bold,
              fontSize: 18,
              paddingVertical: 5,
            }}>
            {`Welcome ${profile.name} - Select your influencers`}
          </StyledText>
        </View>
        <View style={styles.searchContainer}>
          <View style={{flex: 1, paddingRight: 10}}>
            <SearchInput
              onPressSearch={setsearchText}
              placeHolderText={'Search Influencer by name'}
            />
          </View>

          <SmallButton
            buttonText="Skip"
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
          onSelectCategory={setSelectedCategoryId}
        />
        <View style={{paddingHorizontal: 15}}>
          <View style={styles.listHeader}>
            <StyledText
              style={{
                paddingVertical: 5,
              }}>{`Selected Influencers (${getDoubleDigit(
              selectedInfluencersRefIds.length,
            )})`}</StyledText>
            <TouchableOpacity
              style={[
                styles.becomeFanButton,
                {opacity: selectedInfluencersRefIds.length > 0 ? 1 : 0.5},
              ]}
              activeOpacity={0.7}
              disabled={selectedInfluencersRefIds.length <= 0}
              onPress={() => {
                handleInfluencerFollow(selectedInfluencersRefIds, true);
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
