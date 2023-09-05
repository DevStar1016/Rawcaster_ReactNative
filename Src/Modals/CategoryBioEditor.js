import {Modal, SafeAreaView, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../Utilities/Colors';
import DropDownPicker from '../Components/DropDownPicker';
import {useInfluencerCategoryList} from '../Utilities/StoreData';
import MultiItemsSelectList from './MultiItemsSelectList';
import SVGIcon from '../Components/SVGIcon';
import StyledText from '../Components/StyledText';
import {FONTS} from '../Utilities/Fonts';
import TextBox from '../Components/TextBox';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import SubmitButton from '../Components/SubmitButton';

const CategoryBioEditor = ({
  setModal,
  preBioText = '',
  onSubmit,
  preSelectedCategoriesIds = [],
}) => {
  const influencerCategoryList = useInfluencerCategoryList();
  const [selectedCategoryIdsList, setselectedCategoryIdsList] = useState([
    ...preSelectedCategoriesIds,
  ]);
  const [isOpenCategoryListSelection, setisOpenCategoryListSelection] =
    useState(false);
  const [bioText, setbioText] = useState(preBioText);

  /**
   * Retrieves the names of the selected categories from the influencer category list.
   * @returns {string} A comma-separated string of the selected category names.
   */
  function getSelectedCategories() {
    return [...influencerCategoryList]
      .filter(item => [...selectedCategoryIdsList].includes(item.id))
      .map(item => item.name)
      .toString();
  }

  return (
    <View style={styles.mainContainer}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'handled'}
        style={{flexGrow: 0}}
        contentContainerStyle={{
          justifyContent: 'center',
          paddingVertical: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.subContainer}>
          <View style={styles.titleContainer}>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <StyledText style={styles.titleText}>
                Edit your Bio and Category
              </StyledText>
            </View>
            <SVGIcon
              icon="close_rounded_black"
              isButton
              height={20}
              width={20}
              onPress={() => {
                setModal(false);
              }}
            />
          </View>
          <DropDownPicker
            title="Category"
            placeHolderText="Select Category"
            isInsideList={false}
            value={getSelectedCategories()}
            onPress={() => {
              setisOpenCategoryListSelection(true);
            }}
          />

          <TextBox
            title="Bio"
            placeHolder="Enter Your Bio"
            multiline
            value={bioText}
            onChangeText={setbioText}
            inputContainerHeight={120}
            textAlignVertical={'top'}
          />
          <SubmitButton
            buttonText="SUBMIT"
            marginTop={5}
            onPress={() => {
              onSubmit({bio: bioText, categoryList: selectedCategoryIdsList});
            }}
          />
        </SafeAreaView>
      </KeyboardAwareScrollView>

      <Modal
        visible={isOpenCategoryListSelection}
        statusBarTranslucent
        onRequestClose={() => {
          setisOpenCategoryListSelection(false);
        }}>
        <MultiItemsSelectList
          title={'Select Category'}
          onCloseModal={() => {
            setisOpenCategoryListSelection(false);
          }}
          preSelectedIds={[...selectedCategoryIdsList]}
          displayFieldName={'name'}
          idFieldName={'id'}
          isEnableMaxSelection
          maxSelectedCount={3}
          itemTextContainerStyle={{paddingLeft: 10}}
          list={[...influencerCategoryList]}
          onSelectItems={list => {
            setisOpenCategoryListSelection(false);
            setselectedCategoryIdsList(list);
            // setisOpenViewOnlySelectionModal(false);
            // if (selectedShareTypeId) {
            //   handleSharNugget(selectedShareTypeId, list);
            // }
          }}
        />
      </Modal>
    </View>
  );
};

export default CategoryBioEditor;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: COLORS.transparentDimColor,
  },
  subContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 15,
  },
});
