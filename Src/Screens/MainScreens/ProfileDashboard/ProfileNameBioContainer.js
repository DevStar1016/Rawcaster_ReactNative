import {Modal, SafeAreaView, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {COLORS} from '../../../Utilities/Colors';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import {
  useFollowingUsersList,
  useInfluencerCategoryList,
  useSettings,
  useToken,
} from '../../../Utilities/StoreData';
import {
  calcualteAge,
  getAuthCode,
  getBioData,
  getDefaultRawcasterPage,
  getSlicedText,
  htmlDecodeText,
  utcToUserTimezone,
} from '../../../Utilities/Methods';
import moment from 'moment';
import GradientButton from '../../../Components/GradientButton';
import CategoryBioEditor from '../../../Modals/CategoryBioEditor';
import {updateMyProfileService} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import {useDispatch} from 'react-redux';
import {setMyProfile} from '../../../Store/Slices/AuthSlice';
import Loader from '../../../Components/Loader';
import ItemSelectionMiniList from '../../../Components/ItemSelectionMiniList';
import SVGIcon from '../../../Components/SVGIcon';

const ProfileNameBioContainer = ({
  userId,
  profile,
  paddingHorizontal,
  onLayout,
  claimAccountStatus = 0,
  onPressBecomeFan,
  onPressClaimAccount,
}) => {
  const dispatch = useDispatch();
  const token = useToken();
  const settings = useSettings();
  const influencerCategoryList = useInfluencerCategoryList() ?? [];
  const [isUpdating, setisUpdating] = useState(false);
  const [isOpenBioCategoryEditor, setisOpenBioCategoryEditor] = useState(false);
  const [isOpenCategoriesListModal, setisOpenCategoriesListModal] =
    useState(false);

  const followingUsersList = useFollowingUsersList();

  const isFan = () => {
    const tempFollowingUsersList = [...followingUsersList];
    return tempFollowingUsersList.find(ele => ele.user_id === profile.user_id)
      ? true
      : false;
  };

  // const getBioData = () => {
  //   if (profile?.bio_data && profile?.bio_data.trim()) {
  //     return htmlDecodeText(profile?.bio_data.trim());
  //   }
  //   let bioDataText = '';
  //   if (profile?.dob) {
  //     bioDataText +=
  //       '<first_name> <last_name> is  <age> years old, was born in <dob>. ';
  //   }
  //   if (profile?.geo_location) {
  //     bioDataText +=
  //       '<first_name> <last_name> presently resides in <location>. ';
  //   }
  //   bioDataText +=
  //     '<first_name>’s preferred communication language is <language> . <first_name> has been a Rawcaster <user_status>  since <date_of_join> and prefers to be contacted in Rawcaster through <rawcaster_default_page>.';

  //   bioDataText = bioDataText.replace(
  //     /<first_name>/g,
  //     htmlDecodeText(profile?.first_name),
  //   );
  //   bioDataText = bioDataText.replace(
  //     /<last_name>/g,
  //     htmlDecodeText(profile?.last_name),
  //   );
  //   bioDataText = bioDataText.replace(
  //     /<age>/g,
  //     calcualteAge(moment(profile?.dob)),
  //   );
  //   bioDataText = bioDataText.replace(
  //     /<dob>/g,
  //     moment(profile?.dob).format(' MMM YYYY '),
  //   );
  //   bioDataText = bioDataText.replace(
  //     /<location>/g,
  //     htmlDecodeText(profile?.geo_location),
  //   );
  //   bioDataText = bioDataText.replace(
  //     /<language>/g,
  //     htmlDecodeText(profile?.language),
  //   );
  //   bioDataText = bioDataText.replace(/<user_status>/g, profile?.user_status);

  //   if (profile?.date_of_join) {
  //     bioDataText = bioDataText.replace(
  //       /<date_of_join>/g,
  //       utcToUserTimezone(profile?.date_of_join, settings?.time_zone).format(
  //         ' DD MMM YYYY ',
  //       ),
  //     );
  //   }
  //   bioDataText = bioDataText.replace(
  //     /<rawcaster_default_page>/g,
  //     getDefaultRawcasterPage(settings?.mobile_default_page || 1),
  //   );

  //   return bioDataText;
  // };

  function handleUpdateBioAndCategory(updatedData) {
    setisOpenBioCategoryEditor(false);
    setisUpdating(true);
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token + profile?.name.trim()));
    formData.append('name', profile?.name);
    formData.append('bio_data', updatedData.bio);
    formData.append('influencer_category', updatedData.categoryList.toString());
    updateMyProfileService(formData)
      .then(res => {
        if (res.data.status === 1) {
          let tempProfile = {...res.data.profile};
          tempProfile = {
            ...tempProfile,
            name: htmlDecodeText(tempProfile.name),
            first_name: htmlDecodeText(tempProfile.first_name),
            last_name: htmlDecodeText(tempProfile.last_name),
            bio_data: htmlDecodeText(tempProfile.bio_data),
          };

          dispatch(setMyProfile(tempProfile));
          Toast.success(res.data.msg);
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        setisUpdating(false);
      });
  }

  // const updateBioDataHandler = (bio) => {
  //   if (isMount) {
  //     setIsUpdating(true);
  //     setModalVisible(false);
  //   }
  //   const postData = new FormData();
  //   postData.append("token", auth.userToken);
  //   postData.append("name", auth.userProfile.name);
  //   postData.append(
  //     "auth_code",
  //     sha1(saltKey + auth.userToken + auth.userProfile.name)
  //   );
  //   postData.append("bio_data", bio);
  // postData.append("influencer_category", bio);

  //   UpdateMyProfile(postData)
  //     .then((response) => {
  //       dispatch(
  //         setProfile({
  //           ...auth.userProfile,
  //           bio_data: bio,
  //         })
  //       );
  //     })
  //     .catch((err) => {})
  //     .finally(() => {
  //       if (isMount) {
  //         setIsUpdating(false);
  //       }
  //     });
  // };

  function getSelectedCategoriesList() {
    return [...influencerCategoryList]
      .filter(item => [...getInfluencerCategoryIdsList()].includes(item.id))
      .map(item => item.name);
  }

  function getInfluencerCategoryIdsList() {
    if (profile?.influencer_category) {
      return profile?.influencer_category?.split(',')?.map(id => parseInt(id));
    }
    return [];
  }

  return (
    <View
      onLayout={onLayout}
      style={[styles.mainContainer, {paddingHorizontal}]}>
      <View style={styles.nameRowContainer}>
        <View style={styles.nameAndCategoryContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <StyledText
              style={[styles.nameText]}
              // normalTextModeTextProps={{numberOfLines: 1}}
              onPress={() => {
                console.log(profile);
              }}>
              {/* {getSlicedText(profile?.name, 50)} */}
              {profile?.name}
              {/* {profile?.account_verify_type === 2 && (
                <SVGIcon icon="diamond_verified" height={15} width={15} />
              )} */}
            </StyledText>
          </View>

          {/* {getSelectedCategoriesList().toString() ? (
            <View style={styles.dot} />
          ) : (
            false
          )} */}
          {getSelectedCategoriesList().toString() ? (
            <StyledText
              style={[styles.nameText]}
              // normalTextModeTextProps={{numberOfLines: 1}}
              onPress={() => {
                if (getSelectedCategoriesList().toString().length > 15) {
                  setisOpenCategoriesListModal(true);
                }
              }}>
              {getSelectedCategoriesList().toString().replace(/,/g, ', ')}
              {/* {getSlicedText(getSelectedCategoriesList().toString(), 15)} */}
            </StyledText>
          ) : (
            false
          )}
        </View>
        {!userId && (
          <View style={{marginLeft: 10}}>
            <RoundedIconButton
              buttonSize={30}
              iconSize={16}
              icon="edit_black"
              onPress={() => {
                setisOpenBioCategoryEditor(true);
                // setisOpenCategoryListSelection(true);
              }}
            />
          </View>
        )}
      </View>
      <View style={styles.bioContainer}>
        <StyledText>{getBioData(profile, settings)}</StyledText>
      </View>
      {userId && !isFan() && (
        <GradientButton
          buttonText={'Become a Fan'}
          rightIcon="right_arrow_white"
          marginTop={15}
          onPress={onPressBecomeFan}
        />
      )}
      {(claimAccountStatus === 1 || claimAccountStatus === 2) && (
        <GradientButton
          buttonText={
            claimAccountStatus === 1 ? 'Claim Account' : 'Claim Status Pending'
          }
          disabled={claimAccountStatus !== 1}
          rightIcon={claimAccountStatus === 1 ? 'right_arrow_white' : null}
          marginTop={15}
          onPress={onPressClaimAccount}
        />
      )}

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

      <Modal
        visible={isOpenBioCategoryEditor}
        transparent
        onRequestClose={() => {
          setisOpenBioCategoryEditor(false);
        }}>
        <CategoryBioEditor
          setModal={setisOpenBioCategoryEditor}
          preBioText={getBioData(profile, settings)}
          preSelectedCategoriesIds={getInfluencerCategoryIdsList()}
          onSubmit={handleUpdateBioAndCategory}
        />
      </Modal>

      <Modal visible={isUpdating} transparent>
        <Loader
          bgColor={COLORS.transparentDimColor}
          loaderText={'Profile Updating'}
        />
      </Modal>
    </View>
  );
};

export default ProfileNameBioContainer;

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 10,
    paddingTop: 12,
  },
  nameRowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameAndCategoryContainer: {
    flex: 1,
    // flexDirection: 'row',
    // alignItems: 'center',
    paddingVertical: 5,
    // backgroundColor: 'red',
  },
  nameText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 14,
  },
  dot: {
    height: 7,
    width: 7,
    backgroundColor: COLORS.black,
    borderRadius: 7 / 2,
    marginHorizontal: 10,
  },
  bioContainer: {
    paddingTop: 5,
  },
});
