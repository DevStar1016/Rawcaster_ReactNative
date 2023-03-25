import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import {ImageVideoPicker} from '../../../Utilities/ImageVideoPicker';
import {useSettings} from '../../../Utilities/StoreData';
import SVGIcon from '../../../Components/SVGIcon';

type ImageItem = {
  uri: string;
  name: string;
  type: string;
};

type Props = {
  selectedImage?: ImageItem;
  setselectedImage: (item: any) => void;
  mainContainerStyle?: StyleProp<ViewStyle>;
};

const EventImagePicker = ({
  selectedImage,
  setselectedImage,
  mainContainerStyle,
}: Props) => {
  const settings = useSettings();

  const handleImagePicker = () => {
    ImageVideoPicker({
      mediaType: 'photo',
      height: 200,
      width: 400,
    })
      .then(res => {
        setselectedImage(res);
      })
      .catch(e => {});
  };

  const getImage = () => {
    if (selectedImage) {
      return selectedImage.uri;
    } else if (settings?.meeting_header_image) {
      return settings.meeting_header_image;
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={[
        styles.mainContainer,
        {borderWidth: getImage() ? 0 : 1, borderRadius: getImage() ? 0 : 10},
        mainContainerStyle,
      ]}
      activeOpacity={0.7}
      onPress={handleImagePicker}>
      {getImage() ? (
        <Image
          source={{
            uri: getImage(),
          }}
          style={styles.imageContainer}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.imagePlaceHolderContainer}>
          <SVGIcon
            icon="image_placeholder"
            height={50}
            width={50}
            marginRight={15}
          />
          <View style={styles.imagePlaceHolderTextContainer}>
            <StyledText
              style={{
                color: COLORS.placeHolderColor,
                fontSize: 16,
              }}>
              Upload Event Banner
            </StyledText>
            <StyledText
              style={{
                color: COLORS.placeHolderColor,
                paddingTop: 2,
                fontSize: 10,
              }}>
              Recommended size 134x123
            </StyledText>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default EventImagePicker;

const styles = StyleSheet.create({
  mainContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imageContainer: {
    height: '100%',
    width: '100%',
  },
  imagePlaceHolderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePlaceHolderTextContainer: {
    alignItems: 'center',
  },
  // image_placeholder
});
