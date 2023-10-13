import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS} from '../../../../Utilities/Colors';
import StyledText from '../../../../Components/StyledText';
import {FONTS} from '../../../../Utilities/Fonts';
import {BottomSheetFlatList, BottomSheetView} from '@gorhom/bottom-sheet';
import {useProfile, useToken} from '../../../../Utilities/StoreData';
import SVGIcon from '../../../../Components/SVGIcon';
import {DIMENSIONS} from '../../../../Utilities/Constants';
import {
  addNuggetCommentService,
  deleteNuggetCommentService,
  editNuggetCommentService,
  nuggetCommentListService,
  nuggetContentAudioService,
} from '../../../../Services/ApiService';
import {getSlicedText} from '../../../../Utilities/Methods';
import CommentReplyFullItem from './CommentReplyFullItem';
import Toast from '../../../../Components/Toast';
import {EmojiKeyboard} from 'rn-emoji-keyboard';
import RBSheetTextInput from '../../../../Components/RBSheetTextInput';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

var isMount = true;
var readoutController = undefined;
const CommentsList = ({
  onPressBack,
  id,
  totalComments,
  setTotalComments,
  setisEnableContentPanningGesture,
}) => {
  const [isOpenEmojiContainer, setisOpenEmojiContainer] = useState(false);
  const inpuFieldRef = useRef(null);
  const audioPlayerRef = useRef(new AudioRecorderPlayer());
  const [replyData, setreplyData] = useState(null);
  const [editData, seteditData] = useState(null);
  const [isLoading, setisLoading] = useState(true);
  const [commentsList, setcommentsList] = useState([]);
  const token = useToken();
  const [typedText, settypedText] = useState('');
  const profile = useProfile();
  const [readoutCommentData, setreadoutCommentData] = useState({
    id: null,
    isLoading: false,
    url: null,
    isPlaying: false,
  });

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
      handleStopAudio();
      if (readoutController) {
        readoutController.abort();
      }
    };
  }, []);

  useEffect(() => {
    /**
     * Handles the back action when the user presses the back button.
     * This function updates the state of isOpenEmojiContainer and enables/disables
     * content panning gesture based on the current state.
     * If isOpenEmojiContainer is true, it sets isOpenEmojiContainer to false and enables
     * content panning gesture. If isOpenEmojiContainer is false, it calls onPressBack().
     * @returns {boolean} - Returns true after handling the back action.
     */
    const backAction = () => {
      let tempIsOpenedEmoji;
      setisOpenEmojiContainer(pre => {
        tempIsOpenedEmoji = pre;
        return pre;
      });

      if (tempIsOpenedEmoji) {
        if (isMount) {
          setisEnableContentPanningGesture(true);
          setisOpenEmojiContainer(false);
        }
      } else {
        onPressBack();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    commentsListAPICall();
  }, []);

  /**
   * Stops the audio playback and removes the playback listener.
   * If an error occurs during the process, it is caught and ignored.
   * Finally, sets the 'isReadMuted' state to false.
   * @returns None
   */
  const handleStopAudio = () => {
    try {
      audioPlayerRef.current?.stopPlayer();
      audioPlayerRef.current?.removePlayBackListener();
    } catch (e) {
    } finally {
      if (isMount) {
        setreadoutCommentData(pre => ({
          ...pre,
          isPlaying: false,
        }));
      }
    }
  };

  /**
   * Handles playing audio from the given URL.
   * @param {string} url - The URL of the audio file to play.
   * @returns None
   */
  const handlePlayAudio = async url => {
    handleStopAudio();
    try {
      await audioPlayerRef.current?.startPlayer(url);
      audioPlayerRef.current?.addPlayBackListener(e => {
        if (Math.floor(e.currentPosition) === 0) {
          if (isMount) {
            setreadoutCommentData(pre => ({
              ...pre,
              isPlaying: true,
            }));
          }
        } else if (e.currentPosition >= e.duration) {
          handleStopAudio();
        }
        return;
      });
    } catch (e) {
      if (isMount) {
        setreadoutCommentData(pre => ({
          ...pre,
          isPlaying: false,
        }));
      }
    }
  };

  /**
   * Makes an API call to retrieve the comments list for a specific nugget.
   * @returns None
   */
  const commentsListAPICall = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', id);
    nuggetCommentListService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            setcommentsList(res.data.comments);
          }
        } else if (res.data.status === 0) {
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const handleReadoutComment = commentId => {
    handleStopAudio();
    if (isMount) {
      setreadoutCommentData(pre => ({
        ...pre,
        id: commentId,
        isLoading: true,
      }));
    }
    if (readoutController) {
      readoutController.abort();
    }
    readoutController = new AbortController();
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', commentId);
    formData.append('nugget_type', 1);
    formData.append('translation_type', 1);
    nuggetContentAudioService(formData, readoutController.signal)
      .then(res => {
        console.log(res.data, 'DATATATAA');
        if (isMount) {
          if (res.data.status === 1) {
            setreadoutCommentData(pre => ({
              ...pre,
              isLoading: false,
              url: res.data.file_path,
            }));
            handlePlayAudio(res.data.file_path);
          } else if (res.data.status === 0) {
            Toast.fail(res.data.msg);
            setreadoutCommentData(pre => ({
              ...pre,
              id: null,
              isLoading: false,
              url: null,
              isPlaying: false,
            }));
          }
        }
      })
      .catch(e => {
        if (!e.message.includes('cancel')) {
          Toast.fail(e.message);
          if (isMount) {
            setreadoutCommentData(pre => ({
              ...pre,
              id: null,
              isLoading: false,
              url: null,
              isPlaying: false,
            }));
          }
        }
      });
  };

  /**
   * Handles the posting of a comment to the server.
   * @param {string} commentText - The text of the comment to be posted.
   * @param {object} replyCommentData - The data of the comment being replied to, if any.
   * @param {string} generatedTempId - The temporary ID assigned to the comment before it is posted.
   * @param {array} updatedCommentsList - The updated list of comments.
   * @returns None
   */
  const handlepostComment = (
    commentText = '',
    replyCommentData = null,
    generatedTempId,
    updatedCommentsList,
  ) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('type', replyCommentData ? 2 : 1);
    formData.append('nugget_id', id);
    formData.append('comment', commentText.trim());
    if (replyCommentData) {
      formData.append('comment_id', replyCommentData.comment_id);
    }
    addNuggetCommentService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (replyCommentData) {
            const index = updatedCommentsList.findIndex(
              item => item.comment_id === replyCommentData.parent_comment_id,
            );
            if (index !== -1) {
              let replyCommentsList = [...updatedCommentsList[index].reply];
              const replyCommentIndex = replyCommentsList.findIndex(
                item => item.comment_id === generatedTempId,
              );
              if (replyCommentIndex !== -1) {
                replyCommentsList[replyCommentIndex] = {...res.data.comment};
                updatedCommentsList[index] = {
                  ...updatedCommentsList[index],
                  reply: [...replyCommentsList],
                };
              }
            }
          } else {
            let newCommentIndex = [...updatedCommentsList].findIndex(
              item => item.comment_id === generatedTempId,
            );
            if (newCommentIndex !== -1) {
              updatedCommentsList[newCommentIndex] = {...res.data.comment};
            }
          }
          if (isMount) {
            setcommentsList([...updatedCommentsList]);
          }
        } else if (res.data.status === 0) {
        }
      })
      .catch(e => {})
      .finally(() => {});
  };

  /**
   * Handles the action of sending a comment.
   * @returns None
   */
  const onSendComment = () => {
    settypedText(preText => {
      const tempReplyData = replyData ? {...replyData} : null;
      if (isMount) {
        setreplyData(null);
      }
      const generatedTempId = new Date().getTime() + 100 * Math.random();
      const newComment = {
        comment_id: generatedTempId,
        user_id: profile?.user_id,
        name: profile?.name,
        profile_image: profile?.profile_image,
        comment: preText.trim(),
        reply: [],
        commented_date: new Date(),
        isLoading: true,
      };
      let updatedCommentsList = [...commentsList];
      if (tempReplyData) {
        let index = updatedCommentsList.findIndex(
          item => item.comment_id === tempReplyData.parent_comment_id,
        );
        if (index !== -1) {
          updatedCommentsList[index] = {
            ...updatedCommentsList[index],
            reply: [...updatedCommentsList[index].reply, {...newComment}],
          };
        }
      } else {
        updatedCommentsList = [{...newComment}, ...commentsList];
      }
      if (isMount) {
        setcommentsList(updatedCommentsList);
        setTotalComments(parseInt(totalComments) + 1);
      }
      handlepostComment(
        preText,
        tempReplyData,
        generatedTempId,
        updatedCommentsList,
      );
      return '';
    });
  };

  /**
   * Handles the deletion of a comment.
   * @param {string} commentId - The ID of the comment to be deleted.
   * @param {Array} preCommentsList - The list of comments before the deletion.
   * @returns None
   */
  const handleDeleteComment = (commentId, preCommentsList) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('comment_id', commentId);
    deleteNuggetCommentService(formData)
      .then(res => {})
      .catch(e => {
        if (isMount) {
          setcommentsList(preCommentsList);
        }
        Toast.fail(e.message);
      });
  };

  /**
   * Handles the editing of a comment by sending a request to the server to update the comment.
   * @param {string} commentId - The ID of the comment to be edited.
   * @param {string} comment - The updated content of the comment.
   * @param {Array} preCommentsList - The previous list of comments before the edit.
   * @returns None
   */
  const handleEditComment = (commentId, comment, preCommentsList) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('comment_id', commentId);
    formData.append('comment', comment);
    editNuggetCommentService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            setreadoutCommentData(preData => {
              let tempData = {...preData};
              if (commentId === tempData.id) {
                tempData = {
                  id: null,
                  isLoading: false,
                  isPlaying: false,
                  url: null,
                };
              }
              return {
                ...tempData,
              };
            });
          }
        }
        if (res.data.status === 0) {
          if (isMount) {
            setcommentsList(preCommentsList);
          }
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        if (isMount) {
          setcommentsList(preCommentsList);
        }
        Toast.fail(e.message);
      });
  };

  /**
   * Handles the deletion of a comment.
   * @param {object} parentItem - The parent comment object.
   * @param {object} deleteItem - The comment object to be deleted.
   * @param {boolean} isReply - Indicates whether the comment is a reply or not.
   * @returns None
   */
  const onDeleteComment = (parentItem, deleteItem, isReply) => {
    const preCommentsList = [...commentsList]; // for API Catch Error
    let updatedCommentsList = [...preCommentsList];
    let updatedTotalComments = parseInt(totalComments) - 1;

    if (isReply) {
      let commentIndex = updatedCommentsList.findIndex(
        item => item.comment_id === parentItem.comment_id,
      );
      if (commentIndex !== -1) {
        let updatedReplyList = [
          ...updatedCommentsList[commentIndex].reply,
        ].filter(item => item.comment_id !== deleteItem.comment_id);
        updatedCommentsList[commentIndex] = {
          ...updatedCommentsList[commentIndex],
          reply: updatedReplyList,
        };
      }
    } else {
      const deletedItem = [...updatedCommentsList].find(
        item => item.comment_id === deleteItem.comment_id,
      );
      if (deletedItem) {
        const replyListLength = deletedItem.reply?.length;
        updatedTotalComments = updatedTotalComments - (replyListLength ?? 0);
      }
      updatedCommentsList = updatedCommentsList.filter(
        item => item.comment_id !== deleteItem.comment_id,
      );
    }
    if (isMount) {
      setcommentsList([...updatedCommentsList]);
      setTotalComments(updatedTotalComments);
    }
    handleDeleteComment(deleteItem.comment_id, preCommentsList);
  };

  /**
   * Handles the editing of a comment by updating the comments list and calling the
   * handleEditComment function.
   * @returns None
   */
  const onEditComment = () => {
    settypedText(preTypedText => {
      const editedItem = {...editData};
      if (isMount) {
        seteditData(null);
      }
      const preCommentsList = [...commentsList]; // for API Catch Error
      let updatedCommentsList = [...preCommentsList];
      const commentIndex = updatedCommentsList.findIndex(
        item => item.comment_id === editedItem.parentCommentId,
      );

      if (commentIndex !== -1) {
        if (editedItem.isReply) {
          let updatedReplyList = [...updatedCommentsList[commentIndex].reply];
          const replyIndex = [...updatedReplyList].findIndex(
            item => item.comment_id === editedItem.comment_id,
          );

          if (replyIndex !== -1) {
            updatedReplyList[replyIndex] = {
              ...updatedReplyList[replyIndex],
              comment: preTypedText.trim(),
            };
            updatedCommentsList[commentIndex] = {
              ...updatedCommentsList[commentIndex],
              reply: updatedReplyList,
            };
          }
        } else {
          updatedCommentsList[commentIndex] = {
            ...updatedCommentsList[commentIndex],
            comment: preTypedText.trim(),
          };
        }
      }
      if (isMount) {
        setcommentsList([...updatedCommentsList]);
      }
      handleEditComment(
        editedItem.comment_id,
        preTypedText.trim(),
        preCommentsList,
      );
      return '';
    });
  };

  return (
    <TouchableWithoutFeedback
      style={{flex: 1}}
      onPress={() => {
        if (isOpenEmojiContainer) {
          if (isMount) {
            setisEnableContentPanningGesture(true);
            setisOpenEmojiContainer(false);
          }
        }
        Keyboard.dismiss();
      }}>
      <View style={styles.mainContainer}>
        <View style={styles.titleContainer}>
          <StyledText style={styles.title}>
            All comments ( {totalComments} )
          </StyledText>
        </View>
        <View
          style={styles.commentsListContainer}
          activeOpacity={1}
          // onPress={() => {
          //   Keyboard.dismiss();
          //   if (isOpenEmojiContainer && isMount) {
          //     setisOpenEmojiContainer(false);
          //     setisEnableContentPanningGesture(true);
          //   }
          // }}
        >
          {isLoading ? (
            <ActivityIndicator
              color={COLORS.white}
              size={'large'}
              style={{marginTop: 20}}
            />
          ) : (
            <BottomSheetFlatList
              data={commentsList}
              keyboardShouldPersistTaps="handled"
              style={{flexGrow: 0}}
              keyExtractor={item => item.comment_id?.toString()}
              renderItem={({item}) => {
                return (
                  <CommentReplyFullItem
                    item={item}
                    handlePlayAudio={handlePlayAudio}
                    handleStopAudio={handleStopAudio}
                    replyData={replyData}
                    onDeleteComment={(deleteItem, isReply) => {
                      onDeleteComment(item, deleteItem, isReply);
                    }}
                    handleReadoutComment={handleReadoutComment}
                    readoutCommentData={readoutCommentData}
                    onPressEdit={(editItem, isReply) => {
                      if (isMount) {
                        setreplyData(null);
                        settypedText(editItem.comment);
                        seteditData({
                          parentCommentId: item.comment_id,
                          ...editItem,
                          isReply: isReply,
                        });
                      }
                      inpuFieldRef.current.focus();
                    }}
                    onPressReply={clickedCommentItem => {
                      if (isMount) {
                        settypedText('');
                        seteditData(null);
                        setreplyData({
                          ...clickedCommentItem,
                          parent_comment_id: item.comment_id,
                        });
                      }
                      inpuFieldRef.current.focus();
                    }}
                  />
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
        {!isLoading && (
          <View style={styles.bottomContainer}>
            {(replyData || editData) && (
              <View style={styles.replyDataContainer}>
                <View style={{flex: 1}}>
                  {replyData && (
                    <StyledText style={styles.replyDataText}>
                      Replying to {getSlicedText(replyData.name, 20)}
                    </StyledText>
                  )}
                  {editData && (
                    <StyledText style={styles.replyDataText}>
                      Edit your Comment
                    </StyledText>
                  )}
                </View>
                <SVGIcon
                  icon="close_rounded_dim_color"
                  height={22}
                  width={22}
                  isButton
                  onPress={() => {
                    if (isMount) {
                      settypedText('');
                      seteditData(null);
                      setreplyData(null);
                    }
                  }}
                />
              </View>
            )}
            <RBSheetTextInput
              inpuFieldRef={inpuFieldRef}
              onFocus={() => {
                if (isMount) {
                  setisOpenEmojiContainer(false);
                  setisEnableContentPanningGesture(true);
                }
              }}
              placeholderText={
                replyData
                  ? 'Add a reply...'
                  : editData
                  ? 'Edited comment'
                  : 'Type your comment here...'
              }
              onPressEmoji={() => {
                if (isMount) {
                  setisOpenEmojiContainer(pre => {
                    setisEnableContentPanningGesture(pre);
                    return !pre;
                  });
                }
              }}
              onPressSend={() => {
                if (isOpenEmojiContainer && isMount) {
                  setisEnableContentPanningGesture(true);
                  setisOpenEmojiContainer(false);
                }
                if (editData) {
                  onEditComment();
                } else {
                  onSendComment();
                }
              }}
              isInsideTextChange={false}
              onChangeText={settypedText}
              text={typedText}
            />
          </View>
        )}
        {isOpenEmojiContainer ? (
          <TouchableOpacity
            activeOpacity={1}
            style={{
              height: DIMENSIONS.window.height / 2,
              backgroundColor: COLORS.white,
              // position: 'absolute',
              // bottom: 0,
              // left: 0,
              // right: 0,
              borderTopStartRadius: 10,
              borderTopEndRadius: 10,
            }}>
            <BottomSheetView style={{flex: 1}}>
              <EmojiKeyboard
                onEmojiSelected={res => {
                  if (isMount) {
                    settypedText(pre => {
                      if (pre.length < 500) {
                        return pre + res.emoji;
                      }
                      return pre;
                    });
                  }
                }}
                // enableSearchBar
                // disabledCategories={['people_body', 'flags']}
                categoryPosition="bottom"
                enableCategoryChangeGesture={false}
                defaultHeight={'100%'}
                emojiSize={25}
                styles={{
                  header: {fontFamily: FONTS.DMSans.medium},
                  // container
                  // container: {width: },
                }}
              />
              {/* <EmojiSelector
              showSearchBar={false}
              showSectionTitles={false}
              columns="8"
              showHistory={false}
              category={Categories.emotion}
              onEmojiSelected={res => {
                if (isMount) {
                  settypedText(pre => {
                    if (pre.length < 500) {
                      return pre + res;
                    }
                    return pre;
                  });
                }
              }}
            /> */}
            </BottomSheetView>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CommentsList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.commentsBg,
    borderTopEndRadius: 25,
    borderTopStartRadius: 25,
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontFamily: FONTS.DMSans.bold,
    color: COLORS.white,
    fontSize: 16,
  },
  commentsListContainer: {
    paddingHorizontal: 15,
    flex: 1,
  },

  bottomContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  nameText: {
    fontFamily: FONTS.DMSans.medium,
    color: COLORS.white,
    fontSize: 16,
  },

  replyDataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  replyDataText: {
    color: COLORS.dimColor,
  },
});
