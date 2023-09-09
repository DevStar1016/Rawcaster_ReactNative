import axios, {AxiosRequestConfig, GenericAbortSignal} from 'axios';
import {BASE_URL} from './ServiceConstants';

axios.defaults.baseURL = BASE_URL;

axios.interceptors.request.use(
  async request => {
    request.headers['Content-Type'] = 'multipart/form-data';
    return request;
  },
  error => Promise.reject(error),
);

// Auth services

export const loginService = (data: FormData) => {
  return axios.post('login', data);
};

export const signupService = (data: FormData) => {
  return axios.post('signup', data);
};

export const socialMediaLoginService = (data: FormData) => {
  return axios.post('socialmedialogin', data);
};

export const forgotPasswordService = (data: FormData) => {
  return axios.post('forgotpassword', data);
};

export const verifyOtpAndResetPassword = (data: FormData) => {
  return axios.post('verifyotpandresetpassword', data);
};

export const signupVerifyService = (data: FormData) => {
  return axios.post('signupverify', data);
};

export const resendOTPService = (data: FormData) => {
  return axios.post('resendotp', data);
};

export const logoutService = (data: FormData) => {
  return axios.post('logout', data);
};

export const changePasswordService = (data: FormData) => {
  return axios.post('changepassword', data);
};

export const getCountylistService = () => {
  return axios.post('getcountylist');
};

export const contactusService = (data: FormData) => {
  return axios.post('contactus', data);
};

export const getMyProfileService = (data: FormData) => {
  return axios.post('getmyprofile', data);
};

export const updateMyProfileService = (data: FormData) => {
  return axios.post('updatemyprofile', data);
};

export const searchRawcasterUsersService = (data: FormData) => {
  return axios.post('searchrawcasterusers', data);
};

export const inviteToRawcasterService = (data: FormData) => {
  return axios.post('invitetorawcaster', data);
};

export const sendFriendRequestsService = (data: FormData) => {
  return axios.post('sendfriendrequests', data);
};

export const listAllFriendRequestsService = (data: FormData) => {
  return axios.post('listallfriendrequests', data);
};

export const respondToFriendRequestsService = (data: FormData) => {
  return axios.post('respondtofriendrequests', data);
};

export const listAllFriendGroupsService = (data: FormData) => {
  return axios.post('listallfriendgroups', data);
};

export const listAllFriendsService = (data: FormData) => {
  return axios.post('listallfriends', data);
};

export const addFriendGroupService = (data: FormData) => {
  return axios.post('addfriendgroup', data);
};

export const editFriendGroupService = (data: FormData) => {
  return axios.post('editfriendgroup', data);
};

export const addFriendsToGroupService = (data: FormData) => {
  return axios.post('addfriendstogroup', data);
};

export const removeFriendsfFromGroupService = (data: FormData) => {
  return axios.post('removefriendsfromgroup', data);
};

export const deleteFriendGroupService = (data: FormData) => {
  return axios.post('deletefriendgroup', data);
};

export const groupAbuseReportService = (data: FormData) => {
  return axios.post('groupabusereport', data);
};

export const exitFromGroupService = (data: FormData) => {
  return axios.post('exitfromgroup', data);
};

// Nugget services

export const addNuggetsService = (
  data: FormData,
  config: AxiosRequestConfig,
) => {
  return axios.post('addnuggets', data, config);
};

export const listNuggetsService = (
  data: FormData,
  signal: GenericAbortSignal,
) => {
  return axios.post('listnuggets', data, {signal});
};

export const likeAndUnlikeNuggetService = (
  data: FormData,
  signal: GenericAbortSignal,
) => {
  return axios.post('likeandunlikenugget', data, {signal});
};

export const deleteNuggetService = (data: FormData) => {
  return axios.post('deletenugget', data);
};

export const nuggetCommentListService = (data: FormData) => {
  return axios.post('nuggetcommentlist', data);
};

export const addNuggetCommentService = (data: FormData) => {
  return axios.post('addnuggetcomment', data);
};

export const editNuggetCommentService = (data: FormData) => {
  return axios.post('editnuggetcomment', data);
};

export const deleteNuggetCommentService = (data: FormData) => {
  return axios.post('deletenuggetcomment', data);
};

export const likeAndUnlikeNuggetCommentService = (data: FormData) => {
  return axios.post('likeandunlikenuggetcomment', data);
};

export const nuggetAndCommentLikedUserListService = (data: FormData) => {
  return axios.post('nuggetandcommentlikeeduserlist', data);
};

export const editNuggetService = (data: FormData) => {
  return axios.post('editnugget', data);
};
export const shareNuggetService = (data: FormData) => {
  return axios.post('sharenugget', data);
};

export const getNuggetDetailService = (data: FormData) => {
  return axios.post('getnuggetdetail', data);
};

export const saveAndUnsaveNuggetService = (data: FormData) => {
  return axios.post('saveandunsavenugget', data);
};

// Event services

export const getEventTypeService = (data: FormData) => {
  return axios.post('geteventtype', data);
};

export const getEventLayoutService = (data: FormData) => {
  return axios.post('geteventlayout', data);
};

export const addEventService = (data: FormData) => {
  return axios.post('addevent', data);
};

export const listEventsService = (data: FormData) => {
  return axios.post('listevents', data);
};

