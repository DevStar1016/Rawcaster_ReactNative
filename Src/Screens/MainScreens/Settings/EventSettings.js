import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import TitleDescriptionContainer from './TitleDescriptionContainer';
import SwtchesContainer from './SwtchesContainer';
import {useSettings} from '../../../Utilities/StoreData';
import DropDownPicker from '../../../Components/DropDownPicker';
import {EVENT_VISIBILITY_TYPE_LIST} from '../../../Utilities/Constants';
import {FONTS} from '../../../Utilities/Fonts';
import SubmitButton from '../../../Components/SubmitButton';

const EventSettings = () => {
  const settings = useSettings();
  const [selectedEventType, setselectedEventType] = useState(
    [...EVENT_VISIBILITY_TYPE_LIST].find(
      item => item.id === parseInt(settings.event_type),
    ),
  );
  const [audioSettingsList, setaudioSettingsList] = useState([
    {
      id: 1,
      name: 'Host',
      status: parseInt(settings.host_audio) === 1,
    },
    {
      id: 2,
      name: 'Guest',
      status: parseInt(settings.participant_audio) === 1,
    },
  ]);

  const [videoSettingsList, setvideoSettingsList] = useState([
    {
      id: 1,
      name: 'Host',
      status: parseInt(settings.host_video) === 1,
    },
    {
      id: 2,
      name: 'Guest',
      status: parseInt(settings.participant_video) === 1,
    },
  ]);

  function getEnabledSwitchesIds(list) {
    return list.filter(item => item.status).map(item => item.id);
  }

  function getChangedStatus(list, id) {
    return list.map(item => {
      if (item.id === id) {
        return {...item, status: !item.status};
      }
      return {...item};
    });
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack title="Event Settings" isEnableSafeArea />
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingVertical: 10}}
          style={{flex: 1}}
          bounces={false}>
          <TitleDescriptionContainer
            isEnableTitleCheckButton
            isChecked
            title="Waiting Room"
            description="Allow participants to be placed in a waiting room until the host
            admits them individually"
            titleStyle={{fontSize: 15}}
          />
          <TitleDescriptionContainer
            isEnableTitleCheckButton
            isChecked
            title="Join before host"
            description="Allow participants to join the meeting event before the host
            arrives. This will disable the waiting room feature."
            titleStyle={{fontSize: 15}}
          />

          <TitleDescriptionContainer
            isEnableTitleCheckButton
            isChecked
            title="Use sound to notify when a participant joins or exist"
            description="When enabled, host will hear a sound for each participant that
            joins the meeting."
            titleStyle={{fontSize: 15}}
          />

          <TitleDescriptionContainer
            isEnableTitleCheckButton
            isChecked
            title="Allow any participant to share their screen during meeting"
            description=" When enabled, any participant in the event can share their screen
            during meeting."
            titleStyle={{fontSize: 15}}
          />
          <SwtchesContainer
            title="Default Audio Settings"
            description="Start meeting with audio on"
            isSwitchesFlexStart={true}
            switchesList={audioSettingsList}
            onStatusSwitchesIdsList={getEnabledSwitchesIds(audioSettingsList)}
            onChangeButtonStatus={id => {
              setaudioSettingsList(preList => {
                return getChangedStatus(preList, id);
              });
            }}
          />
          <SwtchesContainer
            title="Default Video Settings"
            description="Start meeting with video on"
            isSwitchesFlexStart={true}
            switchesList={videoSettingsList}
            onStatusSwitchesIdsList={getEnabledSwitchesIds(videoSettingsList)}
            onChangeButtonStatus={id => {
              setvideoSettingsList(preList => {
                return getChangedStatus(preList, id);
              });
            }}
          />
          <DropDownPicker
            title="Event Type"
            value={selectedEventType}
            listTitle=""
            titleStyle={styles.titleText}
            borderColor={COLORS.borderColor}
            dataList={EVENT_VISIBILITY_TYPE_LIST}
            fieldName="name"
            onSelectItem={selectedItem => {
              setselectedEventType(selectedItem);
            }}
          />
          <TitleDescriptionContainer
            title="Melody"
            description="Choose or upload an audio sound or video or image that
          participants in waiting room will listen to while they wait for
          host to admit them to the meeting."
          />
          <View style={{alignItems: 'flex-start', paddingBottom: 10}}>
            <SubmitButton
              buttonText="UPLOAD MELODY"
              bgColor={COLORS.white}
              borderColor={COLORS.black}
              buttonTextStyle={{fontSize: 13, paddingVertical: 0}}
              paddingVertical={5}
              marginTop={0}
              paddingHorizontal={30}
              borderWidth={1}
              textColor={COLORS.black}
              onPress={() => {}}
            />
          </View>
          <TitleDescriptionContainer
            title="Meeting Header Image"
            description="Choose or upload an image that depicts this event. Leave blank to
            use Rawcaster default."
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default EventSettings;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  titleText: {
    fontFamily: FONTS.DMSans.bold,
  },
});
