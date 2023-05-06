import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import NotificationItem from './NotificationItem';
import DefaultBackground from '../../../Components/DefaultBackground';
import SVGIcon from '../../../Components/SVGIcon';
import {COLORS} from '../../../Utilities/Colors';
import {useToken} from '../../../Utilities/StoreData';
import {listNotificationsService} from '../../../Services/ApiService';
import StyledText from '../../../Components/StyledText';
import moment from 'moment';
import {FONTS} from '../../../Utilities/Fonts';

type Props = {
  notificationListType?: number;
  currentPage?: number;
  totalPages?: number;
};
var isMount = true;
const NotificationsList = ({
  notificationListType,
  currentPage = 1,
  totalPages = 1,
}: Props) => {
  const token = useToken();
  const [isLoading, setisLoading] = useState(true);
  const [refreshing, setrefreshing] = useState(false);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [notificationsList, setnotificationsList] = useState<any[]>([]);
  const [errorText, seterrorText] = useState('');
  useEffect(() => {
    isMount = true;
    listNotificationsAPICall();

    return () => {
      isMount = false;
    };
  }, []);

  function listNotificationsAPICall(pageNumber = 1) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('notification_type', notificationListType);
    formData.append('page_number', pageNumber);
    if (notificationListType === 2) {
      console.log(formData, 'FORM');
    }
    listNotificationsService(formData)
      .then(res => {
        if (notificationListType === 2) {
          console.log(res.data, 'DATAA');
        }
        if (isMount) {
          if (res.data.status === 1) {
            seterrorText('');
            setnotificationsList(res.data.notification_list);
            if (pageNumber === 1) {
              totalPages = parseInt(res.data.total_pages);
              setnotificationsList(res.data.notification_list);
            } else {
              setnotificationsList(preList => [
                ...preList,
                ...res.data.notification_list,
              ]);
            }
          } else if (res.data.status === 0) {
            seterrorText(res.data.msg);
            setnotificationsList([]);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          seterrorText(e.message);
          setnotificationsList([]);
        }
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
          setrefreshing(false);
          setisLoadMore(false);
        }
      });
  }

  function onRefresh() {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setrefreshing(true);
    }
    listNotificationsAPICall(1);
  }

  function onEndReached() {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        listNotificationsAPICall(currentPage);
      }
    }
  }

  function getListSections() {
    const tempNotificationsList = [...notificationsList];
    const todayStart = moment().startOf('day');
    const todayEnd = moment().endOf('day');
    const yesterdayStart = moment().subtract(1, 'days').startOf('day');
    const yesterdayEnd = moment().subtract(1, 'days').endOf('day');
    let todayNotificationsList: any[] = [];
    let yesterdayNotificationsList: any[] = [];
    let olderNotificationsList: any[] = [];
    tempNotificationsList.forEach(item => {
      let createdDateTime = moment(item.created_datetime);
      if (createdDateTime.isBetween(todayStart, todayEnd)) {
        todayNotificationsList.push(item);
      } else if (createdDateTime.isBetween(yesterdayStart, yesterdayEnd)) {
        yesterdayNotificationsList.push(item);
      } else {
        olderNotificationsList.push(item);
      }
    });

    const resultSections: any[] = [];
    if (todayNotificationsList.length > 0) {
      resultSections.push({
        title: 'Today',
        data: todayNotificationsList,
      });
    }
    if (yesterdayNotificationsList.length > 0) {
      resultSections.push({
        title: 'Yesterday',
        data: yesterdayNotificationsList,
      });
    }
    if (olderNotificationsList.length > 0) {
      resultSections.push({
        title: 'Older',
        data: olderNotificationsList,
      });
    }
    return resultSections;
  }

  function keyExtractor(item: any, index: number) {
    return item[
      notificationListType === 6 ? 'nugget_id' : 'notification_id'
    ].toString();
  }

  const renderFooter = () => {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.primary} />
    ) : null;
  };

  const renderSeperator = () => {
    return <View style={styles.divider} />;
  };

  function renderItem({item, index}: any) {
    return <NotificationItem item={item} />;
  }
  const renderSectionHeader = ({section}: any) => {
    return (
      <View style={{paddingVertical: 10}}>
        <StyledText style={styles.listSectionTitleText}>
          {section.title}
        </StyledText>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size={'large'} color={COLORS.white} />
        </View>
      ) : (
        <SectionList
          sections={getListSections()}
          contentContainerStyle={{
            paddingTop: 15,
            paddingBottom: 30,
          }}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={renderSeperator}
          ListFooterComponent={renderFooter}
          onEndReached={onEndReached}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
        // <FlatList
        //   data={notificationsList}
        //   contentContainerStyle={{
        //     paddingTop: 15,
        //     paddingBottom: 30,
        //   }}
        //   refreshControl={
        //     <RefreshControl
        //       tintColor={COLORS.secondary}
        //       refreshing={refreshing}
        //       onRefresh={onRefresh}
        //     />
        //   }
        //   renderItem={renderItem}
        //   keyExtractor={keyExtractor}
        //   showsVerticalScrollIndicator={false}
        //   onEndReached={onEndReached}
        //   ItemSeparatorComponent={renderSeperator}
        //   ListFooterComponent={renderFooter}
        // />
      )}
      {notificationsList.length <= 0 && (
        <View style={styles.emptyListErrorContainer}>
          <SVGIcon icon="logo_R" width={'50%'} height={'50%'} />
          {errorText ? (
            <View style={styles.emptyListErrorContainer}>
              <StyledText style={styles.emptyListErrorText}>
                {errorText}
              </StyledText>
            </View>
          ) : (
            false
          )}
        </View>
      )}
    </View>
  );
};

export default NotificationsList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  emptyListErrorText: {
    color: COLORS.white,
  },
  divider: {
    backgroundColor: COLORS.placeHolderColor,
    height: 1,
    marginVertical: 5,
    opacity: 0.3,
  },
  listSectionTitleText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
    fontSize: 17,
  },
});
