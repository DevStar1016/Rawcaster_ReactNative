import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import {COLORS} from '../../../Utilities/Colors';
import {useSettings} from '../../../Utilities/StoreData';
import SwtchesContainer from '../../../Components/SwtchesContainer';

const SWITCHES_LIST = [
  {
    id: 1,
    name: 'Email',
  },
  {
    id: 2,
    name: 'SMS',
  },
  {
    id: 3,
    name: 'Push',
  },
];
const NotificationsSettings = () => {
  const settings = useSettings();
  const [connectionRequestSwitchStatus, setconnectionRequestSwitchStatus] =
    useState(settings.friend_request);
  const [nuggetsSwitchStatus, setnuggetsSwitchStatus] = useState(
    settings.nuggets,
  );
  const [eventsSwitchStatus, seteventsSwitchStatus] = useState(settings.events);

  function getOnStatusIdsList(dataText) {
    let data = dataText
      .split('')
      .map((status, index) =>
        parseInt(status) === 1 ? SWITCHES_LIST[index].id : undefined,
      );
    return data.filter(item => item !== undefined);
  }

  function getChangedStatus(statusText, id) {
    let dataList = statusText.split('').map(status => parseInt(status));
    dataList[parseInt(id) - 1] = dataList[parseInt(id) - 1] === 1 ? 0 : 1;

    return dataList.join('');
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack title="Notification Settings" isEnableSafeArea />
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{flex: 1}}
          bounces={false}>
          <SwtchesContainer
            title="Connection Requests"
            description="These are notifications for when someone sends you a connection
          request, or when a request you’ve sent is accepted."
            switchesList={[...SWITCHES_LIST]}
            onStatusSwitchesIdsList={getOnStatusIdsList(
              connectionRequestSwitchStatus,
            )}
            onChangeButtonStatus={id => {
              setconnectionRequestSwitchStatus(preStatus => {
                return getChangedStatus(preStatus, id);
              });
            }}
          />
          <SwtchesContainer
            title="Nuggets"
            description="Choose how you want to be notified when you receive a new nugget"
            switchesList={[...SWITCHES_LIST]}
            onStatusSwitchesIdsList={getOnStatusIdsList(nuggetsSwitchStatus)}
            onChangeButtonStatus={id => {
              setnuggetsSwitchStatus(preStatus => {
                return getChangedStatus(preStatus, id);
              });
            }}
          />
          <SwtchesContainer
            title="Events"
            description="Choose how you want to be notified when you receive a new event"
            switchesList={[...SWITCHES_LIST]}
            onStatusSwitchesIdsList={getOnStatusIdsList(eventsSwitchStatus)}
            onChangeButtonStatus={id => {
              seteventsSwitchStatus(preStatus => {
                return getChangedStatus(preStatus, id);
              });
            }}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default NotificationsSettings;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  settingItemContainer: {
    paddingVertical: 10,
  },
  switchesContainer: {
    flexDirection: 'row',
    marginTop: 13,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '32%',
  },
});
