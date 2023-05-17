import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import {
  useConnectionsList,
  useGroupsList,
  useProfile,
  useToken,
} from '../../../Utilities/StoreData';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import SearchInput from '../../../Components/SearchInput';
import {getAuthCode, htmlDecodeText} from '../../../Utilities/Methods';
import {searchRawcasterUsersService} from '../../../Services/ApiService';
import DefaultBackground from '../../../Components/DefaultBackground';
import axios from 'axios';
import UserItem from './UserItem';

var isMount = true;
var currentPage = 1;
var totalPages = 1;
const AddNewConnection = () => {
  const token = useToken();
  const [isActionLoading, setisActionLoading] = useState(false);
  const [actionLoaderText, setactionLoaderText] = useState('');
  const [usersList, setusersList] = useState([]);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isListLoading, setisListLoading] = useState(true);
  const [isRefreshing, setisRefreshing] = useState(false);
  const [selectedConnectionsIds, setselectedConnectionsIds] = useState([]);
  const [searchText, setsearchText] = useState('');

  useEffect(() => {
    isMount = true;

    return () => {
      currentPage = 1;
      totalPages = 1;
      isMount = false;
    };
  }, []);

  useEffect(() => {
    currentPage = 1;
    totalPages = 1;
    Keyboard.dismiss();
    if (isMount) {
      setusersList([]);
      setisListLoading(true);
    }
    usersListAPICall(1);
  }, [searchText]);

  function handleSelectUnselectUser(id) {
    let tempSelectedIdsList = [...selectedConnectionsIds];
    if (tempSelectedIdsList.includes(id)) {
      tempSelectedIdsList = tempSelectedIdsList.filter(userId => userId !== id);
    } else {
      tempSelectedIdsList.push(id);
    }
    if (isMount) {
      setselectedConnectionsIds(tempSelectedIdsList);
    }
  }

  function isSelected(id) {
    return [...selectedConnectionsIds].includes(id);
  }

  function keyExtractor(item, index) {
    return item.user_id.toString();
  }

  const usersListAPICall = (pageNumber = 1) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('search_key', searchText.trim());
    formData.append('auth_code', getAuthCode(token));
    formData.append('page_number', pageNumber);
    searchRawcasterUsersService(formData)
      .then(res => {
        if (isMount) {
          if (res.data.status === 1) {
            let decodedUsersList = [...res.data.users_list].map(item => {
              return {
                ...item,
                display_name: htmlDecodeText(item.display_name),
                first_name: htmlDecodeText(item.first_name),
                last_name: htmlDecodeText(item.last_name),
              };
            });

            if (pageNumber === 1) {
              totalPages = parseInt(res.data.total_pages);
              setusersList(decodedUsersList);
            } else {
              setusersList(preList => [...preList, ...decodedUsersList]);
            }
          } else if (res.data.status === 0) {
            setusersList([]);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          setusersList([]);
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

  function onRefresh() {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setisRefreshing(true);
    }
    usersListAPICall(currentPage);
  }

  function onEndReached() {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        usersListAPICall(currentPage);
      }
    }
  }

  function renderFooter() {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.white} />
    ) : null;
  }

  function renderItem({item}) {
    return (
      <UserItem
        item={item}
        isSelected={isSelected(item.user_id)}
        isGroup={false}
        onPressItem={() => {
          handleSelectUnselectUser(item.user_id);
        }}
      />
    );
  }

  return (
    <HOCView
      headerType="header_with_back"
      backHeaderProps={{
        title: `Add New Connection`,
        isTitleCenter: true,
      }}
      isLoading={isActionLoading}
      loaderProps={{loaderText: actionLoaderText}}
      isEnableSafeArea={false}
      isEnableDefaultBackground={isListLoading || usersList.length <= 0}
      defaultBackgroundProps={{
        bgColor: COLORS.primaryDark,
        isEnableLoading: isListLoading,
        centerText: isListLoading
          ? 'Fetching Users List'
          : usersList.length <= 0
          ? 'No users found'
          : '',
      }}
      paddingBottom={0}
      isEnableRLogo={usersList.length <= 0}
      paddingHorizontal={0}
      backgroundColor={COLORS.primaryDark}>
      <SearchInput
        searchButtonColor={COLORS.secondary}
        marginVertical={10}
        editable={!isListLoading}
        searchWhenClickedButton={true}
        placeHolderText="Search User"
        marginHorizontal={15}
        onSearch={setsearchText}
      />
      <View style={{flex: 1}}>
        <FlatList
          bounces={false}
          data={usersList}
          renderItem={renderItem}
          ItemSeparatorComponent={() => {
            return <View style={{height: 15}} />;
          }}
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{
            paddingBottom: 10,
            paddingTop: 10,
            paddingHorizontal: 15,
          }}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={isRefreshing}
              onRefresh={onRefresh}
            />
          }
          onEndReachedThreshold={0.2}
          onEndReached={onEndReached}
          ListFooterComponent={renderFooter}
        />
      </View>
    </HOCView>
  );
};

export default AddNewConnection;

const styles = StyleSheet.create({});
