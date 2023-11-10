type NotificationCountProp = {
  fans: number;
  groups: number;
  connections: number;
  events: number;
  nuggets: number;
  poll_results: number;
};
type FollowingUserData = {
  user_id: number;
  follow_count: number;
};

type SharedDetailsListProp = {
  name: string;
  img: string;
};

type PollOptionProp = {
  option_id: number;
  option_name: string;
  option_percentage: number;
  votes: number;
};

type MediaDataProp = {
  media_id: number;
  media_type: 'video' | 'audio' | 'image';
  media_file_type: string;
  path: string;
};

export type NuggetDataProp = {
  nugget_id: number;
  content: string;
  metadata: any | null;
  created_date: string;
  user_id: number;
  user_ref_id: string;
  account_verify_type: number;
  type: number;
  original_user_id: number;
  original_user_name: string;
  original_user_image: string;
  user_name: string;
  user_image: string;
  user_status_id: number;
  liked: false;
  viewed: number;
  following: true;
  follow_count: number;
  total_likes: number;
  total_comments: number;
  total_views: number;
  total_media: number;
  share_type: number;
  media_list: MediaDataProp[];
  is_nugget_owner: number;
  is_master_nugget_owner: number;
  shared_detail: SharedDetailsListProp[];
  shared_with: any[];
  is_downloadable: number;
  poll_option: PollOptionProp[];
  poll_duration: string;
  voted: number;
  voted_option: any | null;
  total_vote: number;
  saved: boolean;
};

export type InfluencerCategoryProp = {
  id: number;
  my_category: number;
  name: string;
};

type FriendRequestDataProp = {
  friend_request_id: number;
  user_ref_id: string;
  user_id: number;
  email_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  gender: number;
  profile_img: string;
};

type GroupMemberDataProp = {
  user_id: number;
  email_id: string;
  member_arn?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  gender?: number;
  profile_img?: string | null;
  online?: number;
  last_seen?: string | null;
  typing?: number;
};

type GroupDataProp = {
  group_id: number;
  group_name: string;
  locked: number;
  channel_arn: string | null;
  owner_membership_type: number;
  group_icon: string | null;
  group_member_count: number;
  group_owner: number;
  typing: number;
  chat_enabled: number;
  group_type: number;
  group_access: number;
  group_category: number;
  last_msg: string | null;
  last_msg_datetime: string;
  result_list: number;
  group_member_ids: number[];
  my_group: number;
  referral_link?: string;
  group_members_list: GroupMemberDataProp[];
};

type ConnectionDataProp = {
  friend_request_id: number;
  user_id: number;
  user_ref_id: string;
  channel_arn: string | null;
  email_id: string;
  first_name: string;
  last_name: string | null;
  display_name: string;
  gender: number;
  profile_img: string;
  online: number;
  last_seen: string;
  typing: number;
  unreadmsg: number;
  follow: boolean;
  last_msg: string | null;
  last_msg_datetime: string | null;
  login_from: number;
  login_from_app: number;
  login_from_web: number;
  friend_status: number;
  chime_user_id: string;
};

export type HomeDataProp = {
  searchedNuggetsList: NuggetDataProp[];
  connectionsList: ConnectionDataProp[];
  connectionsListLoading: boolean;
  groupsList: GroupDataProp[];
  groupListLoading: boolean;
  pendingFriendRequests: FriendRequestDataProp[];
  influencerCategoryList: InfluencerCategoryProp[];
  unclaimedAccountsList: null;
  unreadNotificationCount: null;
  typeWiseNotificationCount: NotificationCountProp;
  otherConnectionsRequestList: string[];
  otherInfluencersRequestList: string[];
  savedNuggetsList: NuggetDataProp[];
  followingUsersList: FollowingUserData[];
  blockedUserIds: number[];
};
