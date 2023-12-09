import {Modal, View} from 'react-native';
import React, {useState} from 'react';
import WebView from 'react-native-webview';
import Loader from '../Components/Loader';
import {COLORS} from '../Utilities/Colors';
import HeaderWithBack from '../Components/HeaderWithBack';

const WebUrlLoaderModal = ({url, title, setModal}) => {
  const [isLoading, setisLoading] = useState(false);

  return (
    <View style={{flex: 1}}>
      <HeaderWithBack title={title} isModal setModal={setModal} />
      <WebView
        style={{flex: 1}}
        originWhitelist={['*']}
        onLoadStart={() => {
          setisLoading(true);
        }}
        onError={e => {}}
        onLoadEnd={() => {
          setisLoading(false);
        }}
        source={{uri: url}}
        showsVerticalScrollIndicator={false}
      />
      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </View>
  );
};

export default WebUrlLoaderModal;
