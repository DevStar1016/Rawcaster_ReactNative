import {Linking, Modal} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import * as mime from 'react-native-mime-types';
import Loader from '../Components/Loader';
import {
  useGlobalLoaderData,
  useIsVisibleInfluencers,
  usePremiumAlert,
  useProfile,
  useSettings,
  useToken,
  useinActiveAlert,
} from '../Utilities/StoreData';
import InfluencersList from '../Screens/Influencer/InfluencersList';
import {getAuthCode, getUrlWithFilePrefix} from '../Utilities/Methods';
import {
  complementaryMembershipService,
  getInfluencerCategoryService,
  listAllFriendRequestsService,
} from '../Services/ApiService';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import {useDispatch} from 'react-redux';
import PostEditNugget from '../Screens/MainScreens/NuggetPost/PostEditNugget';
import EditProfile from '../Screens/MainScreens/EditProfile';
import {
  setInfluencerCategoryList,
  setPendingFriendRequests,
} from '../Store/Slices/HomeSlice';
import GlobalSearchStack from './GlobalSearchStack';
import SettingsStack from './SettingsStack';
import EmailPhoneVerification from '../Screens/AuthScreens/EmailPhoneVerification';
import ProfileStack from './ProfileStack';
import CreateEditGroup from '../Screens/MainScreens/User/CreateEditGroup';
import AddUserToGroup from '../Screens/MainScreens/User/AddUserToGroup';
import AddNewConnection from '../Screens/MainScreens/User/AddNewConnection';
import StackAnimation from '../Utilities/StackAnimation';
import {initiateAllNuggetsLoadingTotalPages} from '../Store/Slices/NuggetsListSlice';
import DashboardProfileTopTabNavigation from '../Navigation/TopTabNavigation/DashboardProfileTopTabs/DashboardProfileTopTabNavigation';
import {COLORS} from '../Utilities/Colors';
import UserChat from '../Screens/MainScreens/ChatScreens/UserChat';
import GroupChat from '../Screens/MainScreens/ChatScreens/GroupChat';
import EventHostScreen from '../Screens/MainScreens/Events/EventHost/EventHostScreen';
import ChimeSocketConnectionListener from '../Services/ChimeSocket/ListenerComponent/ChimeSocketConnectionListener';
import PlansAndPrice from '../Screens/MainScreens/PlansAndPrice';
import ConfirmationPopup from '../Modals/ConfirmationPopup';
import {
  setPremiumAlert,
  setisInActivePopup,
} from '../Store/Slices/UtilitySlice';
import {
  getFocusedRouteNameFromRoute,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  getAllFriendsGroupsList,
  getAllFriendsList,
} from '../Store/ThunkAPIServices';
import {decode} from 'base-64';
import TalkShowHostScreen from '../Screens/MainScreens/Talkshow/TalkshowHost/TalkshowHostScreen';
import ViewNugget from '../Screens/MainScreens/HomeScreen/ViewNugget';
import EventDetailScreen from '../Screens/MainScreens/EventsAndTalkshowsCommon/EventDetailScreen';
import OpenLinkingUrl from '../Utilities/OpenLinkingUrl';
import {setMyProfile} from '../Store/Slices/AuthSlice';
import {
  setMeetInviteRefId,
  setTalkShowInviteRefId,
} from '../Store/Slices/MeetInviteRefIdSlice';
import InActiveModal from '../Modals/InActiveModal';
import {IS_ENABLE_CHIME_FUNCTIONALITY, IS_IOS} from '../Utilities/Constants';
const Stack = createStackNavigator();

