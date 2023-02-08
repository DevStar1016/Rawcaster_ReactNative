import VisibilityOnIcon from '../Assets/Svg/visibility_on.svg';
import VisibilityOffIcon from '../Assets/Svg/visibility_off.svg';
import BackIcon from '../Assets/Svg/back.svg';
import DownArrowIcon from '../Assets/Svg/down_arrow.svg';
import GoogleIcon from '../Assets/Svg/google.svg';
import FaceBookIcon from '../Assets/Svg/facebook.svg';
import TwitterIcon from '../Assets/Svg/twitter.svg';
import AppleIcon from '../Assets/Svg/apple.svg';
import CloseIcon from '../Assets/Svg/close.svg';

export type IconType =
  | 'visibility_on'
  | 'visibility_off'
  | 'back'
  | 'down_arrow'
  | 'google'
  | 'facebook'
  | 'twitter'
  | 'apple'
  | 'close';
export const ICONS = {
  visibility_on: VisibilityOnIcon,
  visibility_off: VisibilityOffIcon,
  back: BackIcon,
  google: GoogleIcon,
  facebook: FaceBookIcon,
  twitter: TwitterIcon,
  apple: AppleIcon,
  down_arrow: DownArrowIcon,
  close: CloseIcon,
};
