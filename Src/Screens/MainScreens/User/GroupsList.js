import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useGroupsList} from '../../../Utilities/StoreData';
import {COLORS} from '../../../Utilities/Colors';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {getSlicedText} from '../../../Utilities/Methods';
import SVGIcon from '../../../Components/SVGIcon';
import {useMyConnections} from '../../../Utilities/Contexts';

const GroupsList = () => {
  const groupsList = useGroupsList();
  const {searchText} = useMyConnections();

  function getList() {
    if (searchText && searchText.trim()) {
      return [...groupsList].filter(item =>
        item.group_name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    return [...groupsList];
  }

  function keyExtractor(item) {
    return item.group_id.toString();
  }

  function renderItem({item, index}) {
    return (
      <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8}>
        <View style={styles.subContainer}>
          <ProfileWithBadge
            profileImage={item.group_icon}
            padding={0}
            profileSize={50}
            extraMargin={0}
          />
          <View style={styles.titleTextContainer}>
            <StyledText style={styles.nameText}>
              {getSlicedText(item.group_name, 20)}
            </StyledText>
            <StyledText style={styles.messageText}>
              {/* {getSlicedText(item.last_msg, 30)} */}Lorem ipsum dolor sit
              ame ...
            </StyledText>
          </View>
        </View>
        <View style={styles.actionIconsContainer}>
          <SVGIcon icon="chat_white" height={20} width={20} />
          <SVGIcon
            icon="audio_call_white"
            height={20}
            width={20}
            marginLeft={10}
          />
          <SVGIcon icon="event_white" height={21} width={21} marginLeft={10} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {getList().length > 0 ? (
        <FlatList
          data={getList()}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 20}}
          showsVerticalScrollIndicator={false}
          keyExtractor={keyExtractor}
        />
      ) : (
        <View style={styles.emptyListContainer}>
          <StyledText style={styles.emptyListText}>No data found</StyledText>
        </View>
      )}
    </View>
  );
};

export default GroupsList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
  },
  subContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleTextContainer: {
    paddingHorizontal: 10,
  },
  nameText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
    marginVertical: 2,
  },
  messageText: {
    color: COLORS.white,
    opacity: 0.7,
    marginVertical: 2,
  },
  actionIconsContainer: {
    flexDirection: 'row',
  },
  emptyListContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
  },
});
