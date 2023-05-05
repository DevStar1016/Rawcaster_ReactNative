import React from 'react';
import NotificationsList from './NotificationsList';
var currentPage = 1;
var totalPages = 1;
const GroupsNotifications = () => {
  return (
    <NotificationsList
      currentPage={currentPage}
      totalPages={totalPages}
      notificationListType={4}
    />
  );
};

export default GroupsNotifications;
