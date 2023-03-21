import {FlatList, StatusBar, StyleSheet, View} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
import lodash from 'lodash';
import NuggetItem from './NuggetItem';
import TextOnlyNugget from './NuggetItemTypes/TextOnlyNugget';
import {DIMENSIONS, IS_IOS} from '../../../Utilities/Constants';
import {useInsets, useToken} from '../../../Utilities/StoreData';
import PollNugget from './NuggetItemTypes/PollNugget';
import {
  likeAndUnlikeNuggetService,
  saveAndUnsaveNuggetService,
} from '../../../Services/ApiService';

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
  const token = useToken();
  const [nuggetData, setnuggetData] = useState({...nugget});
  const [isOpenComments, setisOpenComments] = useState(false);
  const [viewableItem, setviewableItem] = useState('');
  const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 70});
  const onViewRef = useRef(viewableItems => {
    if (viewableItems?.viewableItems?.length > 0)
      setviewableItem(viewableItems.viewableItems[0].item.media_id || 0);
  });
  const debounceOnLike = useCallback(
    lodash.debounce(likeAndUnlikeNuggetApiCall, 300),
    [],
  );
  const debounceOnSave = useCallback(
    lodash.debounce(saveAndUnsaveNuggetApiCall, 300),
    [],
  );
  const setTotalComments = totalComments => {
    setnuggetData(preData => ({
      ...preData,
      total_comments: totalComments,
    }));
  };

  const onPressLike = () => {
    setnuggetData(pre => {
      let isLiked = !pre.liked;
      let totalLikes = parseInt(pre.total_likes);
      totalLikes = isLiked ? totalLikes + 1 : totalLikes - 1;
      debounceOnLike(isLiked);
      return {...pre, liked: isLiked, total_likes: totalLikes};
    });
  };

  const onPressSave = () => {
    setnuggetData(pre => {
      let isSaved = !pre.saved;
      debounceOnSave(isSaved);
      return {...pre, saved: isSaved};
    });
  };

  function likeAndUnlikeNuggetApiCall(status) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nuggetData.nugget_id);
    formData.append('like', status ? 1 : 2);
    likeAndUnlikeNuggetService(formData)
      .then(res => {})
      .catch(e => {});
  }

  function saveAndUnsaveNuggetApiCall(status) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nuggetData.nugget_id);
    formData.append('save', status ? 1 : 2);
    saveAndUnsaveNuggetService(formData)
      .then(res => {})
      .catch(e => {});
  }

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
                setTotalComments={setTotalComments}
                isOpenComments={isOpenComments}
                setisOpenComments={setisOpenComments}
                isLiked={nuggetData.liked}
                onPressLike={onPressLike}
                isSaved={nuggetData.saved}
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
      ) : nuggetData.poll_option && nuggetData.poll_option.length > 0 ? (
        <PollNugget
          mediaHeight={mediaHeight}
          isEnableTopInsetsPadding={isEnableTopInsetsPadding}
          textNuggetNumberOfLines={textNuggetNumberOfLines}
          headerContainerHeight={headerContainerHeight}
          isEnableADDButton={isEnableADDButton}
          isSaved={nuggetData.saved}
          setisOpenComments={setisOpenComments}
          nuggetData={nuggetData}
          onPressLike={onPressLike}
          onPressSave={onPressSave}
        />
      ) : (
        <TextOnlyNugget
          mediaHeight={mediaHeight}
          isEnableTopInsetsPadding={isEnableTopInsetsPadding}
          textNuggetNumberOfLines={textNuggetNumberOfLines}
          headerContainerHeight={headerContainerHeight}
          isEnableADDButton={isEnableADDButton}
          isSaved={nuggetData.saved}
          setisOpenComments={setisOpenComments}
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
