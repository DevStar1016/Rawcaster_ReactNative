import {ChimeSDKMessagingClient} from '@aws-sdk/client-chime-sdk-messaging';
import {
  ConsoleLogger,
  DefaultMessagingSession,
  LogLevel,
  MessagingSession as MessagingSessionPropType,
  MessagingSessionConfiguration,
  Message as MessageProp,
  MessagingSessionObserver,
} from 'amazon-chime-sdk-js';
import {getUniqueId} from '../../Utilities/Methods';
import {
  CHIME_END_POINT_URL,
  CHIME_MESSAGING_CLIENT_IDS,
} from './ChimeMessagingConstants';

let Session: MessagingSessionPropType;
let messageUpdateCallbacks: ((message: MessageProp) => void)[] = [];
const logger = new ConsoleLogger('SDK Chat Demo', LogLevel.INFO);

const chimeClient = new ChimeSDKMessagingClient({
  region: 'us-east-1',
  credentials: {...CHIME_MESSAGING_CLIENT_IDS},
});

export const subscribeToMessageUpdate = (
  callback: (message: MessageProp) => void,
) => {
  console.log('Message listener subscribed!');
  messageUpdateCallbacks.push(callback);
};

export const unsubscribeFromMessageUpdate = (
  callback: (message: MessageProp) => void,
) => {
  const index = messageUpdateCallbacks.indexOf(callback);
  if (index !== -1) {
    messageUpdateCallbacks.splice(index, 1);
  }
};

const publishMessageUpdate = (message: MessageProp) => {
  console.log(`Sending message update to listeners!`);
  for (let i = 0; i < messageUpdateCallbacks.length; i += 1) {
    const callback = messageUpdateCallbacks[i];
    callback(message);
  }
};

const messageObserver: MessagingSessionObserver = {
  messagingSessionDidStart: () => {
    console.log('Messaging Connection started!');
  },
  messagingSessionDidStartConnecting: (reconnecting: boolean) => {
    console.log('Messaging Connection connecting');
  },
  messagingSessionDidStop: (event: any) => {
    console.log('Messaging Connection received DidStop event');
  },
  messagingSessionDidReceiveMessage: (message: MessageProp) => {
    console.log('Messaging Connection received message');
    publishMessageUpdate(message);
  },
};

const connectChimeMessaging = (userId: any) => {
  const sessionConfig = new MessagingSessionConfiguration(
    userId,
    getUniqueId(userId),
    CHIME_END_POINT_URL,
    chimeClient,
  );
  Session = new DefaultMessagingSession(sessionConfig, logger);
  Session.addObserver(messageObserver);
  Session.start();
};

const stopChimeMessaging = () => {
  try {
    Session.stop();
  } catch (err) {
    console.error('Failed to stop Messaging Session.');
  }
};

export const chimeMessagingClient = chimeClient;

export const ChimeMessaging = {
  connect: connectChimeMessaging,
  disconnect: stopChimeMessaging,
  subscribeToMessageListener: subscribeToMessageUpdate,
  unSubscribeMessageListener: unsubscribeFromMessageUpdate,
};
