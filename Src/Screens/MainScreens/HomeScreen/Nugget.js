import {FlatList, StatusBar, StyleSheet, View} from 'react-native';
import React, {useRef, useState} from 'react';
import NuggetItem from './NuggetItem';
import TextOnlyNugget from './NuggetItemTypes/TextOnlyNugget';
import {DIMENSIONS, IS_IOS} from '../../../Utilities/Constants';
import {useInsets} from '../../../Utilities/StoreData';

const Nugget = ({
  nugget,
  onFinishPlaying,
  viewableNuggetItem,
  nuggetIndex,
  isMuted,
  isEnableTopInsetsPadding = true,
  setisMuted,
  textNuggetNumberOfLines = 15,
  headerContainerHeight,
  mediaHeight,
  isEnableADDButton,
}) => {
  const flatlistRef = useRef(null);
  const insets = useInsets();
  const [nuggetData, setnuggetData] = useState({...nugget});
  const [viewableItem, setviewableItem] = useState('');
  const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 70});

  const onViewRef = useRef(viewableItems => {
    if (viewableItems?.viewableItems?.length > 0)
      setviewableItem(viewableItems.viewableItems[0].item.media_id || 0);
  });
  const [isSaved, setisSaved] = useState(false);

  const onPressLike = () => {
    setnuggetData(pre => {
      let isLiked = pre.liked;
      return {
        ...pre,
        liked: !isLiked,
        total_likes: !isLiked ? pre.total_likes + 1 : pre.total_likes - 1,
      };
    });
  };

  const onPressSave = () => {
    setisSaved(pre => !pre);
  };

  return (
    <View style={styles.mainContainer}>
      {nuggetData?.media_list?.length > 0 ? (
        <View
          style={{
            flex: 1,
            height: mediaHeight ?? insets.mediaHeight,
            width: DIMENSIONS.window.width,
          }}>
          <FlatList
            ref={flatlistRef}
            showsHorizontalScrollIndicator={false}
            data={nuggetData.media_list ?? []}
            horizontal
            bounces={false}
            keyExtractor={item => item.media_id.toString()}
            renderItem={({item, index}) => (
              <NuggetItem
                mediaItem={item}
                isEnableTopInsetsPadding={isEnableTopInsetsPadding}
                textNuggetNumberOfLines={textNuggetNumberOfLines}
                headerContainerHeight={headerContainerHeight}
                isMuted={isMuted}
                setisMuted={setisMuted}
                isEnableADDButton={isEnableADDButton}
                mediaHeight={mediaHeight}
                nugget={nuggetData}
                index={index}
                isLiked={nuggetData.liked}
                onPressLike={onPressLike}
                isSaved={isSaved}
                onPressSave={onPressSave}
                viewableItem={viewableItem}
                nuggetId={nuggetData.nugget_id}
                viewableNuggetItem={viewableNuggetItem}
                onFinishPlaying={index => {
                  if (index < nuggetData?.media_list?.length - 1) {
                    flatlistRef.current.scrollToIndex({
                      index: index + 1,
                    });
                  } else {
                    onFinishPlaying(nuggetIndex);
                  }
                }}
              />
            )}
            pagingEnabled
            decelerationRate={0.9}
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={viewConfigRef.current}
          />
        </View>
      ) : (
        <TextOnlyNugget
          mediaHeight={mediaHeight}
          isEnableTopInsetsPadding={isEnableTopInsetsPadding}
          textNuggetNumberOfLines={textNuggetNumberOfLines}
          headerContainerHeight={headerContainerHeight}
          isEnableADDButton={isEnableADDButton}
          isSaved={isSaved}
          nuggetData={nuggetData}
          onPressLike={onPressLike}
          onPressSave={onPressSave}
        />
      )}
    </View>
  );
};

export default Nugget;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});
