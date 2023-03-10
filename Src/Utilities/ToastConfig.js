import {View} from 'react-native';
import StyledText from '../Components/StyledText';
import SVGIcon from '../Components/SVGIcon';
import BOX_SHADOW from './BoxShadow';
import {COLORS} from './Colors';
import {FONTS} from './Fonts';

const CustomToast = ({text = '', isSuccess}) => {
  return (
    <View style={{padding: 10, justifyContent: 'center', alignItems: 'center'}}>
      <View
        style={{
          borderRadius: 15,
          backgroundColor: COLORS.white,
          flexDirection: 'row',
          justifyContent: 'center',
          paddingHorizontal: 15,
          paddingVertical: 8,
          ...BOX_SHADOW,
        }}>
        <View
          style={{
            backgroundColor: isSuccess ? COLORS.green : COLORS.red,
            height: 20,
            width: 20,
            borderRadius: 10,
            alignItems: 'center',
            marginRight: 5,
            marginTop: 5,
            padding: 5,
            justifyContent: 'center',
          }}>
          <SVGIcon
            icon={isSuccess ? 'tick' : 'close_white'}
            color={COLORS.white}
            height={isSuccess ? 20 : 10}
            width={isSuccess ? 20 : 10}
          />
        </View>

        <StyledText
          style={{fontFamily: FONTS.DMSans.medium, paddingVertical: 5}}>
          {text}
        </StyledText>
      </View>
    </View>
  );
};

export default ToastConfig = {
  tomatoToast: ({text1, props}) => (
    <CustomToast text={text1} isSuccess={props.isSuccess} />
  ),
};
