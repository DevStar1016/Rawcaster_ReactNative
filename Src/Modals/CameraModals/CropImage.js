import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useRef} from 'react';
import {CropView} from 'react-native-image-crop-tools';
import {getUrlWithFilePrefix} from '../../Utilities/Methods';
import {DIMENSIONS} from '../../Utilities/Constants';
import SVGIcon from '../../Components/SVGIcon';
import {useInsets} from '../../Utilities/StoreData';
import StyledText from '../../Components/StyledText';

const CropImage = ({setModal, uri, onCropImage}) => {
  const cropViewRef = useRef(null);
  const insets = useInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#000000',
        paddingTop: insets.top ? insets.top : StatusBar.currentHeight,
        paddingBottom: insets.bottom ? insets.bottom : 20,
      }}>
      <CropView
        sourceUrl={getUrlWithFilePrefix(uri)}
        style={styles.cropView}
        ref={cropViewRef}
        onImageCrop={res => {
          setModal(false);
          onCropImage(res);
        }}
        keepAspectRatio={false}
        aspectRatio={{
          width: DIMENSIONS.screen.width,
          height: DIMENSIONS.screen.height,
        }}
      />
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => {
            setModal(false);
          }}>
          <StyledText style={styles.buttonText}>CANCEL</StyledText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            cropViewRef.current.rotateImage(false);
          }}>
          <SVGIcon icon="rotate" height={30} width={30} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => {
            cropViewRef.current.saveImage(true, 90);
          }}>
          <StyledText style={styles.buttonText}>DONE</StyledText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CropImage;

const styles = StyleSheet.create({
  cropView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bottomContainer: {
    backgroundColor: '#000000',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  buttonText: {
    fontSize: 14,
    color: '#ffffff',
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: '#ffffff',
  },
});
