import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import MeetingActionsContainer from './MeetingActionsContainer';
import {MeetingError, Meeting} from '../../Native/Bridges/ChimeMeetingBridge';
import MeetingActionsListener, {DataMessage} from './MeetingActionsListener';
import MeetingVideoView from './MeetingVideoView';

type Props = {
  meetingId: string;
  handleEndMeeting: () => void;
  selfAttendeeId: string;
};

type DataProps = {
  attendees: any[];
  videoTiles: any[];
  mutedAttendee: any[];
  selfVideoEnabled: boolean;
  meetingTitle: string;
  screenShareTile: any;
};

var isMount = true;
const MeetingUI = ({meetingId, handleEndMeeting, selfAttendeeId}: Props) => {
  const [data, setdata] = useState<DataProps>({
    attendees: [],
    videoTiles: [],
    mutedAttendee: [],
    selfVideoEnabled: false,
    meetingTitle: '',
    screenShareTile: null,
  });

  const onJoinAttendee = (
    attendeeId: string | number,
    attendeeName: string,
  ) => {
    if (isMount) {
      setdata(pre => ({
        ...pre,
        attendees: pre.attendees.concat([attendeeId]),
      }));
    }
  };

  const onLeaveAttendee = (attendeeId: string | number) => {
    if (isMount) {
      setdata(pre => ({
        ...pre,
        attendees: pre.attendees.filter(
          attendeeToCompare => attendeeId != attendeeToCompare,
        ),
      }));
    }
  };

  const onMuteAttendee = (attendeeId: string | number) => {
    if (isMount) {
      setdata(pre => ({
        ...pre,
        mutedAttendee: pre.mutedAttendee.concat([attendeeId]),
      }));
    }
  };

  const onUnMuteAttendee = (attendeeId: string | number) => {
    if (isMount) {
      setdata(pre => ({
        ...pre,
        mutedAttendee: pre.mutedAttendee.filter(
          attendeeToCompare => attendeeId != attendeeToCompare,
        ),
      }));
    }
  };

  const onAddVideoTile = (tileId: string | number, isLocal: boolean) => {
    if (isMount) {
      setdata(pre => {
        let tempVideoTiles = [...pre.videoTiles];
        if (!tempVideoTiles.includes(tileId)) {
          if (isLocal) {
            tempVideoTiles = [tileId, ...tempVideoTiles];
          } else {
            tempVideoTiles = [...tempVideoTiles, tileId];
          }
        }
        return {
          ...pre,
          videoTiles: [...tempVideoTiles],
          selfVideoEnabled: isLocal ? true : pre.selfVideoEnabled,
        };
      });
    }
  };

  const onRemoveVideoTile = (tileId: string | number, isLocal: boolean) => {
    if (isMount) {
      setdata(pre => ({
        ...pre,
        videoTiles: pre.videoTiles.filter(
          tileIdToCompare => tileIdToCompare != tileId,
        ),
        selfVideoEnabled: isLocal ? false : pre.selfVideoEnabled,
      }));
    }
  };

  const onEnableScreenShare = (tileId: string | number) => {
    if (isMount) {
      setdata(pre => ({
        ...pre,
        screenShareTile: tileId,
      }));
    }
  };

  const onRemoveScreenShare = () => {
    if (isMount) {
      setdata(pre => ({
        ...pre,
        screenShareTile: null,
      }));
    }
  };

  const onReceiveDataMessage = (dataMessage: DataMessage) => {
    const str = `Received Data message (topic: ${dataMessage.topic}) ${dataMessage.data} from ${dataMessage.senderAttendeeId}:${dataMessage.senderExternalUserId} at ${dataMessage.timestampMs} throttled: ${dataMessage.throttled}`;
    console.log(str);
    Meeting.sendDataMessage(dataMessage.topic, str, 1000);
  };

  const onError = (errorType: string) => {
    switch (errorType) {
      case MeetingError.OnMaximumConcurrentVideoReached:
        console.log(
          'Failed to enable video',
          'maximum number of concurrent videos reached!',
        );
        // Alert.alert(
        //   "Failed to enable video",
        //   "maximum number of concurrent videos reached!"
        // );
        break;
      default:
        console.log('Error', errorType);
        break;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <MeetingActionsListener
        onJoinAttendee={onJoinAttendee}
        onLeaveAttendee={onLeaveAttendee}
        onMuteAttendee={onMuteAttendee}
        onUnMuteAttendee={onUnMuteAttendee}
        onAddVideoTile={onAddVideoTile}
        onRemoveVideoTile={onRemoveVideoTile}
        onEnableScreenShare={onEnableScreenShare}
        onRemoveScreenShare={onRemoveScreenShare}
        onReceiveDataMessage={onReceiveDataMessage}
        onError={onError}
      />
      <View style={styles.videoTilesContainer}>
        {data.videoTiles.map(item => {
          return <MeetingVideoView tileId={item} />;
        })}
      </View>

      <MeetingActionsContainer />
    </View>
  );
};

export default MeetingUI;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoTilesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 5,
  },
});
