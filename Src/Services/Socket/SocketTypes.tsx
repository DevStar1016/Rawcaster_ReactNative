type FriendRequestSocketDataProps = {
  friend_request_id: any;
  display_name: string;
  profile_img: string;
  user_id: any;
};

export type FriendRequestSocketProps = {
  user_id: any;
  data: FriendRequestSocketDataProps;
};

export type groupFunctionalitySocketProps = {
  groupId: any;
  userId: any;
  processType:
    | 'create_group'
    | 'edit_group'
    | 'delete_group'
    | 'remove_group_member'
    | 'add_group_member';
  groupData?: any;
  createdBy?: string;
  added_user_ids?: any[];
  removed_user_id?: any;
};

export type GroupChatEnableDisableProps = {
  groupId: any;
  userId: any;
  status: number;
};
