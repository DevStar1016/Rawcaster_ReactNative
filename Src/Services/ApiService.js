import axios from 'axios';
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

export const loginService = formData => {
  return axios.post('login', formData);
};

export const signupService = formData => {
  return axios.post('signup', formData);
};

export const socialMediaLoginService = formData => {
  return axios.post('socialmedialogin', formData);
};

export const forgotPasswordService = data => {
  return axios.post('forgotpassword', data);
};

export const verifyOtpAndResetPassword = data => {
  return axios.post('verifyotpandresetpassword', data);
};

export const signupVerifyService = data => {
  return axios.post('signupverify', data);
};

export const resendOTPService = formData => {
  return axios.post('resendotp', formData);
};

export const logoutService = data => {
  return axios.post('logout', data);
};

export const changePasswordService = data => {
  return axios.post('changepassword', data);
};

export const getCountylistService = data => {
  return axios.post('getcountylist', data);
};

export const contactusService = data => {
  return axios.post('contactus', data);
};

export const getMyProfileService = data => {
  return axios.post('getmyprofile', data);
};

export const updateMyProfileService = data => {
  return axios.post('updatemyprofile', data);
};

export const searchRawcasterUsersService = data => {
  return axios.post('searchrawcasterusers', data);
};

export const inviteToRawcasterService = data => {
  return axios.post('invitetorawcaster', data);
};

export const sendFriendRequestsService = data => {
  return axios.post('sendfriendrequests', data);
};

export const listAllFriendRequestsService = data => {
  return axios.post('listallfriendrequests', data);
};

export const respondToFriendRequestsService = data => {
  return axios.post('respondtofriendrequests', data);
};

export const listAllFriendGroupsService = data => {
  return axios.post('listallfriendgroups', data);
};

export const listAllFriendsService = data => {
  return axios.post('listallfriends', data);
};

export const addFriendGroupService = data => {
  return axios.post('addfriendgroup', data);
};

export const editFriendGroupService = data => {
  return axios.post('editfriendgroup', data);
};

export const addFriendsToGroupService = data => {
  return axios.post('addfriendstogroup', data);
};

export const removeFriendsfFromGroupService = data => {
  return axios.post('removefriendsfromgroup', data);
};

export const deleteFriendGroupService = data => {
  return axios.post('deletefriendgroup', data);
};

// Nugget services

export const addNuggetsService = data => {
  return axios.post('addnuggets', data);
};

export const listNuggetsService = (data, signal) => {
  return axios.post('listnuggets', data, {signal: signal});
};

export const likeAndUnlikeNuggetService = data => {
  return axios.post('likeandunlikenugget', data);
};

export const deleteNuggetService = data => {
  return axios.post('deletenugget', data);
};

export const nuggetCommentListService = data => {
  return axios.post('nuggetcommentlist', data);
};

export const addNuggetCommentService = data => {
  return axios.post('addnuggetcomment', data);
};

export const editNuggetCommentService = data => {
  return axios.post('editnuggetcomment', data);
};

export const deleteNuggetCommentService = data => {
  return axios.post('deletenuggetcomment', data);
};

export const likeAndUnlikeNuggetCommentService = data => {
  return axios.post('likeandunlikenuggetcomment', data);
};

export const nuggetAndCommentLikedUserListService = data => {
  return axios.post('nuggetandcommentlikeeduserlist', data);
};

export const editNuggetService = data => {
  return axios.post('editnugget', data);
};
export const shareNuggetService = data => {
  return axios.post('sharenugget', data);
};

export const getNuggetDetailService = data => {
  return axios.post('getnuggetdetail', data);
};

// Event services

export const getEventTypeService = data => {
  return axios.post('geteventtype', data);
};

export const getEventLayoutService = data => {
  return axios.post('geteventlayout', data);
};

export const addEventService = data => {
  return axios.post('addevent', data);
};

export const listEventsService = data => {
  return axios.post('listevents', data);
};

export const deleteEventService = data => {
  return axios.post('deleteevent', data);
};

export const viewEventService = data => {
  return axios.post('viewevent', data);
};

export const editEventService = data => {
  return axios.post('editevent', data);
};

export const listChatMessagesService = data => {
  return axios.post('listchatmessages', data);
};

export const uploadChatAttachmentService = data => {
  return axios.post('uploadchatattachment', data);
};

// Notification services

export const listNotificationsService = data => {
  return axios.post('listnotifications', data);
};

export const deleteNotificationService = data => {
  return axios.post('deletenotification', data);
};

export const readNotificationService = data => {
  return axios.post('readnotification', data);
};

export const unfriendService = data => {
  return axios.post('unfriend', data);
};

export const getOthersProfileService = data => {
  return axios.post('getothersprofile', data);
};

// Users services

export const listAllBlockedUsersService = data => {
  return axios.post('listallblockedusers', data);
};

export const blockUnblockUserService = data => {
  return axios.post('blockunblockuser', data);
};

export const getUserSettingsService = data => {
  return axios.post('getusersettings', data);
};

export const updateUserSettingsService = data => {
  return axios.post('updateusersettings', data);
};

export const getEventMelodyService = data => {
  return axios.post('geteventmelody', data);
};

export const blockMultipleUserService = data => {
  return axios.post('blockmultipleuser', data);
};

export const globalSearchEventsService = data => {
  return axios.post('globalsearchevents', data);
};

export const globalSearchNuggetsService = data => {
  return axios.post('globalsearchnuggets', data);
};

export const nuggetAbuseReportService = data => {
  return axios.post('nuggetabusereport', data);
};

export const messageReadService = data => {
  return axios.post('messageread', data);
};

export const eventJoinValidationService = data => {
  return axios.post('eventjoinvalidation', data);
};

export const getEventDetailsService = data => {
  return axios.post('geteventdetails', data);
};

export const getTimeZoneService = data => {
  return axios.post('gettimezone', data);
};

export const getLanguageListService = data => {
  return axios.post('getlanguagelist', data);
};

export const groupListUpdateService = data => {
  return axios.post('grouplistupdate', data);
};

export const getSettingsService = data => {
  return axios.post('getsettings', data);
};

export const getFaqService = data => {
  return axios.post('getfaq', data);
};

export const getOpenNuggetDetailService = data => {
  return axios.post('getopennuggetdetail', data);
};

export const followAndUnfollowService = data => {
  return axios.post('followandunfollow', data);
};

export const getFollowListService = data => {
  return axios.post('getfollowlist', data);
};

export const addNuggetViewService = data => {
  return axios.post('addnuggetview', data);
};

export const getReferralListService = data => {
  return axios.post('getreferrallist', data);
};

export const addLiveEventService = data => {
  return axios.post('addliveevent', data);
};

export const editLiveEventService = data => {
  return axios.post('editliveevent', data);
};

export const addGoLiveEventService = data => {
  return axios.post('addgoliveevent', data);
};

export const enableGoLiveEventService = data => {
  return axios.post('enablegoliveevent', data);
};

export const getInfluencerCategoryService = data => {
  return axios.post('getinfluencercategory', data);
};

export const influencerListService = data => {
  return axios.post('influencerlist', data);
};

export const influencerFollowService = data => {
  return axios.post('influencerfollow', data);
};

export const pollVoteService = data => {
  return axios.post('pollvote', data);
};

export const tagListService = data => {
  return axios.post('tagslist', data);
};

export const saveAndUnsaveNuggetService = data => {
  return axios.post('saveandunsavenugget', data);
};
