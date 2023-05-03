import {Dimensions, Platform} from 'react-native';
import moment from 'moment';
import LivetalkImage from '../Assets/Png/IntroImages/live_talk.png';
import LiveChatImage from '../Assets/Png/IntroImages/live_chat.png';
import EventImage from '../Assets/Png/IntroImages/event.png';
import NuggetImage from '../Assets/Png/IntroImages/nugget.png';
import LiveImage from '../Assets/Png/IntroImages/live.png';
import {getyears} from './Methods';

export const DIMENSIONS = {
  window: Dimensions.get('window'),
  screen: Dimensions.get('screen'),
};

export const INTRO_DATA = [
  {
    image: LivetalkImage,
    heading: 'Live Talk Show',
    description:
      'As in a typical TV or Radio talk show, you can stream a live event with the Rawcasterpublic or your fans with live audience reactions on the event',
  },
  {
    image: LiveChatImage,
    heading: 'Chatting',
    description:
      'Chat allows you to have an end-to-end encrypted conversation by text, video or audio with one or more people at the same time',
  },
  {
    image: EventImage,
    heading: 'Event Hosting',
    description:
      'Take your scheduled events live to your invited guests or make it open to the public whether they are members of Rawcaster or not',
  },
  {
    image: NuggetImage,
    heading: 'Post Nuggets',
    description:
      'Share the precious thoughts and tidbits that are in your mind with your fans, special connections, or the public. Add some videos or photos to convey your message',
  },
  {
    image: LiveImage,
    heading: 'Live Streaming',
    description:
      'As in a typical TV or Radio talk show, you can stream a live event with the Rawcasterpublic or your fans with live audience reactions on the event',
  },
];

export const DEFAULT_PAGES_LIST = [
  {id: 1, type: 'Nugget'},
  {id: 2, type: 'Event'},
  {id: 3, type: 'Chat'},
];

export const DEFAULT_DATE_FORMAT_LIST = [
  {id: 1, type: 'MM/DD/YYYY'},
  {id: 2, type: 'DD/MM/YYYY'},
  {id: 3, type: 'DD-MM-YYYY'},
];

export const VISIBLE_CHOICES_LIST = [
  {
    id: 0,
    name: "Don't Show",
  },
  {
    id: 1,
    name: 'Public',
  },
  {
    id: 2,
    name: 'Connections Only',
  },
  {
    id: 3,
    name: 'Specific Group',
  },
];

export const DISPLAY_CHOICES_LIST = [
  {
    id: 0,
    name: 'Rawcaster',
  },
  {
    id: 1,
    name: 'Public',
  },
  {
    id: 2,
    name: 'All Connections',
  },
  {
    id: 3,
    name: 'Specific Connections',
  },
  {
    id: 4,
    name: 'All Groups',
  },
  {
    id: 5,
    name: 'Specific Group',
  },
  {
    id: 6,
    name: 'My Influencers',
  },
  {
    id: 7,
    name: 'Mine Only',
  },
];

export const ACCOUNT_ACTIVE_STATUS_LIST = [
  {
    id: 0,
    name: 'Inactive',
  },
  {
    id: 1,
    name: 'Active',
  },
];

export const SIGNUP_TYPE = {
  email_phone: 1,
  apple: 2,
  twitter: 3,
  instagram: 4,
  google: 5,
};

export const SOCIAL_SIGN_IN_LIST = [
  {
    id: SIGNUP_TYPE.apple,
    platformName: 'Apple',
    iconName: 'apple',
    deviceType: ['ios'],
  },
  {
    id: SIGNUP_TYPE.google,
    platformName: 'Google',
    iconName: 'google',
    deviceType: ['ios', 'android'],
  },
  // {
  //   id: SIGNUP_TYPE.instagram,
  //   platformName: 'Instagram',
  //   iconName: 'instagram',
  //   deviceType: ['ios', 'android'],
  // },
  // {
  //   id: SIGNUP_TYPE.twitter,
  //   platformName: 'Twitter',
  //   iconName: 'twitter',
  //   deviceType: ['ios', 'android'],
  // },
];

export const GENDER_LIST = [
  {
    id: 0,
    name: 'Transgender',
  },
  {
    id: 1,
    name: 'Male',
  },
  {
    id: 2,
    name: 'Female',
  },
];

export const EVENTS_LIST_FILTER_TYPES = [
  {
    id: 0,
    name: 'Upcoming Events',
  },
  {
    id: 1,
    name: 'My Events',
  },
  {
    id: 2,
    name: 'Invited Events',
  },
  {
    id: 3,
    name: 'Public Events',
  },
  {
    id: 4,
    name: 'Past Events',
  },
];

export const EVENT_VISIBILITY_TYPE_LIST = [
  {
    id: 1,
    name: 'Public',
  },
  {
    id: 2,
    name: 'Private',
  },
  {
    id: 3,
    name: 'Fans',
  },
];

export const EVENT_LAYOUT_LIST = [
  {
    id: 1,
    name: 'Default',
  },
  {
    id: 2,
    name: 'Class Room',
  },
];

export const NUGGET_ACTIONS = [
  {id: 1, buttonName: 'Edit'},
  {id: 2, buttonName: 'Delete'},
  {id: 3, buttonName: 'Block User'},
  {id: 4, buttonName: 'Report Abuse'},
  {id: 5, buttonName: 'Share Link'},
];

export const EVENT_TYPE = {
  event: 1,
  talkshow: 2,
  live: 3,
};

export const NUGGET_SHARE_TYPE = [
  {id: 1, name: 'Public'},
  {id: 2, name: 'Only me'},
  {id: 6, name: 'Connections'},
  {id: 3, name: 'Group'},
  {id: 4, name: 'Specific Connection'},
  {id: 7, name: 'My Fans'},
];

export const DEVICE_TYPE = Platform.OS;
export const IS_IOS = Platform.OS === 'ios';
export const AGE_RESTRICTION = 13;
export const TEXT_INPUT_HEIGHT = 45;
export const SCREEN_PADDING_HORIZONTAL = 10;

export const DATES_MONTHS_YEARS_DATA = {
  months: moment.months(),
  dates: [...Array(31)].map((_, index) => index + 1),
  years: getyears({decreasedYears: AGE_RESTRICTION}),
};

// Regex
export const PASSWORD_REGEX = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/;
export const NAME_REGEX = /^[A-Za-z_ ]+$/;
export const NUMBER_REGEX = /^[0-9]*$/;
export const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const PHONE_REGEX = /^[0-9]{4,15}$/;
