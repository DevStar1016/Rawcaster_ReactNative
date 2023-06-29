import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {ChimeMessaging} from '../ChimeMessagingService';
import {useUserData} from '../../../Utilities/StoreData';
import {Message as MessageProp} from 'amazon-chime-sdk-js';

const ChimeMessagingListener = () => {
  const user = useUserData();
  useEffect(() => {
    if (user) {
      ChimeMessaging.connect(user.user_id);
      ChimeMessaging.subscribeToMessageListener(messageProcessor);
    }
    return () => {
      ChimeMessaging.unSubscribeMessageListener(messageProcessor);
      ChimeMessaging.disconnect();
    };
  }, []);

  function messageProcessor(message: MessageProp) {
    console.log(message, 'MESSAGE');
  }

  return <></>;
};

export default ChimeMessagingListener;
