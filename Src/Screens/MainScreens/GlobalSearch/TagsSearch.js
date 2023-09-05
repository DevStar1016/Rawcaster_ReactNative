import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import {useGlobalSearch} from '../../../Utilities/Contexts';
import {useToken} from '../../../Utilities/StoreData';
import {getAuthCode} from '../../../Utilities/Methods';
import {tagListService} from '../../../Services/ApiService';
import Loader from '../../../Components/Loader';
import StyledText from '../../../Components/StyledText';
import SVGIcon from '../../../Components/SVGIcon';
import {FONTS} from '../../../Utilities/Fonts';
import {DIMENSIONS} from '../../../Utilities/Constants';
import {LineChart} from 'react-native-chart-kit';
import DefaultBackground from '../../../Components/DefaultBackground';
// import {LineChart} from 'react-native-charts-wrapper';

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
    // if (searchText !== null) {
    setisListLoading(true);
    tagsSearchAPICall(1);
    // }
  }, [searchText]);

  /**
   * Makes an API call to search for tags using the provided search text and page number.
   * @param {number} [pageNumber=1] - The page number to retrieve results from.
   * @returns None
   */
  const tagsSearchAPICall = (pageNumber = 1) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('search_tag', searchText || '');
    formData.append('auth_code', getAuthCode(token));
    formData.append('page_number', pageNumber);
    tagListService(formData)
      .then(res => {
        if (isMount) {
          if (res.data.status === 1) {
            if (pageNumber === 1) {
              totalPages = parseInt(res.data.total_pages);
              settagsList([...res.data.tags]);
            } else {
              settagsList(preList => [...preList, ...res.data.tags]);
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

  /**
   * Function called when refreshing the page or data. It resets the current page number
   * and total number of pages, and then makes an API call to search for tags.
   * @returns None
   */
  const onRefresh = () => {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setisRefreshing(true);
    }
    tagsSearchAPICall(1);
  };

  /**
   * Function called when the end of the list is reached, indicating that more items should be loaded.
   * It increments the currentPage variable by 1 and checks if there are more pages to load.
   * If there are more pages and the component is mounted, it sets the isLoadMore state to true
   * and makes an API call to fetch the next page of tags.
   * @returns None
   */
  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        tagsSearchAPICall(currentPage);
      }
    }
  };

  const renderItem = ({item}) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemRowContainer}>
          <View style={{maxWidth: '80%'}}>
            <StyledText>Trending in {item?.country}</StyledText>
          </View>
          <SVGIcon icon="menu_horizontal" isButton height={20} width={20} />
        </View>
        <View style={styles.itemRowContainer}>
          <View style={{width: (DIMENSIONS.window.width - 30) / 2}}>
            <StyledText style={{fontFamily: FONTS.DMSans.bold}}>
              {item?.tag}
            </StyledText>
            <StyledText style={{paddingVertical: 3, fontSize: 13}}>
              {item?.nugget_count} Nuggets
            </StyledText>
          </View>
          <View style={styles.trendingChartContainer}>
            <LineChart
              width={(DIMENSIONS.window.width - 30) / 2}
              height={70}
              style={{
                paddingBottom: 0,
                paddingLeft: 0,
              }}
              fromNumber={0}
              chartConfig={{
                height: 70,
                paddingTop: 0,
                backgroundColor: COLORS.green,
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
              segments={0}
              // transparent
              // withHorizontalLines={false}
              // withVerticalLines={false}

              data={{
                datasets: [
                  {
                    data: item?.trends?.map(item => item.total_nuggets),
                  },
                ],
              }}
            />
            {/* <LineChart
              style={{height: 50, width: 200}}
              data={{
                dataSets: [
                  {
                    values: [
                      {
                        y: 35,
                        x: 0,
                        marker: '35 kg',
                      },
                      {
                        y: 47,
                        x: 1,
                        marker: '47 kg',
                      },
                      {
                        y: 46,
                        x: 2,
                        marker: '46 kg',
                      },
                      {
                        y: 44,
                        x: 3,
                        marker: '44 kg',
                      },
                      {
                        y: 46,
                        x: 4,
                        marker: '46 kg',
                      },
                      {
                        y: 35,
                        x: 5,
                        marker: 'Today: 35 kg',
                      },
                    ],
                    label: '',
                    config: {
                      mode: 'CUBIC_BEZIER',
                      drawValues: false,
                      lineWidth: 2,
                      drawCircles: false,
                      circleColor: processColor('red'),
                      drawCircleHole: false,
                      circleRadius: 5,
                      highlightColor: processColor('transparent'),
                      color: processColor(COLORS.secondary),
                      drawFilled: false,
                      fillGradient: {
                        colors: [processColor('red'), processColor('yellow')],
                        positions: [0, 0.5],
                        angle: 90,
                        orientation: 'TOP_BOTTOM',
                      },
                      fillAlpha: 1000,
                      valueTextSize: 15,
                    },
                  },
                ],
              }}
              chartDescription={{text: ''}}
              legend={{
                enabled: false,
              }}
              marker={{
                enabled: false,
                markerColor: processColor('white'),
                textColor: processColor('black'),
              }}
              xAxis={{
                enabled: true,
                granularity: 0,
                drawLabels: false,
                position: 'BOTTOM',
                drawAxisLine: true,
                drawGridLines: false,
                fontFamily: 'HelveticaNeue-Medium',
                fontWeight: 'bold',
                textSize: 12,
                textColor: processColor('gray'),
                valueFormatter: [],
                axisDashedLine: {
                  lineLength: 5,
                  spaceLength: 5,
                },
              }}
              yAxis={{
                left: {
                  enabled: true,
                  textColor: processColor('red'),
                  drawGridLines: false,
                  gridLineWidth: 1,
                  drawAxisLine: true,
                  drawLabels: false,
                  yOffset: -5,
                  position: 'INSIDE_CHART',
                  textSize: 10,
                  gridColor: processColor('grey'),
                },
                right: {
                  enabled: false,
                },
              }}
              autoScaleMinMaxEnabled={true}
              animation={{
                durationX: 0,
                durationY: 0,
                easingY: 'EaseInOutQuart',
              }}
              drawGridBackground={false}
              drawBorders={false}
              touchEnabled={true}
              dragEnabled={false}
              scaleEnabled={false}
              scaleXEnabled={false}
              scaleYEnabled={false}
              pinchZoom={false}
              doubleTapToZoomEnabled={false}
              dragDecelerationEnabled={true}
              dragDecelerationFrictionCoef={0.99}
              keepPositionOnRotation={false}
            /> */}
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
  function renderEmptyComponent() {
    return (
      <View style={[styles.emptyComponent, {height: listContainerHeight}]}>
        <DefaultBackground />
        <StyledText style={{color: COLORS.white, paddingVertical: 5}}>
          We didn't find any results!
        </StyledText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.mainContainer,
        tagsList.length > 0 && {paddingVertical: 5, paddingHorizontal: 15},
      ]}
      onLayout={e => {
        setlistContainerHeight(e.nativeEvent.layout.height);
      }}>
      {isListLoading ? (
        <Loader indicatorColor={COLORS.primary} />
      ) : (
        <FlatList
          data={tagsList}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyComponent}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={isRefreshing}
              onRefresh={onRefresh}
            />
          }
          onEndReachedThreshold={0.2}
          onEndReached={onEndReached}
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
  },
  itemContainer: {
    padding: 10,
  },
  itemRowContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  trendingChartContainer: {
    // height: 70,
    // backgroundColor: 'white',
    width: (DIMENSIONS.window.width - 30) / 2,
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
