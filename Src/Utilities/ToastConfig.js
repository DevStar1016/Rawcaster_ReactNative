import {Text, View} from 'react-native';
import {BaseToast, ErrorToast} from 'react-native-toast-message';
import {COLORS} from './Colors';
import {FONTS} from './Fonts';

const CustomToast = ({props = {}, textColor = COLORS.green}) => {
  return (
    <BaseToast
      {...props}
      style={{borderLeftWidth: 0}}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      touchableContainerProps={{
        style: {
          paddingVertical: 10,
          backgroundColor: COLORS.white,
          borderRadius: 15,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,

          elevation: 5,
        },
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '500',
        color: textColor,
        fontFamily: FONTS.DMSans.regular,
      }}
    />
  );
};

export default ToastConfig = {
  success: props => <CustomToast props={props} textColor={COLORS.green} />,
  error: props => <CustomToast props={props} textColor={COLORS.red} />,
  /*
      Or create a completely new type - `tomatoToast`,
      building the layout from scratch.
  
      I can consume any custom `props` I want.
      They will be passed when calling the `show` method (see below)
    */
  //   tomatoToast: ({text1, props}) => (
  //     <View style={{height: 60, width: '100%', backgroundColor: 'tomato'}}>
  //       <Text>{text1}</Text>
  //       <Text>{props.uuid}</Text>
  //     </View>
  //   ),
};
