import React from 'react';
import NotificationsList from './NotificationsList';
var currentPage = 1;
var totalPages = 1;
const FansNotifications = () => {
  return (
    <NotificationsList
      currentPage={currentPage}
      totalPages={totalPages}
      notificationListType={5}
    />
  );
};

export default FansNotifications;
