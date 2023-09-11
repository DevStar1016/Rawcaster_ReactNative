const DYNAMIC_DEEP_LINK_URL = 'https://*.rawcaster.com/';
const DEEP_LINK_URL = 'https://rawcaster.com/';

export const DEEP_LINKING_URL = [
  DYNAMIC_DEEP_LINK_URL,
  DEEP_LINK_URL,
  DYNAMIC_DEEP_LINK_URL + 'share',
  DYNAMIC_DEEP_LINK_URL + 'join/event',
  DYNAMIC_DEEP_LINK_URL + 'join/golive',
  DYNAMIC_DEEP_LINK_URL + 'join/talkshow',
  DEEP_LINK_URL + 'share',
  DEEP_LINK_URL + 'join/event',
  DEEP_LINK_URL + 'join/golive',
  DEEP_LINK_URL + 'join/talkshow',
];

export const deeplinking1 = {
  prefixes: ['rawcaster://', ...DEEP_LINKING_URL],
  config: {
    initialRouteName: 'MainStack',
    screens: {
      MainStack: {
        screens: {
          PostEditNugget: 'posteditnugget/:files',
          ViewNugget: 'viewnugget/:id',
        },
      },
    },
  },
};
