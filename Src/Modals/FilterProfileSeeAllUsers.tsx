import {SafeAreaView, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from '../Components/SVGIcon';
import StyledText from '../Components/StyledText';
import {FONTS} from '../Utilities/Fonts';
import TextBox from '../Components/TextBox';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import SubmitButton from '../Components/SubmitButton';
import DropDownPicker from '../Components/DropDownPicker';
import {GENDER_LIST} from '../Utilities/Constants';

type FilterDataType = {
  country?: string;
  gender?: string;
  age?: string;
};

type Props = {
  setModal: (val: boolean) => void;
  onSubmit: (filterData: any) => void;
  listType: 'connections' | 'fans' | 'influencers' | 'unclaimed_influencers';
  preFilterData?: FilterDataType | null;
};

var isMount = true;
const FilterProfileSeeAllUsers = ({
  setModal,
  onSubmit,
  listType,
  preFilterData,
}: Props) => {
  const [ageError, setageError] = useState('');
  const [filterData, setfilterData] = useState<FilterDataType>(
    preFilterData ?? {
      country: undefined,
      gender: undefined,
      age: undefined,
    },
  );

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  /**
   * Clears the filter data by setting all values to null.
   * @returns None
   */
  function clearFilterData() {
    if (isMount) {
      let tempFilterData: any = {...filterData};
      Object.keys(tempFilterData).map((keyName: string) => {
        tempFilterData[keyName] = null;
      });

      setfilterData(tempFilterData);
    }
  }

  /**
   * Returns the title based on the given list type.
   * @returns {string} The title corresponding to the list type.
   */
  function getTitle() {
    switch (listType) {
      case 'connections':
        return 'Filter Connections';
      case 'fans':
        return 'Filter Fans';
      case 'influencers':
        return 'Filter Influencers';
      case 'unclaimed_influencers':
        return 'Filter Unclaimed Influencers';
      default:
        return '';
    }
  }

  /**
   * Sets the selected data value for a given field name in the filter data state.
   * @param {any} value - The value to set for the selected data.
   * @param {any} fieldName - The name of the field to set the value for.
   * @returns None
   */
  function setSelectedData(value: any, fieldName: any) {
    if (isMount) {
      setfilterData(preData => ({
        ...preData,
        [fieldName]: value,
      }));
    }
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
              <StyledText style={styles.titleText}>{getTitle()}</StyledText>
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
            title="Country"
            placeHolderText="Select Country"
            listType="large"
            fieldName="name"
            bigListProps={{apiName: 'country', isAPICall: true}}
            value={filterData.country}
            onSelectItem={selectedCountry => {
              setSelectedData(selectedCountry, 'country');
            }}
          />
          <DropDownPicker
            title="Gender"
            placeHolderText="Select Gender"
            dataList={GENDER_LIST}
            fieldName={'name'}
            value={filterData.gender}
            onSelectItem={selectedGender => {
              setSelectedData(selectedGender, 'gender');
            }}
          />

          <TextBox
            title="Age"
            placeHolder="Age"
            value={filterData.age}
            errorText={ageError}
            keyboardType="number-pad"
            onChangeText={text => {
              if (isMount) {
                setSelectedData(text, 'age');
                if (text) {
                  if (
                    isNaN(parseInt(text)) ||
                    text.includes('.') ||
                    text.includes(' ')
                  ) {
                    setageError('Enter Valid Age');
                  } else {
                    if (parseInt(text) <= 0 || parseInt(text) > 170) {
                      setageError('Enter Valid Age');
                    } else {
                      setageError('');
                    }
                  }
                } else {
                  setageError('');
                }
              }
            }}
          />
          <View style={styles.buttonsContainer}>
            <SubmitButton
              buttonText="CLEAR"
              buttonWidth={'48%'}
              bgColor={COLORS.white}
              textColor={COLORS.secondary}
              marginTop={0}
              onPress={clearFilterData}
            />
            <SubmitButton
              buttonText="SUBMIT"
              marginTop={0}
              buttonWidth={'48%'}
              onPress={() => {
                if (!ageError) {
                  onSubmit(filterData);
                }
              }}
            />
          </View>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default FilterProfileSeeAllUsers;

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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
});
