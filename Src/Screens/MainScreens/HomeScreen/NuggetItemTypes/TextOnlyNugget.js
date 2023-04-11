import {StyleSheet, View} from 'react-native';
import React from 'react';
import NuggetActionsOverlay from '../NuggetActionsOverlay';
import {DIMENSIONS} from '../../../../Utilities/Constants';
import {COLORS} from '../../../../Utilities/Colors';
import DefaultBackground from '../../../../Components/DefaultBackground';
import {useInsets} from '../../../../Utilities/StoreData';
import {useNuggetParentActions} from '../../../../Utilities/Contexts';

const TextOnlyNugget = ({
  onPressShare,
  onPressShareType,
  onEditNugget,
  onDeleteNugget,
}) => {
  const {mediaHeight} = useNuggetParentActions();
  const insets = useInsets();
  const windowHeight = mediaHeight ?? insets.mediaHeight;
  const windowWidth = DIMENSIONS.window.width;
  return (
    <View
      style={[
        styles.mainContainer,
        {height: windowHeight, width: windowWidth},
      ]}>
      <DefaultBackground />

      <NuggetActionsOverlay
        onEditNugget={onEditNugget}
        onDeleteNugget={onDeleteNugget}
        onPressShare={onPressShare}
        onPressShareType={onPressShareType}
      />
    </View>
  );
};

export default TextOnlyNugget;

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
});
