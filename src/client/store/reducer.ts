import { combineReducers } from 'redux';

import { handleActions } from './utils';

const reducerMap: ReducerMap = {
  userId: handleActions<'userId'>({
    CREATE_USER_ACCOUNT_SUCCEEDED: (_, { payload: { userId } }) => {
      return userId;
    },
  }, null),
  token: handleActions<'token'>({
    CREATE_USER_ACCOUNT_SUCCEEDED: (_, { payload: { token } }) => {
      return token;
    },
  }, null),
  userProfile: handleActions<'userProfile'>({
    UPDATE_USER_DATA_REQUESTED: (state, { payload }) => {
      return {
        ...state,
        ...payload,
      };
    },
  }, null),
  publicKey: handleActions<'publicKey'>({
    GENERATE_KEYS_SUCCEEDED: (_, { payload: { publicKey } }) => publicKey,
  }, null),
  privateKey: handleActions<'privateKey'>({
    GENERATE_KEYS_SUCCEEDED: (_, { payload: { privateKey } }) => privateKey,
  }, null),
  inMemoryMessages: handleActions<'inMemoryMessages'>({
    MESSAGE_RECEIVED: (state, { payload }) => {
      return {
        ...state,
        [payload.localId]: payload,
      };
    },
    SEND_MESSAGE_REQUESTED: (state, { payload }) => {
      return {
        ...state,
        [payload.localId]: payload,
      };
    },
    MESSAGE_DETAILS_CHANGED: (state, { payload }) => {
      return {
        ...state,
        [payload.localId]: {
          ...state[payload.localId],
          ...payload,
        },
      };
    },
  }, { }),
}

const reducer = combineReducers<StoreState>(reducerMap);

export const getPrivateKey = (state: StoreState) => state.privateKey;

export default reducer;
