import {FlatList, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../Utilities/Colors';
import StyledText from '../StyledText';
import {FONTS} from '../../Utilities/Fonts';
import SVGIcon from '../SVGIcon';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import ProfileWithBadge from '../ProfileWithBadge';
import RoundedIconButton from '../RoundedIconButton';
import {getSlicedText} from '../../Utilities/Methods';

type Participant = {
  user_id: number;
  user_img: string;
  user_name: string;
  isRequested?: boolean;
};

type renderProps = {
  item: Participant;
  index: number;
};

type Props = {
  onClose?: () => void;
  participantsList: Participant[];
  onPressAccept?: (userId: number) => void;
  onPressReject?: (userId: number) => void;
  hostUserId: number;
};

const ParticipantsList = ({
  onClose,
  participantsList = [],
  onPressAccept,
  onPressReject,
  hostUserId,
}: Props) => {
  const renderParticipant = ({item, index}: renderProps) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.profileImgNameContainer}>
          <ProfileWithBadge
            profileSize={35}
            extraMargin={0}
            padding={0}
            // profileImage={item.user_img}
          />
          <StyledText style={styles.nameText}>
            {getSlicedText(item.user_name, 25)}
          </StyledText>
        </View>
        <View style={styles.actionButtonsContainer}>
          {item.isRequested ? (
            <>
              <RoundedIconButton
                icon="tick"
                bgColor={COLORS.green}
                buttonSize={25}
                buttonStyle={{marginHorizontal: 10}}
                iconSize={17}
                onPress={() => {
                  if (onPressAccept) {
                    onPressAccept(item.user_id);
                  }
                }}
              />
              <RoundedIconButton
                icon="close_white"
                bgColor={COLORS.red}
                buttonSize={25}
                iconSize={13}
                onPress={() => {
                  if (onPressReject) {
                    onPressReject(item.user_id);
                  }
                }}
              />
            </>
          ) : (
            <>
              <SVGIcon
                icon="mic_white"
                height={22}
                width={22}
                marginRight={10}
                isButton
              />
              <SVGIcon icon="video_call_white" isButton />
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <View style={{height: 16, width: 16}} />
        <StyledText style={styles.titleText}>Participants</StyledText>
        <SVGIcon
          icon="close_white"
          height={16}
          width={16}
          isButton
          onPress={onClose}
        />
      </View>
      <View style={styles.listContainer}>
        <BottomSheetFlatList
          data={participantsList}
          renderItem={renderParticipant}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={() => {
            return <View style={{height: 10}} />;
          }}
        />
      </View>
    </View>
  );
};

export default ParticipantsList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.transparentDimColor,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.4,
    borderColor: COLORS.grey,
  },
  titleText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  emptyComponentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  profileImgNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    color: COLORS.white,
    marginLeft: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
