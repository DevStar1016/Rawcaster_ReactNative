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
import SVGIcon from '../../../Components/SVGIcon';
import {FONTS} from '../../../Utilities/Fonts';
import {LineChart} from 'react-native-chart-kit';

var isMount = true;
var currentPage = 1;
var totalPages = 1;
const TagsSearch = () => {
  const {searchText, setisActionLoading} = useGlobalSearch();
  const token = useToken();
  const [tagsList, settagsList] = useState([]);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [listContainerHeight, setlistContainerHeight] = useState(undefined);
  const [isRefreshing, setisRefreshing] = useState(false);
  let testObj = [
    {
      total_nuggets: 10,
      hours: 10,
    },
    {
      total_nuggets: 30,
      hours: 13,
    },
    {
      total_nuggets: 10,
      hours: 5,
    },
    {
      total_nuggets: 5,
      hours: 19,
    },
    {
      total_nuggets: 58,
      hours: 2,
    },
    {
      total_nuggets: 18,
      hours: 27,
    },
  ];

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
      tagsSearchAPICall(1);
    }
  }, [searchText]);

  const tagsSearchAPICall = (pageNumber = 1) => {
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
              settagsList(decodedNuggetList);
            } else {
              settagsList(preList => [...preList, ...decodedNuggetList]);
            }
          } else if (res.data.status === 0) {
            settagsList([]);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          settagsList([]);
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

  const onRefresh = () => {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setisRefreshing(true);
    }
    tagsSearchAPICall(1);
  };

  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        tagsSearchAPICall(currentPage);
      }
    }
  };

  const renderItem = () => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemRowContainer}>
          <View style={{maxWidth: '80%'}}>
            <StyledText>Trending in Pakistan</StyledText>
          </View>
          <SVGIcon icon="menu_horizontal" isButton height={20} width={20} />
        </View>
        <View style={styles.itemRowContainer}>
          <View>
            <StyledText style={{fontFamily: FONTS.DMSans.bold}}>
              Neymar
            </StyledText>
            <StyledText style={{paddingVertical: 3, fontSize: 13}}>
              11.2K Tweets
            </StyledText>
          </View>
          <View style={styles.trendingChartContainer}>
            <LineChart
              width={200} // from react-native
              height={70}
              style={{height: 70}}
              chartConfig={{
                height: 40,
                backgroundColor: COLORS.white,
                backgroundGradientFrom: COLORS.white,
                backgroundGradientTo: COLORS.white,
                linejoinType: 'round',
                strokeWidth: 2,
                propsForBackgroundLines: {
                  stroke: '#D6DADE',
                },
                color: (opacity = 1) => COLORS.secondary,
              }}
              bezier
              withDots={false}
              withHorizontalLabels={false}
              withShadow={false}
              withVerticalLabels={false}
              withInnerLines={false}
              // withHorizontalLines={false}
              // withVerticalLines={false}

              data={{
                datasets: [
                  {
                    data: testObj.map(item => item.hours),
                  },
                ],
              }}
            />
          </View>
        </View>
      </View>
    );
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
          // data={getFilteredDuplicatesList(tagsList, 'user_ref_id')}
          // data={tagsList}
          data={testObj}
          // scrollEnabled={tagsList.length > 0 ? true : false}
          renderItem={renderItem}
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
          // keyExtractor={(item, _) => item.user_ref_id.toString()}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={renderSeperator}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

export default TagsSearch;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  itemContainer: {
    padding: 10,
  },
  itemRowContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  trendingChartContainer: {},
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
