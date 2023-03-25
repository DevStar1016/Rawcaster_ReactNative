import {
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CustomHomeHeader, {CustomHomeHeaderProps} from './CustomHomeHeader';
import HeaderWithBack, {BackHeaderProps} from './HeaderWithBack';
import DefaultBackground from './DefaultBackground';
import Loader, {LoaderProps} from './Loader';
import {IS_IOS} from '../Utilities/Constants';
import {useInsets} from '../Utilities/StoreData';

interface Props {
  children: JSX.Element | JSX.Element[];
  isEnableKeyboardAware?: boolean;
  isEnableScroll?: boolean;
  backgroundColor?: string;
  isEnableHeader?: boolean;
  paddingBottom?: number;
  paddingHorizontal?: number;
  headerType?: 'header_with_back' | 'home_header';
  headerProps?: CustomHomeHeaderProps;
  isLoading?: boolean;
  isEnableDefaultBackground?: boolean;
  backHeaderProps?: BackHeaderProps;
  backHeaderContainerStyle?: ViewStyle;
  loaderProps?: LoaderProps;
  keyboardAwareContentContainerStyle?: ViewStyle;
  onLayoutHeight?: (height: number) => void;
  isEnablePrimaryColorStatusBar?: boolean;
  isEnableTopSafeAreaHomeHeader?: boolean;
}

const HOCView = ({
  children,
  isEnableKeyboardAware = false,
  isEnableScroll = false,
  backgroundColor = COLORS.white,
  isEnableHeader = true,
  paddingHorizontal = 10,
  headerType = 'header_with_back',
  headerProps = {},
  paddingBottom,
  isEnableDefaultBackground = false,
  backHeaderProps = {},
  backHeaderContainerStyle = {},
  isLoading = false,
  isEnablePrimaryColorStatusBar = true,
  onLayoutHeight,
  loaderProps = {},
  keyboardAwareContentContainerStyle,
  isEnableTopSafeAreaHomeHeader = false,
}: Props) => {
  const insets = useInsets();

  const safeAreaPaddingTop = IS_IOS
    ? 0
    : insets.top
    ? insets.top
    : StatusBar.currentHeight;

  return (
    // <ImageBackground
    //   source={require('../Assets/Png/bg.png')}
    //   style={{flex: 1}}
    //   resizeMode="stretch">
    <>
      {isEnableDefaultBackground && <DefaultBackground />}
      {isEnablePrimaryColorStatusBar && !isEnableDefaultBackground && (
        <View
          style={{
            backgroundColor: COLORS.primary,
            height: IS_IOS
              ? insets.top
                ? insets.top
                : 20
              : StatusBar.currentHeight,
          }}
        />
      )}

      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: isEnableDefaultBackground
            ? undefined
            : backgroundColor,
          paddingBottom,
        }}>
        {isEnableHeader && headerType === 'home_header' && (
          <CustomHomeHeader
            paddingTop={
              isEnableTopSafeAreaHomeHeader ? safeAreaPaddingTop : undefined
            }
            {...headerProps}
          />
        )}
        {isEnableHeader && headerType === 'header_with_back' && (
          <View
            onLayout={event => {
              if (onLayoutHeight) {
                onLayoutHeight(
                  event.nativeEvent.layout.height +
                    (IS_IOS
                      ? insets.top
                        ? insets.top
                        : 20
                      : StatusBar.currentHeight),
                );
              }
            }}
            style={{
              paddingTop:
                isEnablePrimaryColorStatusBar && !isEnableDefaultBackground
                  ? 0
                  : safeAreaPaddingTop,
              backgroundColor: backHeaderProps.bgColor ?? COLORS.primary,
              ...backHeaderContainerStyle,
            }}>
            <HeaderWithBack {...backHeaderProps} />
          </View>
        )}
        {isEnableKeyboardAware ? (
          <KeyboardAwareScrollView
            extraScrollHeight={55}
            style={{paddingHorizontal}}
            enableOnAndroid={true}
            bounces={false}
            contentContainerStyle={keyboardAwareContentContainerStyle}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={'handled'}
            // contentContainerStyle={{flex: 1}}
            scrollEnabled={true}>
            {children}
          </KeyboardAwareScrollView>
        ) : (
          <View style={{flex: 1, paddingHorizontal}}>
            {isEnableScroll ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {children}
              </ScrollView>
            ) : (
              children
            )}
          </View>
        )}
      </SafeAreaView>

      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} {...loaderProps} />
      </Modal>
    </>
    // </ImageBackground>
  );
};

export default HOCView;

const styles = StyleSheet.create({});
