import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import {Provider} from 'react-redux';
import App from './App';
import {name as appName} from './app.json';
import {store} from './Src/Store/StoreConfig';
import ToastContainer from 'react-native-toast-message';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {MenuProvider} from 'react-native-popup-menu';
import ToastConfig from './Src/Utilities/ToastConfig';

const HOC = () => {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{flex: 1}}>
        <MenuProvider>
          <BottomSheetModalProvider>
            <App />
          </BottomSheetModalProvider>
        </MenuProvider>
        <ToastContainer
          visibilityTime={3000}
          config={ToastConfig}
          topOffset={40}
          bottomOffset={60}
        />
      </GestureHandlerRootView>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => HOC);
