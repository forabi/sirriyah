import {
  createStore,
  Store,
  compose,
  applyMiddleware,
} from 'redux';

import reducer from './reducer';

import cryptoMiddleware from './middleware/encryption';

const middleware = [
  cryptoMiddleware,
];

function addDevTools() {
  if (process.env.NODE_ENV !== 'production' && !!window.devToolsExtension) {
    return window.devToolsExtension();
  }
  return (f: any) => f;
}

const createConfiguredStore = () => {
  const store = createStore(
    reducer,
    compose(
      addDevTools(),
      applyMiddleware(...middleware),
    ),
  );

  if (module.hot) {
    module.hot.accept('./reducer', () => {
      const nextReducer = require('./reducer').default;
      store.replaceReducer(nextReducer);
    });
  }
  return store as Store<StoreState>;
};

export default createConfiguredStore;
