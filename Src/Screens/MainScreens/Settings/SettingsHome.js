import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import SVGIcon from '../../../Components/SVGIcon';
import {useNavigation} from '@react-navigation/native';
import {useToken} from '../../../Utilities/StoreData';
import {logoutService} from '../../../Services/ApiService';
import {removeToken} from '../../../Utilities/Methods';
import Toast from '../../../Components/Toast';
import Loader from '../../../Components/Loader';
import {useDispatch} from 'react-redux';
import {IS_ENABLE_CHIME_FUNCTIONALITY} from '../../../Utilities/Constants';

var isMount = true;
const SettingsHome = () => {
  const token = useToken();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isLoading, setisLoading] = useState(false);
  const settinsOptionsList = [
    {
      id: 1,
      name: 'General',
    },
    {
      id: 2,
      name: 'Notifications',
    },
    {
      id: 3,
      name: 'Blocking',
    },
    {
      id: 4,
      name: 'Change Password',
    },
    {
      id: 5,
      name: 'Event Settings',
      isHide: !IS_ENABLE_CHIME_FUNCTIONALITY,
    },
    {
      id: 6,
      name: 'Refer',
    },
    {
      id: 7,
      name: 'Logout',
    },
    // {
    //   id: 8,
    //   name: 'Development',
    // },
  ];

  useEffect(() => {
    isMount = true;
    return () => {
      isMount = false;
    };
  }, []);

  function logOut() {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    logoutService(formData)
      .then(res => {
        if (res.data.status === 1) {
          removeToken(dispatch);
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(e => {
        if (isMount) {
          setisLoading(false);
        }
      });
  }

  function onPressSettingsOption(id) {
    switch (id) {
      case 1:
        navigation.navigate('GeneralSettings');
        return;
      case 2:
        navigation.navigate('NotificationsSettings');
        return;
      case 3:
        navigation.navigate('Blocking');
        return;
      case 4:
        navigation.navigate('ChangePassword');
        return;
      case 5:
        navigation.navigate('EventSettings');
        return;
      case 6:
        navigation.navigate('ReferalSocialList');
        return;

      case 7:
        Alert.alert(
          'Logout!',
          'Do you want to Logout?',
          [
            {
              text: 'Cancel',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => {
                logOut();
              },
            },
          ],
          {cancelable: false},
        );
        return;
      case 8:
        navigation.navigate('Development');
        return;
    }
  }

  function renderItem({item}) {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={() => {
          onPressSettingsOption(item.id);
        }}>
        <StyledText>{item.name}</StyledText>
        <SVGIcon icon="arrow_right" height={15} width={15} />
      </TouchableOpacity>
    );
  }

  function keyExtractor(item) {
    return item.id.toString();
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack title="Settings" isEnableSafeArea />
      <View style={styles.contentContainer}>
        <FlatList
          data={settinsOptionsList.filter(item => !item.isHide)}
          bounces={false}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={() => {
            return <View style={styles.divider} />;
          }}
        />
      </View>
      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader
          bgColor={COLORS.transparentDimColor}
          loaderText={'Logging out'}
        />
      </Modal>
    </View>
  );
};

export default SettingsHome;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  itemContainer: {
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: COLORS.borderColor,
  },
});
