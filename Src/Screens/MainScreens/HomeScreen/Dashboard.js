import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {listNuggetsService} from '../../../Services/ApiService';
import {
  useInsets,
  useNuggetsList,
  useNuggetType,
  useToken,
} from '../../../Utilities/StoreData';
import {useDispatch} from 'react-redux';
import Nugget from './Nugget';
import CustomHomeHeader from '../../../Components/CustomHomeHeader';
import GradientButton from '../../../Components/GradientButton';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../../../Utilities/Colors';
import {setNuggetsList} from '../../../Store/Slices/HomeSlice';
import {DIMENSIONS} from '../../../Utilities/Constants';
import Loader from '../../../Components/Loader';
import {setIsBottomTabBarAbsolute} from '../../../Store/Slices/UtilitySlice';
import {htmlDecodeText} from '../../../Utilities/Methods';
var currentPage = 1;
var totalPages = 1;
const Dashboard = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const insets = useInsets();
  const [isLoading, setisLoading] = useState(true);
  const token = useToken();
  const flatlistRef = useRef(null);
  const nuggetType = useNuggetType();
  const nuggetsList = useNuggetsList();
  const [viewableItem, setviewableItem] = useState('');
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isMuted, setisMuted] = useState(true);
  const [headerContainerHeight, setheaderContainerHeight] = useState(0);
  const [refreshing, setrefreshing] = useState(false);
  const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 80});
  const onViewRef = useRef(viewableItems => {
    if (viewableItems?.viewableItems?.length > 0)
      setviewableItem(viewableItems.viewableItems[0].item.nugget_id || 0);
  });

  useEffect(() => {
    currentPage = 1;
    totalPages = 1;
    dispatch(setIsBottomTabBarAbsolute(true));
    return () => {
      currentPage = 1;
      totalPages = 1;
    };
  }, []);

  useEffect(() => {
    if (flatlistRef.current && (nuggetType === 1 || nuggetType === 2)) {
      flatlistRef.current.scrollToOffset({animated: false, offset: 0});
    }
  }, [nuggetType]);

  useEffect(() => {
    dispatch(setNuggetsList([]));
    listNuggetsAPICall(1);
  }, [token]);

  const listNuggetsAPICall = (pageNumber = 1) => {
    const formData = new FormData();
    formData.append('token', token ?? 'RAWCAST');
    formData.append('page_number', pageNumber);
    formData.append('nugget_type', nuggetType);
    listNuggetsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          let decodedNuggetList = [...res.data.nuggets_list].map(item => {
            return {
              ...item,
              content: htmlDecodeText(item.content),
              original_user_name: htmlDecodeText(item.original_user_name),
              user_name: htmlDecodeText(item.user_name),
            };
          });
          console.log(decodedNuggetList[0], 'NUGGET');
          if (pageNumber === 1) {
            totalPages = parseInt(res.data.total_pages);
            dispatch(setNuggetsList(decodedNuggetList));
          } else {
            dispatch(setNuggetsList([...nuggetsList, ...decodedNuggetList]));
          }
        }
      })
      .catch(e => {
        console.log(e, 'ERROR LIST NUGGET API');
      })
      .finally(() => {
        setisLoading(false);
        setrefreshing(false);
        setisLoadMore(false);
      });
  };

  const onRefresh = () => {
    currentPage = 1;
    totalPages = 1;
    listNuggetsAPICall(1);
  };

  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      setisLoadMore(true);
      listNuggetsAPICall(currentPage);
    }
  };

  const renderFooter = () => {
    return isLoadMore ? (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.primary,
        }}>
        <ActivityIndicator size={'small'} color={COLORS.white} />
      </View>
    ) : null;
  };

  return (
    <View style={styles.mainContainer}>
      <View
        onLayout={e => {
          setheaderContainerHeight(e.nativeEvent.layout.height);
        }}
        style={{
          position: 'absolute',
          top: insets.top ? insets.top : StatusBar.currentHeight,
          left: 0,
          right: 0,
          zIndex: 1,
        }}>
        <CustomHomeHeader
          bgColor={COLORS.transparent}
          isEnableAddUserButton={false}
        />

        {!token && (
          <GradientButton
            icon="app_logo_white"
            rightIcon="right_arrow_white"
            buttonText="Log in/Sign up to explore Rawcaster"
            marginHorizontal={15}
            onPress={() => {
              navigation.navigate('Login');
            }}
            marginVertical={10}
            containerPadding={7}
            buttonTextStyle={{fontSize: 14, marginLeft: 10, marginRight: 10}}
            leftIcon={'app_logo_white'}
          />
        )}
      </View>
      {isLoading ? (
        <Loader
          loaderText="Fetching Nuggets"
          isEnableDefaultLoaderBackground={true}
        />
      ) : (
        <FlatList
          ref={flatlistRef}
          showsVerticalScrollIndicator={false}
          data={nuggetsList}
          // nestedScrollEnabled
          horizontal={false}
          keyExtractor={item => item.nugget_id.toString()}
          getItemLayout={(_, index) => ({
            length: insets.mediaHeight,
            offset: insets.mediaHeight * index,
            index,
          })}
          onScrollToIndexFailed={() => {}}
          windowSize={20}
          renderItem={({item, index}) => (
            <Nugget
              nugget={item}
              headerContainerHeight={headerContainerHeight}
              isMuted={isMuted}
              setisMuted={setisMuted}
              rootFlatListRef={flatlistRef}
              nuggetIndex={index}
              viewableNuggetItem={viewableItem}
              onFinishPlaying={index => {
                if (index < nuggetsList.length - 1) {
                  flatlistRef.current.scrollToIndex({
                    index: index + 1,
                  });
                }
              }}
            />
          )}
          pagingEnabled
          // decelerationRate={'normal'}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          onEndReachedThreshold={0.5}
          onEndReached={onEndReached}
          ListFooterComponent={renderFooter}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />
      )}
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});
