import VisibilityOnIcon from '../Assets/Svg/visibility_on.svg';
import VisibilityOffIcon from '../Assets/Svg/visibility_off.svg';
import BackIcon from '../Assets/Svg/back.svg';
import DownArrowIcon from '../Assets/Svg/down_arrow.svg';
import GoogleIcon from '../Assets/Svg/google.svg';
import FaceBookIcon from '../Assets/Svg/facebook.svg';
import InstagramIcon from '../Assets/Svg/instagram.svg';

import TwitterIcon from '../Assets/Svg/twitter.svg';
import AppleIcon from '../Assets/Svg/apple.svg';
import CloseRoundedIcon from '../Assets/Svg/close_rounded.svg';
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
import TickIcon from '../Assets/Svg/tick.svg';
import CloseIcon from '../Assets/Svg/close.svg';
import CloseWhiteIcon from '../Assets/Svg/close_white.svg';
import RightArrowWhiteIcon from '../Assets/Svg/right_arrow_white.svg';
import ImageIcon from '../Assets/Svg/image.svg';
import VideoIcon from '../Assets/Svg/video.svg';
import HeartPinkIcon from '../Assets/Svg/heart_pink.svg';
import HeartWhiteIcon from '../Assets/Svg/heart_white.svg';
import CommentIcon from '../Assets/Svg/comment.svg';
import CommentPinkIcon from '../Assets/Svg/comment_pink.svg';
import SavePinkIcon from '../Assets/Svg/save_pink.svg';
import SaveWhiteIcon from '../Assets/Svg/save_white.svg';
import ShareIcon from '../Assets/Svg/share.svg';
import PlayWhiteIcon from '../Assets/Svg/play_white.svg';
import AppTextLogo from '../Assets/Svg/app_text_logo_colored.svg';
import PhoneIcon from '../Assets/Svg/phone.svg';
import EmailIcon from '../Assets/Svg/email.svg';
import GPSIcon from '../Assets/Svg/gps.svg';
import PlusIcon from '../Assets/Svg/plus.svg';
import RLogoIcon from '../Assets/Svg/logo_R.svg';
import DownFillWhiteIcon from '../Assets/Svg/down_fill_white.svg';
import LockFillWhiteIcon from '../Assets/Svg/lock_fill_white.svg';
import CameraFillWhiteIcon from '../Assets/Svg/camera_fill_white.svg';
import MicFillWhiteIcon from '../Assets/Svg/mic_fill_white.svg';
import PhotoFillWhiteIcon from '../Assets/Svg/photo_fill_white.svg';
import PollFillWhiteIcon from '../Assets/Svg/poll_fill_white.svg';
import VideoFillWhiteIcon from '../Assets/Svg/video_fill_white.svg';
import EmojeeWhiteIcon from '../Assets/Svg/emojee.svg';
import FlashAutoIcon from '../Assets/Svg/flash_auto.svg';
import FlashOnIcon from '../Assets/Svg/flash_on.svg';
import FlashOffIcon from '../Assets/Svg/flash_off.svg';
import FlipCameraIcon from '../Assets/Svg/flip_camera.svg';
import EditIcon from '../Assets/Svg/edit.svg';
import CropIcon from '../Assets/Svg/crop.svg';
import SendIcon from '../Assets/Svg/send.svg';
import RotateIcon from '../Assets/Svg/rotate.svg';
import PlayFillPrimaryIcon from '../Assets/Svg/play_fill_primary.svg';
import PauseFillPrimaryIcon from '../Assets/Svg/pause_fill_primary.svg';
import StopFillPrimaryIcon from '../Assets/Svg/stop_fill_primary.svg';
import MicFillPrimaryIcon from '../Assets/Svg/mic_fill_primary.svg';
import TickBlackIcon from '../Assets/Svg/tick_black.svg';
import EditBlackIcon from '../Assets/Svg/edit_black.svg';
import DeleteBlackIcon from '../Assets/Svg/delete_black.svg';
import CalendarBlackIcon from '../Assets/Svg/calendar_black.svg';
import ClockBlackIcon from '../Assets/Svg/clock_black.svg';
import DeleteWhiteIcon from '../Assets/Svg/delete_white.svg';
import DownArrowWhiteIcon from '../Assets/Svg/down_arrow_white.svg';
import CloseRoundedWhiteIcon from '../Assets/Svg/close_rounded_white.svg';
import MuteWhiteIcon from '../Assets/Svg/mute_white.svg';
import SpeakerWhiteIcon from '../Assets/Svg/speaker_white.svg';
import MenuHorizontalIcon from '../Assets/Svg/menu_horizontal.svg';
import MenuVerticalIcon from '../Assets/Svg/menu_vertical.svg';
import CloseRoundedDimColorIcon from '../Assets/Svg/close_rounded_dim_color.svg';
import CameraBlackIcon from '../Assets/Svg/camera_black.svg';
import CakeGreyIcon from '../Assets/Svg/cake_grey.svg';
import StudyGreyIcon from '../Assets/Svg/study_grey.svg';
import LocationGreyIcon from '../Assets/Svg/location_grey.svg';
import WorkGreyIcon from '../Assets/Svg/work_grey.svg';
import CalanderGreyIcon from '../Assets/Svg/calander_grey.svg';

