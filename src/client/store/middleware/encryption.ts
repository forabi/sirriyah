import { Store, Dispatch, Middleware } from 'redux';

import {
  updateMessage,
  sendFailed,
  sendEncryptedMessage,
  keyPairGenereated,
  keyPairGenereationFailed,
} from '../../actions';

import { getPrivateKey } from '../reducer';

import { isActionOfType } from '../utils';

import { encrypt, decrypt, generateKeyPair } from 'client/crypto';

const middleware: Middleware = ({ getState }: Store<StoreState>) =>
  (next: Dispatch<GenericAction>) => async (action: GenericAction) => {
    if (isActionOfType(action, 'GENERATE_KEYS_REQUESTED')) {
      try {
        const { publicKey, privateKey } = await generateKeyPair();
        next(keyPairGenereated({ privateKey, publicKey }));
      } catch (error) {
        next(keyPairGenereationFailed(error));
      }
    } else if (isActionOfType(action, 'SEND_MESSAGE_REQUESTED')) {
      next(action);
      const { message, publicKey } = action.payload;
      const { localId } = message;
      next(updateMessage({ localId, status: 'encrypting' }));
      try {
        const encryptedMessage = await encrypt(message, publicKey);
        next(sendEncryptedMessage(encryptedMessage));
      } catch (error) {
        next(sendFailed({ localId, message: error.message }));
      }
    } else if (isActionOfType(action, 'MESSAGE_RECEIVED')) {
      const { payload: message } = action;
      const { localId } = message;
      next(updateMessage({ localId, status: 'decrypting' }));
      const state = getState();
      try {
        const privateKey = getPrivateKey(state);
        if (privateKey !== null) {
          const decryptedMessage = await decrypt(message, privateKey);
          next(updateMessage({ ...decryptedMessage, localId }));
        } else {
          throw new TypeError('Missing private key');
        }
      } catch (error) {
        next(sendFailed({ localId, message: error.message }));
      }
    } else {
      next(action);
    }
  };

export default middleware;
