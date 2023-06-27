import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {FONTS} from '../../../Utilities/Fonts';
import MediaPreview, {
  PreviewMediaData,
} from '../../../Modals/CameraModals/MediaPreview';

type Props = {
  item: any;
  isPreChatSame?: boolean;
  isGroup?: boolean;
};

type PreviewModalData = {
  isOpen: boolean;
  data: PreviewMediaData | null;
};

const ChatItem = ({item, isPreChatSame, isGroup}: Props) => {
  const [previewData, setpreviewData] = useState<PreviewModalData>({
    isOpen: false,
    data: null,
  });

  const DummyView = () => {
    return (
      <View
        style={[
          styles.dummyViewContainer,
          item?.user_id === 1 ? {marginRight: 5} : {marginLeft: 5},
        ]}
      />
    );
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.mainContainer,
          {
            flexDirection: item?.user_id === 1 ? 'row' : 'row-reverse',
            marginTop: isPreChatSame ? 3 : 10,
          },
        ]}>
        {item?.user_id === 1 &&
          (isGroup && !isPreChatSame ? (
            <ProfileWithBadge
              profileImage={item?.profile_img}
              profileSize={22}
              extraMargin={0}
              padding={0}
              containerStyle={
                item?.user_id === 1 ? {marginRight: 5} : {marginLeft: 5}
              }
            />
          ) : (
            <DummyView />
          ))}
        <View
          style={[
            styles.chatMessageContainer,
            !isPreChatSame && item?.user_id === 1 && {borderTopStartRadius: 0},
            !isPreChatSame && item?.user_id === 2 && {borderTopEndRadius: 0},
            {
              backgroundColor:
                item?.user_id === 1 ? COLORS.lightGrey : COLORS.primaryLight,
            },
          ]}>
          {item?.user_id === 1 && isGroup && (
            <StyledText style={styles.userNameText}>{item.name}</StyledText>
          )}

          {item?.image && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={{height: 150, minWidth: '80%', marginVertical: 5}}>
              <Image
                source={{uri: item.image}}
                borderRadius={10}
                style={{height: '100%', width: '100%'}}
              />
            </TouchableOpacity>
          )}
          <StyledText
            style={{color: item?.user_id === 1 ? COLORS.black : COLORS.white}}>
            {item?.content}
          </StyledText>
          <View style={styles.timeContainer}>
            <StyledText
              style={[
                styles.timeText,
                {color: item?.user_id === 1 ? COLORS.black : COLORS.white},
              ]}>
              03:05 pm
            </StyledText>
          </View>
        </View>
      </TouchableOpacity>
      {/* <Modal
        visible={previewData.isOpen}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={() => {

        }}>
        <MediaPreview
          setModal={setisOpenPreview}
          data={mediaData}
          onSendMedia={item => {
            setModal(false);
            onSendMedia(item);
          }}
        />
      </Modal> */}
    </>
  );
};

export default ChatItem;

const styles = StyleSheet.create({
  mainContainer: {
    marginHorizontal: 10,
  },
  chatMessageContainer: {
    padding: 6,
    borderRadius: 10,
    maxWidth: '75%',
  },
  dummyViewContainer: {
    height: 22,
    width: 22,
  },
  userNameText: {
    fontFamily: FONTS.DMSans.medium,
    fontSize: 12,
    color: COLORS.primary,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
