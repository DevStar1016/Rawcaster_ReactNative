import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../../Utilities/Colors';
import ProfileWithBadge from '../../Components/ProfileWithBadge';
import SVGIcon from '../../Components/SVGIcon';
import StyledText from '../../Components/StyledText';
import {FONTS} from '../../Utilities/Fonts';
import GradientButton from '../../Components/GradientButton';
import SubmitButton from '../../Components/SubmitButton';
import {getSlicedText, htmlDecodeText} from '../../Utilities/Methods';
import ItemSelectionMiniList from '../../Components/ItemSelectionMiniList';
import Badges from '../../Utilities/Badges';

type Props = {
  isSelected?: boolean;
  onPressBecomeFan?: () => void;
  onPressSelect?: () => void;
  item: any;
};

const InfluencerItem = ({
  isSelected = false,
  onPressBecomeFan,
  onPressSelect,
  item,
}: Props) => {
  const [isOpenCategoriesListModal, setisOpenCategoriesListModal] =
    useState<boolean>(false);

  /**
   * Retrieves the list of selected categories from the item object.
   * @returns {Array} - An array containing the selected categories. If no categories are selected, an empty array is returned.
   */
  function getSelectedCategoriesList() {
    if (item.category && item.category.length > 0) {
      return [...item.category];
    }
    return [];
  }

  /**
   * Returns the length of the display name based on the length of the item's category.
   * If the category length is greater than 0 and the category length is greater than or equal to 15,
   * the display name length is set to 18. Otherwise, the display name length is set to 23.
   * @returns {number} The length of the display name.
   */
  function getDisplayNameLength() {
    if (item.category.length > 0 && item.category.toString().length >= 15) {
      return 18;
    }
    return 23;
  }

  /**
   * Calculates the length of the text for categories.
   * @returns {number} The length of the text for categories.
   */
  function getCategoriesTextLength() {
    if (
      htmlDecodeText(item.display_name) &&
      htmlDecodeText(item.display_name).length >= 15
    ) {
      return 15;
    }
    return 20;
  }

  /**
   * Retrieves the bio data from the given item.
   * @returns {string} The bio data if it exists, otherwise an empty string.
   */
  function getBioData() {
    if (item.bio_data) {
      return item.bio_data;
    }
    return '';
  }

  return (
    <View style={styles.mainConatiner}>
      <ProfileWithBadge
        badge={Badges(item.user_status_id)}
        containerStyle={styles.profileImageContainer}
        profileImage={item.profile_img}
      />
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={[
            styles.checkButton,
            {backgroundColor: isSelected ? COLORS.primary : COLORS.dimColor},
          ]}
          activeOpacity={0.7}
          onPress={onPressSelect}>
          <SVGIcon icon="tick" />
        </TouchableOpacity>
        <View style={styles.nameContainer}>
          <StyledText style={{fontFamily: FONTS.DMSans.medium, fontSize: 17}}>
            {getSlicedText(
              htmlDecodeText(item.display_name),
              getDisplayNameLength(),
            )}
          </StyledText>
          {item.category.toString() ? (
            <>
              <View style={styles.dot} />
              <StyledText
                style={{opacity: 0.7}}
                onPress={() => {
                  if (
                    item.category.toString().length > getCategoriesTextLength()
                  ) {
                    setisOpenCategoriesListModal(true);
                  }
                }}
                normalTextModeTextProps={{numberOfLines: 1}}>
                {getSlicedText(
                  item.category.toString(),
                  getCategoriesTextLength(),
                )}
              </StyledText>
            </>
          ) : (
            false
          )}
        </View>

        <StyledText
          style={{paddingVertical: 5}}
          textMode="read_more"
          numberOfLines={2}>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book.
        </StyledText>
        {/* {getBioData() ? (
          <StyledText
            style={{paddingVertical: 5}}
            textMode="read_more"
            numberOfLines={2}>
            {getBioData()}
          </StyledText>
        ) : (
          false
        )} */}

        {isSelected ? (
          <SubmitButton
            marginTop={15}
            padding={8}
            bgColor={COLORS.primary}
            borderColor={COLORS.primary}
            buttonText="Selected"
            isDisabled={true}
            rightIcon="right_arrow_white"
          />
        ) : (
          <GradientButton
            buttonText={'Become a Fan'}
            rightIcon="right_arrow_white"
            marginTop={15}
            onPress={onPressBecomeFan}
          />
        )}
      </View>

      <Modal
        visible={isOpenCategoriesListModal}
        onRequestClose={() => {
          setisOpenCategoriesListModal(false);
        }}
        transparent
        style={{backgroundColor: COLORS.transparentDimColor}}>
        <SafeAreaView
          style={{flex: 1, backgroundColor: COLORS.transparentDimColor}}>
          <ItemSelectionMiniList
            onClose={() => {
              setisOpenCategoriesListModal(false);
            }}
            isEnableClickItem={false}
            listData={[...getSelectedCategoriesList()]}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default InfluencerItem;

const styles = StyleSheet.create({
  mainConatiner: {
    paddingVertical: 5,
  },
  profileImageContainer: {
    position: 'absolute',
    zIndex: 1,
    left: 15,
  },
  contentContainer: {
    marginTop: 30,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 15,
  },
  checkButton: {
    height: 30,
    width: 30,
    backgroundColor: COLORS.primary,
    borderRadius: 30 / 2,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: COLORS.grey,
    borderRadius: 8 / 2,
    marginHorizontal: 10,
  },
});
