// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';
import App from './components/App/connected';
import createConfiguredStore from './store';

const store = createConfiguredStore();

const ReduxApp = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export const hotReloadable = () => (
  <AppContainer>
    <ReduxApp />
  </AppContainer>
);

export default hotReloadable;
