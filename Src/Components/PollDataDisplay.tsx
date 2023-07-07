import {View} from 'react-native';
import React, {useState} from 'react';
import AnimatedBgFillContainer from './AnimatedBgFillContainer';
import SubmitButton from './SubmitButton';
import StyledText from './StyledText';
import {COLORS} from '../Utilities/Colors';
import {useToken, useUserData} from '../Utilities/StoreData';
import {useDispatch} from 'react-redux';
import {
  setIsOpenLoginAlert,
  setIsOpenVerifyPopup,
} from '../Store/Slices/UtilitySlice';
import {getSlicedText} from '../Utilities/Methods';
import moment from 'moment';

type PollOptionsItemProp = {
  option_id: number;
  option_name: string;
  option_percentage: string;
};
type PollVotedDataProp = {
  isVoted: boolean;
  votedOptionID: any;
};

type Props = {
  isVoted: boolean;
  pollOptions: any[];
  totalVotes: number;
  createdDate: string;
  onVotePoll?: (id: any) => void;
  pollDuration: string;
  nameMaxCharactersCount?: number;
  onLayoutHeight?: (val: number) => void;
};

const PollDataDisplay = ({
  isVoted,
  pollOptions = [],
  totalVotes = 0,
  createdDate,
  onVotePoll,
  nameMaxCharactersCount,
  pollDuration,
  onLayoutHeight,
}: Props) => {
  const token = useToken();
  const user = useUserData();
  const dispatch = useDispatch();
  const [pollVotedData, setpollVotedData] = useState<PollVotedDataProp>({
    isVoted: isVoted,
    votedOptionID: null,
  });

  const getRemainingTimeOfPoll = () => {
    const [daysval, hoursval, minutesval] = pollDuration.split(':');
    const utcString = moment
      .utc(createdDate, 'YYYY-MM-DD HH:mm:ss')
      .add(daysval, 'days')
      .add(hoursval, 'hours')
      .add(minutesval, 'minutes');

    const now = moment().utc();
    /*@ts-ignore*/
    let timeDiff = utcString - now;
    let dur = moment.duration(timeDiff);
    const remainingDays = dur.days();
    const remainingHours = dur.hours();
    const remainingMinutes = dur.minutes();
    let output = '';
    if (remainingDays > 0) {
      output += `${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
      if (remainingMinutes > 0 && remainingHours === 0) {
        output += ' ';
      }
    }

    if (remainingHours > 0) {
      if (remainingDays > 0) {
        output += ' ';
      }
      output += `${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
      if (remainingMinutes > 0) {
        output += ' ';
      }
    }

    if (remainingMinutes > 0) {
      output += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} `;
    }
    if (output !== '') {
      output += 'left';
    }
    return output ? output : null;
  };

  const getTotalVotes = () => {
    return pollVotedData.votedOptionID ? totalVotes + 1 : totalVotes;
  };

  const getPollOptions = () => {
    let tempPollOptions = [...pollOptions].map(item => {
      let votes = item.votes;
      if (pollVotedData.votedOptionID === item.option_id) {
        votes = parseInt(item.votes) + 1;
      }
      return {
        ...item,
        votes,
        option_percentage:
          parseInt(votes) === 0
            ? '0.00'
            : parseFloat(
                ((parseInt(votes) / getTotalVotes()) * 100).toString(),
              ).toFixed(2),
      };
    });
    return [...tempPollOptions];
  };

  const isLogin = () => {
    if (token) {
      return true;
    }
    dispatch(setIsOpenLoginAlert(true));
    return false;
  };

  const isVerified = () => {
    if (user && user.acc_verify_status === 1) {
      return true;
    }
    dispatch(setIsOpenVerifyPopup(true));
    return false;
  };

  return (
    <View
      style={{paddingRight: 20}}
      onLayout={e => {
        if (e.nativeEvent.layout.height && onLayoutHeight) {
          onLayoutHeight(e.nativeEvent.layout.height);
        }
      }}>
      {getPollOptions().map((item: PollOptionsItemProp) => {
        return pollVotedData.isVoted || !getRemainingTimeOfPoll() ? (
          <AnimatedBgFillContainer
            key={item.option_id.toString()}
            percentage={item.option_percentage}
            name={
              nameMaxCharactersCount
                ? getSlicedText(item.option_name, nameMaxCharactersCount)
                : item.option_name
            }
            mainContainerStyle={{marginTop: 10}}
          />
        ) : (
          <SubmitButton
            key={item.option_id.toString()}
            paddingVertical={5}
            buttonText={item.option_name}
            buttonTextStyle={{
              width: '100%',
              textAlign: 'center',
            }}
            marginTop={10}
            isDisabled={pollVotedData.isVoted}
            onPress={() => {
              if (isLogin() && isVerified()) {
                setpollVotedData({
                  isVoted: true,
                  votedOptionID: item.option_id,
                });
                if (onVotePoll) {
                  onVotePoll(item.option_id);
                }
              }
            }}
          />
        );
      })}

      <StyledText style={{color: COLORS.white, paddingTop: 10}}>
        {`${getTotalVotes()} votes ${
          getRemainingTimeOfPoll() ? `. ${getRemainingTimeOfPoll()}` : ``
        }   `}
      </StyledText>
    </View>
  );
};

export default PollDataDisplay;
