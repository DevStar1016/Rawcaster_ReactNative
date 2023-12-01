import {SafeAreaView, StyleSheet, View} from 'react-native';
import React from 'react';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {IS_IOS, TEXT_INPUT_HEIGHT} from '../Utilities/Constants';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';
import HeaderWithBack from './HeaderWithBack';
import {GOOGLE_SERACH_ANDROID, GOOGLE_SERACH_IOS} from '../Services/APIKeysIds';

const GooglePlacesList = ({setOpenModal, onSelect}) => {
  return (
    <View style={{flex: 1}}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
        }}>
        <HeaderWithBack
          title="Location Search"
          isTitleCenter={true}
          isModal
          isEnableSafeArea={IS_IOS}
          setModal={setOpenModal}
        />

        <GooglePlacesAutocomplete
          autoFocus={true}
          placeholder="Search "
          enablePoweredByContainer={false}
          onPress={(data, details = null) => {
            setOpenModal(false);
            onSelect(data.description);
          }}
          query={{
            key:
              Platform.OS === 'android'
                ? GOOGLE_SERACH_ANDROID
                : GOOGLE_SERACH_IOS,
            language: 'en',
          }}
          styles={{
            container: styles.listContainer,
            predefinedPlacesDescription: styles.predefinedPlacesDescription,
            textInputContainer: styles.inputContainer,
            textInput: styles.textInputField,
            row: styles.itemContainer,
            description: styles.description,
          }}
        />
      </View>
    </View>
  );
};

export default GooglePlacesList;

const styles = StyleSheet.create({
  inputContainer: {
    height: TEXT_INPUT_HEIGHT,
    width: '100%',
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderTopWidth: 3,
    borderColor: COLORS.borderColor,
    alignItems: 'center',
  },
  textInputField: {
    height: '100%',
    width: '100%',
    borderRadius: 11,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    fontSize: 14,
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.black,
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 10,
    height: 45,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  predefinedPlacesDescription: {
    color: 'red',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  description: {
    color: COLORS.black,
    fontFamily: FONTS.DMSans.regular,
    fontSize: 14,
  },
});
