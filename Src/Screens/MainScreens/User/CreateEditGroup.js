import {
  FlatList,
  LayoutAnimation,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import HOCView from '../../../Components/HOCView';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import TextBox from '../../../Components/TextBox';
import SubmitButton from '../../../Components/SubmitButton';
import SearchInput from '../../../Components/SearchInput';
import {
  useConnectionsList,
  useGroupsList,
  useProfile,
  useToken,
} from '../../../Utilities/StoreData';
import StyledText from '../../../Components/StyledText';
import RadioButton from '../../../Components/RadioButton';
import DefaultBackground from '../../../Components/DefaultBackground';
import {
  addFriendGroupService,
  editFriendGroupService,
} from '../../../Services/ApiService';
import {useNavigation} from '@react-navigation/native';
import Toast from '../../../Components/Toast';
import {useDispatch} from 'react-redux';
import {setGroupsList} from '../../../Store/Slices/HomeSlice';
import RoundedPlusButton from '../../../Components/RoundedPlusButton';
import MenuContainer from '../../../Modals/MenuContainer';
import SVGIcon from '../../../Components/SVGIcon';
import {GROUP_CATEGORY} from '../../../Utilities/Constants';

var isMount = true;
const CreateEditGroup = ({route}) => {
  const {groupId} = route.params ?? {};
  const groupsList = useGroupsList();
  const profile = useProfile();
  const groupDetails = [...groupsList].find(item => item.group_id === groupId);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const token = useToken();
  const connectionsList = useConnectionsList();
  const [selectedConnectionsIds, setselectedConnectionsIds] = useState([]);
  const [searchText, setsearchText] = useState('');
  const [groupName, setgroupName] = useState(
    groupDetails ? groupDetails.group_name : '',
  );
  const [groupProfileImage, setgroupProfileImage] = useState(
    groupDetails ? {uri: groupDetails.group_icon} : null,
  );
  const [isLoading, setisLoading] = useState(false);
  const [isShowAddButton, setisShowAddButton] = useState(true);
  const listViewOffset = useRef(0);
  const [isOpenGroupMenu, setisOpenGroupMenu] = useState(false);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  console.log(groupDetails, 'CATEGORY');

  function getCommonFormData() {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('group_name', groupName.trim());
    if (!groupId) {
      formData.append('group_members', JSON.stringify(selectedConnectionsIds));
    }
    if (groupId) {
      formData.append('group_id', groupId);
    }
    if (groupProfileImage && groupProfileImage.type) {
      formData.append('group_icon', groupProfileImage);
    }
    return formData;
  }

  function handleCreateGroup() {
    addFriendGroupService(getCommonFormData())
      .then(res => {
        if (res.data.status === 1) {
          dispatch(setGroupsList([{...res.data.group_details}, ...groupsList]));
          Toast.success(res.data.msg);
          navigation.goBack();
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  }

  function handleEditGroup() {
    editFriendGroupService(getCommonFormData())
      .then(res => {
        if (res.data.status === 1) {
          console.log(res.data.group_details, 'EDITED GROUP DATA');
          // dispatch(setGroupsList([{...res.data.group_details}, ...groupsList]));
          Toast.success(res.data.msg);
          navigation.goBack();
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  }

  function onSubmit() {
    if (getGroupNameError()) {
      Toast.fail(`You can't create group name with ${groupName.trim()}`);
      return;
    }
    if (isMount) {
      setisLoading(true);
    }
    if (groupId) {
      handleEditGroup();
    } else {
      handleCreateGroup();
    }
  }

  function handleSelectUnselectUser(id) {
    let tempSelectedIdsList = [...selectedConnectionsIds];
    if (tempSelectedIdsList.includes(id)) {
      tempSelectedIdsList = tempSelectedIdsList.filter(userId => userId !== id);
    } else {
      tempSelectedIdsList.push(id);
    }
    if (isMount) {
      setselectedConnectionsIds(tempSelectedIdsList);
    }
  }

  function onPressMenuOption(selectedButtonId) {
    if (isMount) {
      setisOpenGroupMenu(false);
    }
    console.log(selectedButtonId, 'KL');
    // switch(selectedButtonId){
    //   case 1:
    // }
  }

  function isDisabledSubmitButton() {
    if (groupName.trim() && !getGroupNameError()) {
      return false;
    }
    return true;
  }

  function isSelected(id) {
    return [...selectedConnectionsIds].includes(id);
  }

  function getGroupNameError() {
    if (groupDetails?.group_name?.toLowerCase() !== 'my fans') {
      if (groupName.trim().toLowerCase() === 'my fans') {
        return `Group name already exists`;
      }
    }
    return '';
  }

  function getMenuOptions() {
    return [
      {
        id: 1,
        buttonName: 'Enable Member Chat',
      },
      {
        id: 2,
        buttonName: 'Delete Group',
      },
      {
        id: 3,
        buttonName: 'Report Group',
      },
    ];
  }

  function getList() {
    let list = [];
    if (groupDetails) {
      list = groupDetails.group_members_list;
    } else {
      list = [...connectionsList];
    }
    if (searchText.trim()) {
      return list.filter(item =>
        item.display_name?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    return list;
  }

  function keyExtractor(item, index) {
    return item.user_id.toString();
  }

  function onScrollEvent(event) {
    if (!groupId) {
      return;
    }
    const CustomLayoutAnimation = {
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
    };

    let currentOffset = event.nativeEvent.contentOffset.y;
    const direction =
      currentOffset > 0 && currentOffset > listViewOffset.current
        ? 'down'
        : 'up';
    const isEnableButton = direction === 'up';
    if (isEnableButton !== isShowAddButton) {
      LayoutAnimation.configureNext(CustomLayoutAnimation);
      setisShowAddButton(isEnableButton);
    }
    listViewOffset.current = currentOffset;
  }

  function isOtherGroup() {
    return groupDetails.group_category === GROUP_CATEGORY.other;
  }
  function isMyFansGroup() {
    return groupDetails.group_category === GROUP_CATEGORY.myFans;
  }

  function isInfluencerGroup() {
    return groupDetails.group_category === GROUP_CATEGORY.influencer;
  }

  function isGroupOwner(id) {
    if (id) {
      return groupDetails?.group_owner === id;
    }
    return groupDetails?.group_owner === profile?.user_id;
  }

  function isMe(id) {
    return profile?.user_id === id;
  }

  function isEnableEdit() {
    return isGroupOwner() && isOtherGroup();
  }

  function getItemRightComponent(item) {
    if (groupDetails) {
      if (isGroupOwner(item.user_id)) {
        return <StyledText style={{color: COLORS.secondary}}>Owner</StyledText>;
      } else if (isEnableEdit()) {
        return <SVGIcon isButton icon="close_white" height={15} width={15} />;
      }
      return false;
    }
    return (
      <RadioButton
        disabled={true}
        isSelected={isSelected(item.user_id)}
        mainContainerStyle={{marginVertical: 0}}
        radioContainerStyle={{marginRight: 0, borderColor: COLORS.white}}
        isDisabledInsideCircleOuterSpace
        radioSelectedColor={COLORS.secondary}
      />
    );
  }

  function renderItem({item}) {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        disabled={groupId ? true : false}
        onPress={() => {
          handleSelectUnselectUser(item.user_id);
        }}
        activeOpacity={0.8}>
        <ProfileWithBadge
          profileImage={item.profile_img}
          extraMargin={0}
          isEnableGradient
          padding={0}
          profileSize={50}
          containerStyle={{marginRight: 10}}
        />
        <View style={styles.displayTextContainer}>
          <StyledText
            style={{color: COLORS.white}}
            normalTextModeTextProps={{numberOfLines: 1}}>
            {`${isMe(item.user_id) ? 'You' : item.display_name.trim()}`}
          </StyledText>
        </View>
        {getItemRightComponent(item)}
      </TouchableOpacity>
    );
  }

  return (
    <HOCView
      headerType="header_with_back"
      backHeaderProps={{
        title: `${groupId ? 'Edit' : 'Create'} Group`,
        isTitleCenter: true,
        rightIcon: 'menu_vertical_white',
        isEnableRightIcon: groupId ? true : false,
        rightIconSize: 18,
        onPressRightIcon: () => {
          if (isMount) {
            setisOpenGroupMenu(true);
          }
        },
      }}
      isLoading={isLoading}
      loaderProps={{loaderText: `${groupId ? 'Editing' : 'Creating'} Group`}}
      isEnableSafeArea={false}
      defaultBackgroundProps={{bgColor: COLORS.primaryDark}}
      paddingBottom={0}
      paddingHorizontal={0}
      backgroundColor={COLORS.primaryDark}>
      <View style={{paddingHorizontal: 10}}>
        <View style={styles.topContainer}>
          <ProfileWithBadge
            isEnableOnPressImagePicker
            isButton={isGroupOwner()}
            profileSize={45}
            profileImage={groupProfileImage?.uri}
            extraMargin={0}
            padding={0}
            onSelectImage={setgroupProfileImage}
          />
          <View style={styles.textInputCotainer}>
            <TextBox
              mainContainerMarginTop={0}
              value={groupName}
              isEditable={!groupId || (groupId && isEnableEdit())}
              borderColor={COLORS.transparent}
              textColor={COLORS.white}
              placeHolder="Enter group name"
              backgroundColor={COLORS.transparent}
              mainContainerMarginVertical={0}
              inputContainerMarginVertical={0}
              onChangeText={setgroupName}
            />
          </View>
          {(!groupId || (groupId && isGroupOwner())) && (
            <SubmitButton
              buttonText={groupId ? 'Edit' : 'Create'}
              marginTop={0}
              isDisabled={isDisabledSubmitButton()}
              marginBottom={0}
              paddingVertical={7}
              borderRadius={8}
              onPress={onSubmit}
            />
          )}
        </View>
        {getGroupNameError() ? (
          <StyledText style={{color: COLORS.red}}>
            {getGroupNameError()}
          </StyledText>
        ) : (
          false
        )}
        <SearchInput
          searchButtonColor={COLORS.secondary}
          marginVertical={5}
          marginTop={getGroupNameError() ? 10 : 5}
          searchWhenClickedButton={false}
          placeHolderText="Search Member"
          onSearch={setsearchText}
        />
      </View>
      {getList().length <= 0 && (
        <DefaultBackground
          bgColor={COLORS.primaryDark}
          centerText="No user found"
        />
      )}
      <View style={{flex: 1}}>
        <FlatList
          bounces={false}
          data={getList()}
          renderItem={renderItem}
          onScroll={onScrollEvent}
          ItemSeparatorComponent={() => {
            return <View style={{height: 15}} />;
          }}
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{paddingBottom: 20, paddingTop: 10}}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {groupId && isShowAddButton && (
        <RoundedPlusButton
          style={styles.addButton}
          onPress={() => {
            // navigation.navigate('CreateEditGroup');
          }}
        />
      )}

      <Modal
        visible={isOpenGroupMenu}
        transparent
        onRequestClose={() => {
          setisOpenGroupMenu(false);
        }}>
        <MenuContainer
          setModal={status => {
            setisOpenGroupMenu(status);
          }}
          buttonsOptions={getMenuOptions()}
          onPressOption={onPressMenuOption}
        />
      </Modal>
    </HOCView>
  );
};

export default CreateEditGroup;

const styles = StyleSheet.create({
  topContainer: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInputCotainer: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  displayTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    height: 50,
    width: 50,
    borderRadius: 25,
  },
});
