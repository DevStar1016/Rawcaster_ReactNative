import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import lodash from 'lodash';
import ProfileWithBadge from '../../../../Components/ProfileWithBadge';
import StyledText from '../../../../Components/StyledText';
import {
  dateToShortDate,
  getSlicedText,
  htmlDecodeText,
} from '../../../../Utilities/Methods';
import SVGIcon from '../../../../Components/SVGIcon';
import {COLORS} from '../../../../Utilities/Colors';
import {FONTS} from '../../../../Utilities/Fonts';
import {useProfile, useToken} from '../../../../Utilities/StoreData';
import {
  likeAndUnlikeNuggetCommentService,
  nuggetContentAudioService,
} from '../../../../Services/ApiService';
import MenuPopup from '../../../../Components/MenuPopup';
import LoadingDots from '../../../../Components/LoadingDots';
import Toast from '../../../../Components/Toast';

var controller = undefined;
const CommentItem = ({
  item,
  replyData,
  onPressReply,
  readoutCommentData,
  handleReadoutComment,
  handlePlayAudio,
  handleStopAudio,
  isEnableReply = true,
  onPressEdit,
  onDeleteComment,
}) => {
  const [likedData, setlikedData] = useState({
    liked: item.liked,
    like_count: item.like_count,
  });
  const [translatedText, settranslatedText] = useState(null);
  const [isLoadingTranslation, setisLoadingTranslation] = useState(false);
  const token = useToken();

  const profile = useProfile();

  /**
   * Handles the like or unlike action for a comment.
   * @param {boolean} status - The status indicating whether to like or unlike the comment.
   * @returns None
   */
  const handleLikeComment = status => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('comment_id', item.comment_id);
    formData.append('like', status ? 1 : 2);
    likeAndUnlikeNuggetCommentService(formData)
      .then(res => {})
      .catch(e => {
        // setlikedData(preData => {
        //   let totalLikes = parseInt(preData.like_count);
        //   totalLikes = !status ? totalLikes + 1 : totalLikes - 1;
        //   return {
        //     liked: !status,
        //     like_count: !status ? totalLikes + 1 : totalLikes - 1,
        //   };
        // });
      });
  };

  const debounceOnLike = useCallback(
    lodash.debounce(handleLikeComment, 300),
    [],
  );

  const handleTranslateComment = () => {
    setisLoadingTranslation(true);
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', item.comment_id);
    formData.append('nugget_type', 1);
    formData.append('translation_type', 2);
    nuggetContentAudioService(formData)
      .then(res => {
        if (res.data.status === 1) {
          settranslatedText(res.data.translation);
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        setisLoadingTranslation(false);
      });
  };

  const ActionButton = ({marginLeft, name = '', icon, onPress, isSelected}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.actionButton, {marginLeft}]}
        onPress={onPress}>
        <SVGIcon icon={icon} height={15} width={15} marginRight={5} />
        <StyledText
          style={[
            styles.text,
            {color: isSelected ? COLORS.secondary : COLORS.white},
          ]}>
          {name}
        </StyledText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.itemContainer}>
      <View>
        <ProfileWithBadge
          profileImage={item.profile_image}
          profileSize={40}
          padding={0}
          extraMargin={0}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.rowContainer}>
          <View
            style={{
              flex: 1,
              paddingRight: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <StyledText
              style={styles.nameText}
              normalTextModeTextProps={{numberOfLines: 1}}>
              {htmlDecodeText(item.name)}
            </StyledText>
            {item?.account_verify_status === 1 && (
              <SVGIcon
                icon="diamond_verified"
                height={15}
                width={15}
                marginLeft={2}
              />
            )}
          </View>
          <View style={{paddingLeft: 5}}>
            <StyledText style={styles.text}>
              {dateToShortDate(item.commented_date)}
            </StyledText>
          </View>
        </View>
        <View style={[styles.rowContainer, {paddingBottom: 0}]}>
          <View style={{flex: 1}}>
            <StyledText style={[styles.text]}>
              {htmlDecodeText(translatedText ? translatedText : item.comment)}
            </StyledText>
          </View>
          {!item.isLoading && profile?.user_id === item.user_id && (
            <View style={{paddingLeft: 10, paddingVertical: 5}}>
              <MenuPopup
                options={[
                  {id: 1, name: 'Edit'},
                  {id: 2, name: 'Delete'},
                ]}
                onSelectOption={selectedId => {
                  if (selectedId === 1) {
                    onPressEdit();
                  } else {
                    Alert.alert(
                      'Delete!',
                      'Are you sure to delete this comment?',
                      [
                        {
                          text: 'No',
                          onPress: () => {},
                          style: 'cancel',
                        },
                        {
                          text: 'Yes',
                          onPress: () => {
                            onDeleteComment();
                          },
                        },
                      ],
                      {cancelable: false},
                    );
                  }
                }}
              />
            </View>
          )}
        </View>
        <View style={styles.actionButtonsContainer}>
          {item.isLoading ? (
            <StyledText style={{color: COLORS.dimColor}}>Posting...</StyledText>
          ) : (
            <>
              <View style={{flexDirection: 'row'}}>
                <ActionButton
                  icon={likedData.liked ? 'heart_pink' : 'heart_white'}
                  name={`Agree ${
                    parseInt(likedData.like_count) > 0
                      ? '(' + likedData.like_count + ')'
                      : ''
                  }`}
                  isSelected={likedData.liked}
                  onPress={() => {
                    // setcommentItem(pre => {
                    //   let isLiked = !pre.liked;
                    //   let likedCount = parseInt(pre.like_count);
                    //   likedCount = isLiked ? likedCount + 1 : likedCount - 1;
                    //   return {...pre, liked: isLiked, like_count: likedCount};
                    // });
                    setlikedData(pre => {
                      let isLiked = !pre.liked;
                      let likedCount = parseInt(pre.like_count);
                      likedCount = isLiked ? likedCount + 1 : likedCount - 1;
                      debounceOnLike(isLiked);
                      return {liked: isLiked, like_count: likedCount};
                    });
                  }}
                />

                {isEnableReply && (
                  <ActionButton
                    icon={
                      replyData && replyData.comment_id === item.comment_id
                        ? 'comment_pink'
                        : 'comment'
                    }
                    isSelected={
                      replyData && replyData.comment_id === item.comment_id
                    }
                    marginLeft={10}
                    name={`Reply ${
                      item.reply && item.reply.length > 0
                        ? '(' + item.reply.length + ')'
                        : ''
                    }`}
                    onPress={onPressReply}
                  />
                )}
              </View>
              <View style={{flexDirection: 'row'}}>
                {readoutCommentData?.id === item.comment_id &&
                readoutCommentData?.isLoading ? (
                  <LoadingDots
                    size={6}
                    bounceHeight={4}
                    dots={3}
                    borderRadius={3}
                  />
                ) : (
                  <SVGIcon
                    height={17.5}
                    icon={
                      readoutCommentData?.id === item.comment_id &&
                      readoutCommentData?.isPlaying
                        ? 'mic_off_fill_secondary'
                        : 'mic_fill_white'
                    }
                    isButton
                    onPress={() => {
                      if (
                        readoutCommentData?.id === item.comment_id &&
                        readoutCommentData?.isPlaying
                      ) {
                        handleStopAudio();
                      } else {
                        if (
                          readoutCommentData?.id === item.comment_id &&
                          !readoutCommentData?.isLoading &&
                          readoutCommentData?.url
                        ) {
                          handlePlayAudio(readoutCommentData?.url);
                        } else {
                          handleReadoutComment(item.comment_id);
                        }
                      }
                    }}
                  />
                )}
                <View
                  style={{
                    width: 2,
                    height: 16,
                    marginHorizontal: 5,
                    backgroundColor: COLORS.white,
                  }}
                />
                {isLoadingTranslation ? (
                  <LoadingDots
                    size={6}
                    bounceHeight={4}
                    dots={3}
                    borderRadius={3}
                  />
                ) : (
                  <SVGIcon
                    height={17.5}
                    icon={
                      translatedText
                        ? 'translation_secondary'
                        : 'translation_white'
                    }
                    isButton
                    onPress={() => {
                      if (translatedText) {
                        settranslatedText(null);
                      } else {
                        handleTranslateComment();
                      }
                    }}
                  />
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default CommentItem;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  text: {
    color: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
    alignItems: 'center',
  },
  nameText: {
    fontFamily: FONTS.DMSans.medium,
    color: COLORS.white,
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingVertical: 7,
    justifyContent: 'space-between',
  },
});
