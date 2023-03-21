import {StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommentItem from './CommentItem';
import {COLORS} from '../../../../Utilities/Colors';

const CommentReplyFullItem = ({
  item,
  replyData,
  onPressReply,
  onDeleteComment,
  onPressEdit,
}) => {
  return (
    <View>
      <CommentItem
        item={item}
        replyData={replyData}
        onPressReply={() => {
          onPressReply(item);
        }}
        onDeleteComment={() => {
          onDeleteComment(item);
        }}
        onPressEdit={() => {
          onPressEdit(item);
        }}
      />
      <View style={styles.replyListContainer}>
        {item.reply.length > 0 && <View style={styles.divider} />}
        {item.reply.map(replyItem => {
          return (
            <CommentItem
              key={replyItem.comment_id?.toString()}
              item={replyItem}
              isEnableReply={false}
              replyData={replyData}
              onPressReply={() => {
                onPressReply(replyItem);
              }}
              onDeleteComment={() => {
                onDeleteComment(replyItem, true);
              }}
              onPressEdit={() => {
                onPressEdit(replyItem, true);
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

export default CommentReplyFullItem;

const styles = StyleSheet.create({
  replyListContainer: {
    paddingLeft: 45,
    paddingVertical: 5,
  },
  divider: {
    borderTopColor: COLORS.white,
    borderTopWidth: 1,
    opacity: 0.2,
    marginBottom: 10,
  },
});
