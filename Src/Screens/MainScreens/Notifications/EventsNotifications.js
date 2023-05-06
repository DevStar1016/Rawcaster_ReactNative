import React from 'react';
import NotificationsList from './NotificationsList';
var currentPage = 1;
var totalPages = 1;
const EventsNotifications = () => {
  return (
    <NotificationsList
      currentPage={currentPage}
      totalPages={totalPages}
      notificationListType={2}
    />
  );
};

export default EventsNotifications;
