import React from 'react';
import NotificationsList from './NotificationsList';
var currentPage = 1;
var totalPages = 1;
const PollResultsNotifications = () => {
  return (
    <NotificationsList
      currentPage={currentPage}
      totalPages={totalPages}
      notificationListType={6}
    />
  );
};

export default PollResultsNotifications;
