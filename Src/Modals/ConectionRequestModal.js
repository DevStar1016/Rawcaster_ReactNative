import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from '../Components/SVGIcon';
import {DIMENSIONS} from '../Utilities/Constants';
import {FONTS} from '../Utilities/Fonts';
import ProfileWithBadge from '../Components/ProfileWithBadge';
import {usePendingFriendRequests, useToken} from '../Utilities/StoreData';
import SubmitButton from '../Components/SubmitButton';
import {respondToFriendRequestsService} from '../Services/ApiService';
import Toast from '../Components/Toast';
import {useDispatch} from 'react-redux';
import {setPendingFriendRequests} from '../Store/Slices/HomeSlice';

var timer = undefined;
const ConectionRequestModal = ({onClose, socketData}) => {
  const dispatch = useDispatch();
  const token = useToken();
  const conectionsListRef = useRef();
  const [index, setindex] = useState(0);
  const pendingRequestsListGlobal = usePendingFriendRequests();
  const [requestsList, setrequestsList] = useState([
    ...pendingRequestsListGlobal,
  ]);
  const [responseList, setresponseList] = useState([]);

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    if (socketData) {
      const tempPendingRequestsGlobal = [...pendingRequestsListGlobal];

      if (
        tempPendingRequestsGlobal.findIndex(
          item => item.user_id === socketData.user_id,
        ) === -1
      ) {
        dispatch(
          setPendingFriendRequests([
            {...socketData},
            ...pendingRequestsListGlobal,
          ]),
        );
      }
      {
        const tempRequestList = [...requestsList];
        if (
          tempRequestList.findIndex(
            item => item.user_id === socketData.user_id,
          ) === -1
        ) {
          setrequestsList(preList => [{...socketData}, ...preList]);
        } else {
          setresponseList(preList =>
            [...preList].filter(item => item.id !== socketData.user_id),
          );
          setrequestsList(preList => {
            let tempList = [...preList];
            let ind = [...tempList].findIndex(
              item => item.user_id === socketData.user_id,
            );
            tempList[ind] = {...tempList[ind], ...socketData};
            return tempList;
          });
        }
      }
    }
  }, [socketData]);

  useEffect(() => {
    if (responseList.length > 0) {
      let tempList = [...requestsList].filter(
        (_, index) =>
          ![...responseList].find(subItem => subItem.id === getUserId(index)),
      );
      dispatch(setPendingFriendRequests([...tempList]));
    }
  }, [responseList]);

  const getUserId = selectedIndex => {
    return [...requestsList].find((_, index) => index === selectedIndex)
      ?.user_id;
  };

  const scrollToIndex = index => {
    conectionsListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
    setindex(index);
  };

  const handleResponseFriendRequest = (responseType, selectedIndex) => {
    // 1-accept, 2 - reject, 3 - block
    setresponseList(preList => [
      ...preList,
      {id: getUserId(selectedIndex), type: responseType},
    ]);
    const formData = new FormData();
    formData.append('token', token);
    formData.append(
      'friend_request_id',
      requestsList[selectedIndex].friend_request_id,
    );
    formData.append('response', responseType);
    respondToFriendRequestsService(formData)
      .then(res => {
        console.log(res.data, 'RESPONSE');
        if (res.data.status === 0) {
          setresponseList(preList => {
            return [...preList].filter(
              item => item.id !== getUserId(selectedIndex),
            );
          });
        }
      })
      .catch(e => {
        setresponseList(preList => {
          return [...preList].filter(
            item => item.id !== getUserId(selectedIndex),
          );
        });
      })
      .finally(() => {});
  };

  const getPendingRequestsCount = () => {
    if (requestsList.length > 99) {
      return '99+';
    }
    return requestsList.length;
  };

  const getCompletedAction = () => {
    const ind = [...responseList].findIndex(
      item => item.id === getUserId(index),
    );
    if (ind !== -1) {
      return responseList[ind].type;
    }
    return 0;
  };

  const renderItem = ({item}) => (
    <View
      style={{
        width: DIMENSIONS.window.width - 130,
        alignItems: 'center',
      }}>
      <ProfileWithBadge
        profileImage={item.profile_img}
        padding={0}
        isEnableImagePicker={false}
      />
      <Text style={styles.name}>{item.display_name}</Text>
    </View>
  );

  return (
    <View style={styles.screen} activeOpacity={1}>
      <View style={styles.subContainer} activeOpacity={1}>
        <View style={styles.titleContainer}>
          <View style={styles.countContainer}>
            <Text style={styles.count}>{getPendingRequestsCount()}</Text>
          </View>
          <Text style={styles.title}>Connection request</Text>
          <SVGIcon
            icon="close_white"
            height={15}
            width={15}
            isButton
            onPress={() => onClose()}
          />
        </View>
        <View style={styles.dataContainer}>
          <SVGIcon
            icon={index === 0 ? 'arrow_left_grey' : 'arrow_left'}
            isButton={index === 0 ? false : true}
            onPress={() => scrollToIndex(index - 1)}
          />
          <FlatList
            ref={conectionsListRef}
            data={requestsList}
            keyExtractor={item => item.friend_request_id.toString()}
            horizontal
            pagingEnabled
            onScrollToIndexFailed={info => {
              const wait = new Promise(resolve => {
                timer = setTimeout(() => resolve(true), 500);
              });
              wait.then(() => {
                conectionsListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0.5,
                });
              });
            }}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={index}
            onMomentumScrollEnd={event => {
              const currentIndex = Math.floor(
                Math.floor(event.nativeEvent.contentOffset.x) /
                  Math.floor(event.nativeEvent.layoutMeasurement.width),
              );
              if (index !== currentIndex) {
                setindex(currentIndex);
              }
            }}
            renderItem={renderItem}
          />

          <SVGIcon
            icon={
              index === requestsList.length - 1
                ? 'arrow_right_grey'
                : 'arrow_right'
            }
            isButton={index === requestsList.length - 1 ? false : true}
            onPress={() => scrollToIndex(index + 1)}
          />
        </View>
        <View style={styles.btnContainer}>
          {getCompletedAction() ? (
            <SubmitButton
              buttonText={getCompletedAction() === 1 ? 'Accepted' : 'Rejected'}
              buttonWidth={'100%'}
              bgColor={COLORS.primary}
              borderColor={COLORS.primary}
              borderRadius={7}
              rightIconSize={getCompletedAction() === 1 ? 18 : 13}
              rightIcon={getCompletedAction() === 1 ? 'tick' : 'close_white'}
              isDisabled
              textColor={COLORS.white}
            />
          ) : (
            <>
              <SubmitButton
                buttonText="Reject"
                buttonWidth={'48%'}
                bgColor={COLORS.lightGrey}
                borderColor={COLORS.lightGrey}
                borderRadius={7}
                onPress={() => {
                  handleResponseFriendRequest(2, index);
                }}
                textColor={COLORS.black}
              />
              <SubmitButton
                buttonText="Accept"
                buttonWidth={'48%'}
                borderRadius={7}
                onPress={() => {
                  handleResponseFriendRequest(1, index);
                }}
                textColor={COLORS.white}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default ConectionRequestModal;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.transparentDimColor,
  },
  subContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: DIMENSIONS.window.width - 50,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    height: 40,
    alignItems: 'center',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  countContainer: {
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  count: {
    fontSize: 14,
    fontFamily: FONTS.DMSans.medium,
    color: COLORS.black,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.DMSans.medium,
    color: COLORS.white,
  },
  name: {
    fontSize: 16,
    fontFamily: FONTS.DMSans.medium,
    color: COLORS.black,
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
    marginVertical: 15,
  },
});
