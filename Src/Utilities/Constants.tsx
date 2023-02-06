import {Platform} from 'react-native';
import LivetalkImage from '../Assets/Png/IntroImages/live_talk.png';
import LiveChatImage from '../Assets/Png/IntroImages/live_chat.png';
import EventImage from '../Assets/Png/IntroImages/event.png';
import NuggetImage from '../Assets/Png/IntroImages/nugget.png';
import LiveImage from '../Assets/Png/IntroImages/live.png';
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

export const IS_IOS = Platform.OS === 'ios';
