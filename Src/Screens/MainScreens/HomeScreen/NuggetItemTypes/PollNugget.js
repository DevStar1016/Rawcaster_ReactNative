import {StyleSheet, View} from 'react-native';
import React from 'react';
import {useInsets} from '../../../../Utilities/StoreData';
import {DIMENSIONS} from '../../../../Utilities/Constants';
import DefaultBackground from '../../../../Components/DefaultBackground';
import NuggetActionsOverlay from '../NuggetActionsOverlay';
import {useNuggetParentActions} from '../../../../Utilities/Contexts';

const PollNugget = ({
  onDeleteNugget,
  onEditNugget,
  onPressShare,
  onPressShareType,
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
        onPressShareType={onPressShareType}
        onPressShare={onPressShare}
        onEditNugget={onEditNugget}
        onDeleteNugget={onDeleteNugget}
      />
    </View>
  );
};

export default PollNugget;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'red',
  },
});
