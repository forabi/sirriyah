import { combineReducers } from 'redux';

import { handleActions } from './utils';

const reducerMap: ReducerMap = {
  userId: handleActions<'userId'>({
    CREATE_USER_ACCOUNT_SUCCEEDED: (state, { payload: { userId } }) => {
      return userId;
    },
  }, null),
  token: handleActions<'token'>({
    CREATE_USER_ACCOUNT_SUCCEEDED: (state, { payload: { token } }) => {
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

  }, null),
  inMemoryMessages: handleActions<'inMemoryMessages'>({

  }, {
    byId: {

    },
  }),
}

const reducer = combineReducers<StoreState>(reducerMap);

export default reducer;
