import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {CameraScreen} from 'react-native-camera-kit';
import {WINDOW_WIDTH} from '@gorhom/bottom-sheet';
import StyledText from '../Components/StyledText';
import {COLORS} from '../Utilities/Colors';

const QRCodeScanner = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    checkAndSetPermission();
  }, []);

  const checkAndSetPermission = async () => {
    const status = await Camera.requestCameraPermission();
    setHasPermission(status === 'authorized');
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <StyledText style={{color: COLORS.white, fontSize: 16}}>
        Scan here
      </StyledText>
      <View
        style={{
          height: WINDOW_WIDTH / 1.2,
          width: WINDOW_WIDTH / 1.2,
          overflow: 'hidden',
          backgroundColor: 'red',
        }}>
        <CameraScreen
          onReadCode={scannerRes => {
            console.log(scannerRes, 'RESPONSE SCAN');
            // dispatch(handleScannerResponse('test'));
            // navigation.goBack();
          }}
          scanBarcode={true}
          hideControls={false}
          showCapturedImageCount={false}
        />
      </View>
    </View>
    // <CameraScreen
    //   actions={{rightButtonText: 'Done', leftButtonText: 'Cancel'}}
    //   onBottomButtonPressed={event => {
    //     console.log(event, 'EVENTSSSS');
    //   }}
    //   scanBarcode={true}
    //   onReadCode={event => {
    //     console.log(event, 'SCANNED');
    //   }}
    //   // flashImages={{
    //   //   // optional, images for flash state
    //   //   on: require('path/to/image'),
    //   //   off: require('path/to/image'),
    //   //   auto: require('path/to/image'),
    //   // }}
    //   // cameraFlipImage={require('path/to/image')} // optional, image for flipping camera button
    //   // captureButtonImage={require('path/to/image')} // optional, image capture button
    //   // torchOnImage={require('path/to/image')} // optional, image for toggling on flash light
    //   // torchOffImage={require('path/to/image')} // optional, image for toggling off flash light
    //   hideControls={false} // (default false) optional, hides camera controls
    //   showCapturedImageCount={false} // (default false) optional, show count for photos taken during that capture session
    // />
  );
};

export default QRCodeScanner;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  barcodeTextURL: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});
