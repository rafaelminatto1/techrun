import React from 'react';
import {StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {store, persistor} from '@store/index';
import AppNavigator from '@navigation/AppNavigator';
import {toastConfig} from '@utils/toastConfig';
import {theme} from '@utils/theme';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <StatusBar
              barStyle='light-content'
              backgroundColor={theme.colors.primary}
              translucent={false}
            />
            <AppNavigator />
            <Toast config={toastConfig} />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