import ValuedIcon from '../Assets/Svg/Badges/MemberShip/valued.svg';
import PremiumIcon from '../Assets/Svg/Badges/MemberShip/premium.svg';
import DiamondIcon from '../Assets/Svg/Badges/MemberShip/diamond.svg';
import NanoIcon from '../Assets/Svg/Badges/Influencer/nano.svg';
import MicroIcon from '../Assets/Svg/Badges/Influencer/micro.svg';
import MacroIcon from '../Assets/Svg/Badges/Influencer/macro.svg';
import MegaIcon from '../Assets/Svg/Badges/Influencer/mega.svg';

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
  | 'instagram'
  | 'close_rounded'
  | 'live'
  | 'search'
  | 'user'
  | 'user_plus'
  | 'influencer'
  | 'medal'
  | 'active_checkmark'
  | 'disable_checkmark'
  | 'right_arrow'
  | 'tick'
  | 'close'
  | 'close_white'
  | 'valued'
  | 'premium'
  | 'diamond'
  | 'nano'
  | 'micro'
  | 'macro'
  | 'right_arrow_white'
  | 'mega'
  | 'image'
  | 'video'
  | 'heart_white'
  | 'heart_pink'
  | 'comment'
  | 'save_pink'
  | 'save_white'
  | 'share'
  | 'play_white'
  | 'app_text_logo_colored'
  | 'phone'
  | 'email'
  | 'gps'
  | 'plus'
  | 'down_fill_white'
  | 'lock_fill_white'
  | 'logo_R'
  | 'camera_fill_white'
  | 'mic_fill_white'
  | 'photo_fill_white'
  | 'poll_fill_white'
  | 'emojee'
  | 'video_fill_white'
  | 'flash_auto'
  | 'flash_on'
  | 'flash_off'
  | 'flip_camera'
  | 'edit'
  | 'crop'
  | 'send'
  | 'rotate'
  | 'play_fill_primary'
  | 'pause_fill_primary'
  | 'stop_fill_primary'
  | 'mic_fill_primary'
  | 'tick_black'
  | 'edit_black'
  | 'delete_black'
  | 'calendar_black'
  | 'clock_black'
  | 'delete_white'
  | 'down_arrow_white'
  | 'close_rounded_white'
  | 'mute_white'
  | 'speaker_white'
  | 'menu_horizontal'
  | 'menu_vertical'
  | 'close_rounded_dim_color'
  | 'comment_pink'
  | 'camera_black'
  | 'cake_grey'
  | 'study_grey'
  | 'location_grey'
  | 'work_grey'
  | 'calander_grey';

export const ICONS = {
  visibility_on: VisibilityOnIcon,
  visibility_off: VisibilityOffIcon,
  back: BackIcon,
  google: GoogleIcon,
  facebook: FaceBookIcon,
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  apple: AppleIcon,
  down_arrow: DownArrowIcon,
  close_rounded: CloseRoundedIcon,
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
  tick: TickIcon,
  close: CloseIcon,
  close_white: CloseWhiteIcon,
  valued: ValuedIcon,
  premium: PremiumIcon,
  diamond: DiamondIcon,
  nano: NanoIcon,
  micro: MicroIcon,
  macro: MacroIcon,
  mega: MegaIcon,
  right_arrow_white: RightArrowWhiteIcon,
  image: ImageIcon,
  video: VideoIcon,
  heart_white: HeartWhiteIcon,
  heart_pink: HeartPinkIcon,
  comment: CommentIcon,
  save_pink: SavePinkIcon,
  save_white: SaveWhiteIcon,
  share: ShareIcon,
  play_white: PlayWhiteIcon,
  app_text_logo_colored: AppTextLogo,
  phone: PhoneIcon,
  email: EmailIcon,
  gps: GPSIcon,
  plus: PlusIcon,
  logo_R: RLogoIcon,
  down_fill_white: DownFillWhiteIcon,
  lock_fill_white: LockFillWhiteIcon,
  camera_fill_white: CameraFillWhiteIcon,
  mic_fill_white: MicFillWhiteIcon,
  photo_fill_white: PhotoFillWhiteIcon,
  poll_fill_white: PollFillWhiteIcon,
  video_fill_white: VideoFillWhiteIcon,
  emojee: EmojeeWhiteIcon,
  flash_auto: FlashAutoIcon,
  flash_on: FlashOnIcon,
  flash_off: FlashOffIcon,
  flip_camera: FlipCameraIcon,
  edit: EditIcon,
  crop: CropIcon,
  send: SendIcon,
  rotate: RotateIcon,
  play_fill_primary: PlayFillPrimaryIcon,
  pause_fill_primary: PauseFillPrimaryIcon,
  stop_fill_primary: StopFillPrimaryIcon,
  mic_fill_primary: MicFillPrimaryIcon,
  tick_black: TickBlackIcon,
  edit_black: EditBlackIcon,
  delete_black: DeleteBlackIcon,
  calendar_black: CalendarBlackIcon,
  clock_black: ClockBlackIcon,
  delete_white: DeleteWhiteIcon,
  down_arrow_white: DownArrowWhiteIcon,
  close_rounded_white: CloseRoundedWhiteIcon,
  mute_white: MuteWhiteIcon,
  speaker_white: SpeakerWhiteIcon,
  menu_horizontal: MenuHorizontalIcon,
  menu_vertical: MenuVerticalIcon,
  close_rounded_dim_color: CloseRoundedDimColorIcon,
  comment_pink: CommentPinkIcon,
  camera_black: CameraBlackIcon,
  cake_grey: CakeGreyIcon,
  study_grey: StudyGreyIcon,
  location_grey: LocationGreyIcon,
  work_grey: WorkGreyIcon,
  calander_grey: CalanderGreyIcon,
};