const MainStack = () => {
  const profile = useProfile();
  const [isLoading, setisLoading] = useState(true);
  const [isLogout, setisLogout] = useState(false);
  const route = useRoute();
  // Get Nested Route Name
  const isVisibleInfluencers = useIsVisibleInfluencers();
  const token = useToken();
  const settings = useSettings();
  const dispatch = useDispatch();
  const globalLoaderData = useGlobalLoaderData();
  const navigation = useNavigation();
  const userSettings = useSettings();
  const premiumALert = usePremiumAlert();
  const isInActiveAlert = useinActiveAlert();
  const [isComplimentoryAlert, setisComplimentoryAlert] = useState({
    status: false,
    text: '',
  });

  useEffect(() => {
    initialAPICall();
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', event => {
      if (
        event.url?.includes('https://dev.rawcaster.com/join/event') ||
        event.url?.includes('https://dev.rawcaster.com/join/talkshow')
      ) {
        if (IS_ENABLE_CHIME_FUNCTIONALITY) {
          setTimeout(() => {
            console.log('from here 123');
            handleOpenUrl(event.url);
          }, 3000);
        }
      } else {
        ////////// Change from indian team
        //////////////////////
        OpenLinkingUrl(event.url);
        ///////
        //////////
      }
    });
    Linking?.getInitialURL()
      .then(url => {
        if (
          url?.includes('https://dev.rawcaster.com/join/event') ||
          url?.includes('https://dev.rawcaster.com/join/talkshow')
        ) {
          if (IS_ENABLE_CHIME_FUNCTIONALITY) {
            setTimeout(() => {
              console.log('from here');
              handleOpenUrl(url);
            }, 3000);
          }
        } else {
          ////////// Change from indian team
          //////////////////////
          OpenLinkingUrl(url);
          ////////////
        }
      })

      .catch(e => {
        console.log(e, 'ERROR LINK');
      });

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    ReceiveSharingIntent.getReceivedFiles(
      files => {
        const sharedMediasList = files.map(item => {
          let filePath = item.filePath
            ? item.filePath?.replace('file://', '')
            : null;
          return {
            webLink: item.weblink ? encodeURIComponent(item.weblink) : null,
            uri: filePath ? encodeURIComponent(filePath) : null,
            name: item.fileName ? item.fileName.replace(/%20/g, '') : null,
            type: filePath
              ? encodeURIComponent(
                  IS_IOS ? mime.lookup(filePath) : item.mimeType,
                )
              : null,
          };
        });
        const tempFiles = JSON.stringify(sharedMediasList);

        Linking.openURL('rawcaster://posteditnugget/' + tempFiles)
          .then(res => {
            console.log(res, 'Post Nugget Linking Success');
          })
          .catch(e => {
            console.log(e, 'Post Nugget Linking Error');
          });
        // ReceiveSharingIntent.clearReceivedFiles();
      },
      e => {
        console.log(e, 'Receive Files Error');
      },
      'rawcaster',
    );
  }, []);

  // useEffect(() => {
  //   ReceiveSharingIntent.getReceivedFiles(
  //     (files) => {
  //       console.log("files", files);
  //       let sharedfiles = files;
  //       let WEBLINK;
  //       let TEXT;
  //       if (isIos) {
  //         sharedfiles = files.map((file) => {
  //           let FILEPATH = file.filePath?.replace("file://", "");
  //           let MIMETYPE = mime.lookup(FILEPATH);
  //           WEBLINK = file.weblink;
  //           TEXT = file.text;
  //           return {
  //             ...file,
  //             filename: file.fileName
  //               ? file.fileName.replace(/%20/g, "")
  //               : null,
  //             //path: encodeURIComponent(file.filePath),
  //             path: FILEPATH ? encodeURIComponent(FILEPATH) : null,
  //             // mime: file.mimeType,
  //             mime: MIMETYPE ? encodeURIComponent(MIMETYPE) : null,
  //             filePath: "",
  //             contentUri: "",
  //             weblink: WEBLINK ? encodeURIComponent(WEBLINK) : null,
  //             text: TEXT ? encodeURIComponent(file.text) : null,
  //           };
  //         });
  //       } else {
  //         sharedfiles = files.map((file) => {
  //           WEBLINK = file.weblink;
  //           TEXT = file.text;
  //           return {
  //             ...file,
  //             filename: file.fileName?.replace(/%20/g, ""),
  //             path: encodeURIComponent("file://" + file.filePath),
  //             mime: encodeURIComponent(file.mimeType),
  //             weblink: WEBLINK ? encodeURIComponent(WEBLINK) : null,
  //             filePath: "",
  //             contentUri: "",
  //             mimeType: "",
  //             text: TEXT ? encodeURIComponent(file.text) : null,
  //           };
  //         });
  //       }
  //       galleryItems = JSON.stringify(sharedfiles);

  //       setTimeout(() => {
  //         Linking.openURL("rawcaster://Composer/" + galleryItems)
  //           .then((res) => {
  //             console.log("Composer Linked From APP.js", res);
  //           })
  //           .catch((err) =>
  //             console.log("Linking Error in Sharing Intent", err)
  //           );
  //       }, 1000);
  //     },
  //     (error) => {
  //       console.log(error, "Error Sharing Intent]");
  //     }
  //   );
  // }, []);

  function getCommonFormData() {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    return formData;
  }

  // function getFriendsFormData() {
  //   const formData = getCommonFormData();
  //   formData.append('allfriends', 1);
  //   return formData;
  // }

  function initialAPICall() {
    Promise.all([
      // listAllFriendsService(getFriendsFormData()),
      // listAllFriendGroupsService(getCommonFormData()),
      listAllFriendRequestsService(getCommonFormData()),
      getInfluencerCategoryService(getCommonFormData()),
    ])
      // .then(res => {
      //   if (res[0].data.status === 1) {
      //     dispatch(setConnectionsList(res[0].data.friends_list));
      //   }
      //   return res;
      // })
      // .then(res => {
      //   if (res[1].data.status === 1) {
      //     dispatch(setGroupsList(res[1].data.friend_group_list));
      //   }
      //   return res;
      // })
      .then(res => {
        if (res[0].data.status === 1) {
          dispatch(setPendingFriendRequests(res[0].data.pending_requests));
        }
        return res;
      })
      .then(res => {
        if (res[1].data.status === 1) {
          dispatch(setInfluencerCategoryList(res[1].data.influencer_category));
          dispatch(
            initiateAllNuggetsLoadingTotalPages({
              categoriesList: [...res[1].data.influencer_category],
              isForYouLoading: token
                ? settings.mobile_default_page === 1
                : true,
            }),
          );
        }
        return res;
      })
      .catch(e => {})
      .finally(() => {
        setisLoading(false);
        dispatch(getAllFriendsGroupsList());
        dispatch(getAllFriendsList());
      });
  }

  const handleOpenUrl = url => {
    console.log('url_received', url);
    if (url && !url.includes('rawcaster://')) {
      if (url?.includes('share')) {
        const parsed = queryString.parseUrl(url);
        Linking.openURL(`rawcaster://viewnugget/${decode(parsed.query.id)}`)
          .then(res => {
            console.log(res, 'LINKING RESPONSEE');
          })
          .catch(e => {
            console.log(e, 'ERROR   CATCH');
          });
        // Linking.openURL()
      } else {
        if (url?.includes('https://dev.rawcaster.com/join/event')) {
          console.log('incluededddddd');
          const ref_id = url
            .replace('https://dev.rawcaster.com/join/event/', '')
            .trim();
          console.log('ref_id', ref_id);
          console.log('route', route);
          const routeName = getFocusedRouteNameFromRoute(route);
          console.log('route_name', routeName);
          if (
            routeName == 'DashboardProfileTopTabNavigation' ||
            routeName == undefined
          ) {
            console.log('im_in', routeName);
            dispatch(setMeetInviteRefId(ref_id));
          } else {
            console.log('im_out', routeName);
            setTimeout(() => {
              dispatch(setMeetInviteRefId(ref_id));
            }, 4000);
          }
          navigation.navigate('DashboardProfileTopTabNavigation', {
            screen: 'BottomTabNavigationAfterLogin',
            params: {
              screen: 'EventsStack',
              params: {
                screen: 'Events',
                params: {
                  ref_id: ref_id,
                },
              },
            },
          });
        } else {
          if (url?.includes('https://dev.rawcaster.com/join/talkshow')) {
            const ref_id = url
              .replace('https://dev.rawcaster.com/join/talkshow/', '')
              .trim();
            console.log('ref_id', ref_id);
            const routeName = getFocusedRouteNameFromRoute(route);
            console.log('route_name', routeName);
            if (
              routeName == 'DashboardProfileTopTabNavigation' ||
              routeName == undefined
            ) {
              console.log('im_in', routeName);
              dispatch(setTalkShowInviteRefId(ref_id));
            } else {
              console.log('im_out', routeName);
              setTimeout(() => {
                dispatch(setTalkShowInviteRefId(ref_id));
              }, 4000);
            }
            navigation.navigate('DashboardProfileTopTabNavigation', {
              screen: 'BottomTabNavigationAfterLogin',
              params: {
                screen: 'TalkshowStack',
                params: {
                  screen: 'Talkshow',
                  params: {
                    ref_id: ref_id,
                  },
                },
              },
            });
          }
        }
      }
    }
  };

  const HandleUpgradeComplimentory = () => {
    const formData = new FormData();
    formData.append('token', token);
    complementaryMembershipService(formData)
      .then(res => {
        if (res.data.status === 1) {
          dispatch(
            setMyProfile({
              ...profile,
              user_status: res.data.user_status ?? profile.user_status,
              user_status_id: res.data.user_status_id ?? profile.user_status_id,
            }),
          );
          setisComplimentoryAlert({
            status: true,
            text: res.data.msg,
          });
        } else {
          navigation.navigate('PlansAndPrice');
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  return isLoading ? (
    <Loader
      loaderText={isLogout ? 'Logging out...' : 'Fetching User Profile'}
      isEnableDefaultLoaderBackground={true}
    />
  ) : (
    <>
      {/* <SocketListener /> */}
      <ChimeSocketConnectionListener />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          ...StackAnimation,
        }}>
        {isVisibleInfluencers ? (
          <>
            <Stack.Screen name="InfluencersList" component={InfluencersList} />
            <Stack.Screen name="SettingsStack" component={SettingsStack} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="DashboardProfileTopTabNavigation"
              component={DashboardProfileTopTabNavigation}
            />
            <Stack.Screen name="PostEditNugget" component={PostEditNugget} />
            <Stack.Screen name="ViewNugget" component={ViewNugget} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="SettingsStack" component={SettingsStack} />
            <Stack.Screen
              name="EmailPhoneVerification"
              component={EmailPhoneVerification}
            />
            <Stack.Screen
              name="GlobalSearchStack"
              component={GlobalSearchStack}
            />
            <Stack.Screen name="ProfileStack" component={ProfileStack} />
            <Stack.Screen name="UserChat" component={UserChat} />
            <Stack.Screen name="GroupChat" component={GroupChat} />
            <Stack.Screen
              name="EventHostScreen"
              component={EventHostScreen}
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="TalkShowHostScreen"
              component={TalkShowHostScreen}
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen name="CreateEditGroup" component={CreateEditGroup} />
            <Stack.Screen name="AddUserToGroup" component={AddUserToGroup} />
            <Stack.Screen
              name="AddNewConnection"
              component={AddNewConnection}
            />
            <Stack.Screen
              name="EventDetailScreen"
              component={EventDetailScreen}
            />
            <Stack.Screen name="PlansAndPrice" component={PlansAndPrice} />
          </>
        )}
      </Stack.Navigator>
      {globalLoaderData?.status && (
        <Modal transparent visible={globalLoaderData?.status}>
          <Loader
            bgColor={COLORS.transparentDimColor}
            loaderText={globalLoaderData?.text}
          />
        </Modal>
      )}
      {premiumALert?.status && (
        <Modal
          onRequestClose={() => {}}
          // style={{zIndex: 10000}}
          transparent
          visible={premiumALert.status}>
          <ConfirmationPopup
            isEnableClose={false}
            onPressNegativeButton={() => {
              dispatch(
                setPremiumAlert({
                  status: false,
                  text: '',
                }),
              );
            }}
            positiveButtonText={
              premiumALert.isModifyButton && premiumALert.SuccessButtonText
                ? premiumALert.SuccessButtonText
                : 'Upgrade Now'
            }
            isEnableNegativeButton={
              premiumALert.isModifyButton &&
              premiumALert.isFailureButtonAvailable
            }
            negativeButtonText={
              premiumALert.isModifyButton && premiumALert.FailureButtonText
                ? premiumALert.FailureButtonText
                : 'Cancel'
            }
            onPressPositiveButton={() => {
              if (!premiumALert.isModifyButton) {
                if (profile.complementary_status === 1) {
                  HandleUpgradeComplimentory();
                } else {
                  navigation.navigate('PlansAndPrice');
                }
              }

              dispatch(
                setPremiumAlert({
                  status: false,
                  text: '',
                }),
              );
            }}
            content={premiumALert.text}
          />
        </Modal>
      )}
      {isComplimentoryAlert?.status && (
        <Modal
          onRequestClose={() => {}}
          // style={{zIndex: 10000}}
          transparent
          visible={isComplimentoryAlert.status}>
          <ConfirmationPopup
            isEnableClose={false}
            isEnableNegativeButton={false}
            positiveButtonText={'Ok'}
            onPressPositiveButton={() => {
              setisComplimentoryAlert({
                status: false,
                text: '',
              });
            }}
            content={isComplimentoryAlert.text}
          />
        </Modal>
      )}
      {isComplimentoryAlert?.status && (
        <Modal
          onRequestClose={() => {}}
          // style={{zIndex: 10000}}
          transparent
          visible={isComplimentoryAlert.status}>
          <ConfirmationPopup
            isEnableClose={false}
            isEnableNegativeButton={false}
            positiveButtonText={'Ok'}
            onPressPositiveButton={() => {
              setisComplimentoryAlert({
                status: false,
                text: '',
              });
            }}
            content={isComplimentoryAlert.text}
          />
        </Modal>
      )}
      {isInActiveAlert && (
        <Modal
          onRequestClose={() => {}}
          // style={{zIndex: 10000}}
          transparent
          visible={isInActiveAlert}>
          <InActiveModal
            onLogout={status => {
              setisLoading(status);
              if (status) {
                setisLogout(true);
              } else {
                setisLogout(false);
              }
            }}
            onClose={() => {
              dispatch(setisInActivePopup(false));
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default MainStack;
