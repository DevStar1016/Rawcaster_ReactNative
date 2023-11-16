import {StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {Ref, useMemo} from 'react';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useInsets} from '../Utilities/StoreData';
import {COLORS} from '../Utilities/Colors';

type Props = {
  refValue?: any;
  heightPercentage?: string;
  onCloseModal?: () => void;
  enableContentPanningGesture?: boolean;
  bgColor?: string;
  children: JSX.Element;
};

const CustomBottomSheetModalTalkshow = ({
  refValue,
  onCloseModal,
  heightPercentage = '80%',
  enableContentPanningGesture = true,
  children,
  bgColor = COLORS.transparentDimColor,
}: Props) => {
  const insets = useInsets();
  const snapPoints = useMemo(() => [heightPercentage], []);

  return (
    <BottomSheetModal
      ref={refValue}
      handleStyle={{display: 'none'}}
      topInset={insets.top ? insets.top : StatusBar.currentHeight}
      bottomInset={insets.bottom}
      stackBehavior="push"
      keyboardBlurBehavior={'restore'}
      android_keyboardInputMode="adjustPan"
      backgroundComponent={() => <View />}
      onDismiss={onCloseModal}
      enableContentPanningGesture={enableContentPanningGesture}
      backdropComponent={() => {
        return (
          <TouchableOpacity
            style={{
              flex: 1,
              position: 'absolute',
              backgroundColor: bgColor,
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
            activeOpacity={1}
            onPress={onCloseModal}
          />
        );
      }}
      snapPoints={snapPoints}>
      {children}
    </BottomSheetModal>
  );
};

export default CustomBottomSheetModalTalkshow;

const styles = StyleSheet.create({});
