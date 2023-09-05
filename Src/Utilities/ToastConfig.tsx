import {TouchableOpacity, View} from 'react-native';
import StyledText from '../Components/StyledText';
import SVGIcon from '../Components/SVGIcon';
import BOX_SHADOW from './BoxShadow';
import {COLORS} from './Colors';
import {FONTS} from './Fonts';

export type ToastTypes = 'normal' | 'success' | 'failed';
export type ToastActionButtonProp = {
  buttonName: string;
  onPress?: () => void;
};

type TomatoToastOptions = {
  toastType: ToastTypes;
  normalActionButton?: ToastActionButtonProp;
};

type CustomToastProps = {
  text: string;
  description?: string;
  toastType: ToastTypes;
  normalActionButton?: ToastActionButtonProp;
};

interface TomatoToastProps {
  text1: string;
  text2?: string;
  props: TomatoToastOptions;
}

const CustomToast = ({
  text = '',
  description = '',
  toastType,
  normalActionButton,
}: CustomToastProps) => {
  return (
    <View style={{padding: 10, justifyContent: 'center', alignItems: 'center'}}>
      <View
        style={[
          {
            borderRadius: 13,
            backgroundColor:
              toastType === 'normal' ? COLORS.transparent : COLORS.white,
            flexDirection: 'row',
            alignItems: toastType === 'normal' ? 'center' : 'flex-start',
            justifyContent: 'center',
            paddingHorizontal: toastType === 'normal' ? 5 : 15,
            paddingVertical: 5,
          },
          toastType !== 'normal' && {...BOX_SHADOW},
        ]}>
        {(toastType === 'success' || toastType === 'failed') && (
          <View
            style={{
              backgroundColor:
                toastType === 'success' ? COLORS.green : COLORS.red,
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
              icon={toastType === 'success' ? 'tick' : 'close_white'}
              height={toastType === 'success' ? 20 : 10}
              width={toastType === 'success' ? 20 : 10}
            />
          </View>
        )}
        {toastType === 'normal' ? (
          <>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <View
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 6,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <StyledText
                    style={{
                      fontFamily: FONTS.DMSans.medium,
                      paddingVertical: description ? 0 : 5,
                    }}>
                    {text}
                  </StyledText>

                  {normalActionButton ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{marginLeft: 10}}
                      onPress={() => {
                        if (normalActionButton.onPress) {
                          normalActionButton.onPress();
                        }
                      }}>
                      <StyledText
                        style={{
                          color: COLORS.secondary,
                          fontFamily: FONTS.DMSans.medium,
                        }}>
                        {normalActionButton.buttonName}
                      </StyledText>
                    </TouchableOpacity>
                  ) : null}
                </View>
                {description ? (
                  <StyledText style={{paddingVertical: 5}}>
                    {description}
                  </StyledText>
                ) : null}
              </View>
            </View>
          </>
        ) : (
          <>
            <StyledText
              style={{fontFamily: FONTS.DMSans.medium, paddingVertical: 5}}>
              {text}
            </StyledText>
          </>
        )}
      </View>
    </View>
  );
};

export default {
  tomatoToast: ({text1, text2, props}: TomatoToastProps) => (
    <CustomToast
      text={text1}
      description={text2}
      toastType={props.toastType}
      normalActionButton={props.normalActionButton}
    />
  ),
};
