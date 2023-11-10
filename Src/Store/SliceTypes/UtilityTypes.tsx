type InsetsDataProp = {
  bottom: number;
  top: number;
  left: number;
  right: number;
  mediaHeight: number;
};

type GlobalLoaderProp = {
  status: boolean;
  text: string;
};

type PremiumAlertProp = {
  status: boolean;
  text: string;
};

export type UtilityDataProp = {
  insets: InsetsDataProp;
  isGroupJoinAlert: PremiumAlertProp;
  locationDetails: any;
  isBottomTabBarAbsolute: boolean;
  nugget_type: number; // 1 - video, 2 - audio
  bottomHomeButtonType: number; //1 - video or other_nuggets, 2 - rawcaster Logo
  isVisibleInfluencers: boolean;
  isAppForeground: boolean;
  isOpenLoginAlert: boolean;
  premiumAlert: PremiumAlertProp;
  isOpenVerifyPopup: boolean;
  globalLoaderData: GlobalLoaderProp;
};
