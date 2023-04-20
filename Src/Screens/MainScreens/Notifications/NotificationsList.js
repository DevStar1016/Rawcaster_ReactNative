import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {useProfile} from '../../../Utilities/StoreData';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import {FONTS} from '../../../Utilities/Fonts';

const NotificationsList = () => {
  const profile = useProfile();

  function renderItem({item, index}) {
    return (
      <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8}>
        <View style={styles.itemLeftContainer}>
          <ProfileWithBadge
            profileImage={profile.profile_image}
            profileSize={50}
            padding={0}
          />
          <View style={styles.titleContainer}>
            <StyledText style={styles.nameText}>Godfrey Gad</StyledText>
            <StyledText style={styles.subText}>Posted a new event</StyledText>
          </View>
        </View>
        <View style={{alignItems: 'flex-end', justifyContent: 'center'}}>
          <StyledText style={styles.subText}>15 min ago</StyledText>
        </View>
      </TouchableOpacity>
    );
  }

  function keyExtractor(item, index) {
    return index.toString();
  }

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={[...Array(13)]}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default NotificationsList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    paddingLeft: 10,
  },
  nameText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
  },
  subText: {
    color: COLORS.placeHolderColor,
  },
});
