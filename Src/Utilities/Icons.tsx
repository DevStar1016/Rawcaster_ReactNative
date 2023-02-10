import VisibilityOnIcon from '../Assets/Svg/visibility_on.svg';
import VisibilityOffIcon from '../Assets/Svg/visibility_off.svg';
import BackIcon from '../Assets/Svg/back.svg';
import DownArrowIcon from '../Assets/Svg/down_arrow.svg';
import GoogleIcon from '../Assets/Svg/google.svg';
import FaceBookIcon from '../Assets/Svg/facebook.svg';
import TwitterIcon from '../Assets/Svg/twitter.svg';
import AppleIcon from '../Assets/Svg/apple.svg';
import CloseIcon from '../Assets/Svg/close.svg';
import AppLogoIcon from '../Assets/Svg/app_logo_white.svg';
import SearchIcon from '../Assets/Svg/search.svg';
import LiveIcon from '../Assets/Svg/live.svg';
import UserIcon from '../Assets/Svg/user.svg';
import UserPlusIcon from '../Assets/Svg/user_plus.svg';
import ProfileImage from '../Assets/Svg/sample_profile.svg';
import Medal from '../Assets/Svg/silver_medal.svg';
import ActiveCheckMark from '../Assets/Svg/active_checkmark.svg';
import DisableCheckMark from '../Assets/Svg/disable_checkmark.svg';
import RightArrowIcon from '../Assets/Svg/right_arrow.svg';

export type IconType =
  | 'visibility_on'
  | 'visibility_off'
  | 'back'
  | 'app_logo_white'
  | 'down_arrow'
  | 'google'
  | 'facebook'
  | 'twitter'
  | 'apple'
  | 'close'
  | 'live'
  | 'search'
  | 'user'
  | 'user_plus'
  | 'influencer'
  | 'medal'
  | 'active_checkmark'
  | 'disable_checkmark'
  | 'right_arrow';
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
  app_logo_white: AppLogoIcon,
  search: SearchIcon,
  live: LiveIcon,
  user: UserIcon,
  user_plus: UserPlusIcon,
  influencer: ProfileImage,
  medal: Medal,
  active_checkmark: ActiveCheckMark,
  disable_checkmark: DisableCheckMark,
  right_arrow: RightArrowIcon,
};
