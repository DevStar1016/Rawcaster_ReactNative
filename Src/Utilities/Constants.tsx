import {Dimensions, Platform} from 'react-native';
import LivetalkImage from '../Assets/Png/IntroImages/live_talk.png';
import LiveChatImage from '../Assets/Png/IntroImages/live_chat.png';
import EventImage from '../Assets/Png/IntroImages/event.png';
import NuggetImage from '../Assets/Png/IntroImages/nugget.png';
import LiveImage from '../Assets/Png/IntroImages/live.png';
import {getyears} from './Methods';
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

export const SOCIAL_SIGN_IN_LIST = [
  {
    id: 1,
    platformName: 'Google',
    iconName: 'google',
  },
  {
    id: 2,
    platformName: 'Facebook',
    iconName: 'facebook',
  },
  {
    id: 3,
    platformName: 'Twitter',
    iconName: 'twitter',
  },
  {
    id: 4,
    platformName: 'Apple',
    iconName: 'apple',
  },
];

export const IS_IOS = Platform.OS === 'ios';
export const WINDOW_HEIGHT = Dimensions.get('window').height;
export const WINDOW_WIDTH = Dimensions.get('window').width;

export const DATES_MONTHS_YEARS_DATA = {
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  dates: [...Array(31)].map((_, index) => index + 1),
  years: getyears(),
};

// Regex

export const PASSWORD_REGEX = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/;
export const NAME_REGEX = /^[A-Za-z_ ]+$/;
export const NUMBER_REGEX = /^[0-9]*$/;
export const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