export const deleteEventService = (data: FormData) => {
  return axios.post('deleteevent', data);
};

export const viewEventService = (data: FormData) => {
  return axios.post('viewevent', data);
};

export const editEventService = (data: FormData) => {
  return axios.post('editevent', data);
};

export const listChatMessagesService = (data: FormData) => {
  return axios.post('listchatmessages', data);
};

export const uploadChatAttachmentService = (
  data: FormData,
  config: AxiosRequestConfig,
) => {
  return axios.post('uploadchatattachment', data, config);
};

// Notification services

export const listNotificationsService = (data: FormData) => {
  return axios.post('listnotifications', data);
};

export const deleteNotificationService = (data: FormData) => {
  return axios.post('deletenotification', data);
};

export const readNotificationService = (data: FormData) => {
  return axios.post('readnotification', data);
};

export const unfriendService = (data: FormData) => {
  return axios.post('unfriend', data);
};

export const getOthersProfileService = (
  data: FormData,
  signal: GenericAbortSignal,
) => {
  return axios.post('getothersprofile', data, {signal});
};

// Users services

export const listAllBlockedUsersService = (data: FormData) => {
  return axios.post('listallblockedusers', data);
};

export const blockUnblockUserService = (data: FormData) => {
  return axios.post('blockunblockuser', data);
};

export const getUserSettingsService = (data: FormData) => {
  return axios.post('getusersettings', data);
};

export const updateUserSettingsService = (data: FormData) => {
  return axios.post('updateusersettings', data);
};

export const getEventMelodyService = (data: FormData) => {
  return axios.post('geteventmelody', data);
};

export const blockMultipleUserService = (data: FormData) => {
  return axios.post('blockmultipleuser', data);
};

export const globalSearchEventsService = (data: FormData) => {
  return axios.post('globalsearchevents', data);
};

export const globalSearchNuggetsService = (data: FormData) => {
  return axios.post('globalsearchnuggets', data);
};

export const nuggetAbuseReportService = (data: FormData) => {
  return axios.post('nuggetabusereport', data);
};

export const messageReadService = (data: FormData) => {
  return axios.post('messageread', data);
};

export const eventJoinValidationService = (data: FormData) => {
  return axios.post('eventjoinvalidation', data);
};

export const getEventDetailsService = (data: FormData) => {
  return axios.post('geteventdetails', data);
};

export const getTimeZoneService = (data: FormData) => {
  return axios.post('gettimezone', data);
};

export const getLanguageListService = (data: FormData) => {
  return axios.post('getlanguagelist', data);
};

export const groupListUpdateService = (data: FormData) => {
  return axios.post('grouplistupdate', data);
};

export const getSettingsService = (data: FormData) => {
  return axios.post('getsettings', data);
};

export const getFaqService = (data: FormData) => {
  return axios.post('getfaq', data);
};

export const getOpenNuggetDetailService = (data: FormData) => {
  return axios.post('getopennuggetdetail', data);
};

export const followAndUnfollowService = (data: FormData) => {
  return axios.post('followandunfollow', data);
};

export const getFollowListService = (data: FormData) => {
  return axios.post('getfollowlist', data);
};

export const addNuggetViewService = (data: FormData) => {
  return axios.post('addnuggetview', data);
};

export const getReferralListService = (data: FormData) => {
  return axios.post('getreferrallist', data);
};

export const addLiveEventService = (data: FormData) => {
  return axios.post('addliveevent', data);
};

export const editLiveEventService = (data: FormData) => {
  return axios.post('editliveevent', data);
};

export const addGoLiveEventService = (data: FormData) => {
  return axios.post('addgoliveevent', data);
};

export const enableGoLiveEventService = (data: FormData) => {
  return axios.post('enablegoliveevent', data);
};

export const getInfluencerCategoryService = (data: FormData) => {
  return axios.post('getinfluencercategory', data);
};

export const influencerListService = (
  data: FormData,
  signal: GenericAbortSignal,
) => {
  return axios.post('influencerlist', data, {signal});
};

export const influencerFollowService = (data: FormData) => {
  return axios.post('influencerfollow', data);
};

export const pollVoteService = (data: FormData) => {
  return axios.post('pollvote', data);
};

export const tagListService = (data: FormData) => {
  return axios.post('tagslist', data);
};
export const addClaimAccountService = (data: FormData) => {
  return axios.post('addclaimaccount', data);
};

export const listUnClaimAccountService = (data: FormData) => {
  return axios.post('listunclaimaccount', data);
};

export const verifyAccountService = (data: FormData) => {
  return axios.post('verifyaccount', data);
};

export const aiChatService = (data: FormData) => {
  return axios.post('aichat', data);
};

export const nuggetContentAudioService = (
  data: FormData,
  signal: GenericAbortSignal,
) => {
  return axios.post('nuggetcontentaudio', data, {signal});
};

export const textToAudioService = (data: FormData) => {
  return axios.post('texttoaudio', data);
};

//Chime Meeting

export const attendees = (data: FormData) => {
  return axios.post('attendees', data);
};

export const endMeeting = (data: FormData) => {
  return axios.post('end_meeting', data);
};

export const exitMeeting = (data: FormData) => {
  return axios.post('exit_meeting', data);
};
