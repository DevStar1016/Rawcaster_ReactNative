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
  children: JSX.Element;
};

const CustomBottomSheetModal = ({
  refValue,
  onCloseModal,
  heightPercentage = '80%',
  enableContentPanningGesture = true,
  children,
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
      enableContentPanningGesture={enableContentPanningGesture}
      backdropComponent={() => {
        return (
          <TouchableOpacity
            style={{
              flex: 1,
              position: 'absolute',
              backgroundColor: COLORS.transparentDimColor,
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

export default CustomBottomSheetModal;

const styles = StyleSheet.create({});
