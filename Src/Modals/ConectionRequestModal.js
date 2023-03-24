import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useRef, useState} from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from '../Components/SVGIcon';
import {DIMENSIONS} from '../Utilities/Constants';
import {FONTS} from '../Utilities/Fonts';
import ProfileWithBadge from '../Components/ProfileWithBadge';
import {useProfile} from '../Utilities/StoreData';

const ConectionRequestModal = ({onClose}) => {
  const conectionRef = useRef();
  const profile = useProfile();
  const [index, setindex] = useState(0);
  const [connectionData, setconnectionData] = useState([
    {
      id: 1,
      name: 'Josephine Kim',
      profile_image: profile.profile_image,
      badge: 'macro',
    },
    {
      id: 2,
      name: 'Josephine ',
      profile_image: profile.profile_image,
      badge: 'macro',
    },
    {
      id: 3,
      name: ' Kim',
      profile_image: profile.profile_image,
      badge: 'macro',
    },
    {
      id: 4,
      name: 'Jose',
      profile_image: profile.profile_image,
      badge: 'macro',
    },
    {
      id: 5,
      name: 'Josim',
      profile_image: profile.profile_image,
      badge: 'macro',
    },
  ]);

  const scrollToIndex = index => {
    conectionRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
    setindex(index);
  };

  return (
    <View
      style={styles.screen}
      activeOpacity={1}
      //   onPress={() => onClose()}
    >
      <View style={styles.subContainer} activeOpacity={1}>
        <View style={styles.titleContainer}>
          <View style={styles.countContainer}>
            <Text style={styles.count}>{connectionData.length}</Text>
          </View>
          <Text style={styles.title}>Connection request</Text>
          <SVGIcon
            icon="close_white"
            height={15}
            width={15}
            isButton
            onPress={() => onClose()}
          />
        </View>
        <View style={styles.dataContainer}>
          <SVGIcon
            icon={index === 0 ? 'arrow_left_grey' : 'arrow_left'}
            isButton={index === 0 ? false : true}
            onPress={() => scrollToIndex(index - 1)}
          />
          <FlatList
            ref={conectionRef}
            data={connectionData}
            keyExtractor={item => item.id.toString()}
            horizontal
            pagingEnabled
            // style={{width: '75%'}}
            // ItemSeparatorComponent={() => (
            //   <View style={{width: 10, backgroundColor: 'green'}} />
            // )}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={index}
            onMomentumScrollEnd={event => {
              const currentIndex = Math.floor(
                Math.floor(event.nativeEvent.contentOffset.x) /
                  Math.floor(event.nativeEvent.layoutMeasurement.width),
              );
              if (index !== currentIndex) {
                setindex(currentIndex);
              }
            }}
            renderItem={({item}) => (
              <View
                style={{
                  width: DIMENSIONS.window.width - 130,
                  //   width: '50%',
                  // backgroundColor: 'red',
                  alignItems: 'center',
                }}>
                <ProfileWithBadge
                  profileImage={item.profile_image}
                  padding={0}
                  isEnableImagePicker={false}
                  badge={item.badge}
                />
                <Text style={styles.name}>{item.name}</Text>
              </View>
            )}
          />

          <SVGIcon
            icon={
              index === connectionData.length - 1
                ? 'arrow_right_grey'
                : 'arrow_right'
            }
            isButton={index === connectionData.length - 1 ? false : true}
            onPress={() => scrollToIndex(index + 1)}
          />
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.rejectBtn}>
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.proceedBtn}>
            <Text style={[styles.btnText, {color: COLORS.white}]}>
              Add Connection
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ConectionRequestModal;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.transparentDimColor,
  },
  subContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginHorizontal: 20,
    // paddingHorizontal: 20,
    // paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: DIMENSIONS.window.width - 50,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    // paddingVertical: 5,
    height: 40,
    alignItems: 'center',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  countContainer: {
    paddingHorizontal: 10,
    // paddingVertical: 5,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  count: {
    fontSize: 14,
    fontFamily: FONTS.DMSans.medium,
    color: COLORS.black,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.DMSans.medium,
    color: COLORS.white,
  },
  name: {
    fontSize: 16,
    fontFamily: FONTS.DMSans.medium,
    color: COLORS.black,
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  rejectBtn: {
    width: '48%',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGrey,
    borderRadius: 7,
  },
  proceedBtn: {
    width: '48%',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 7,
  },
  btnText: {
    fontSize: 16,
    fontFamily: FONTS.DMSans.medium,
    color: COLORS.black,
  },
});
