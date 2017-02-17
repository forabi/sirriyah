import { createActionCreator } from './store/utils';

export const updateMessage = createActionCreator('MESSAGE_DETAILS_CHANGED');
export const sendFailed = createActionCreator('SEND_MESSAGE_FAILED');
export const sendMessage = createActionCreator('SEND_MESSAGE_REQUESTED');
export const sendEncryptedMessage = createActionCreator('SEND_ENCRYPTED_MESSAGE_REQUESTED');
export const keyPairGenereated = createActionCreator('GENERATE_KEYS_SUCCEEDED');
export const keyPairGenereationFailed = createActionCreator('GENERATE_KEYS_FAILED');
export const messageReceived = createActionCreator('MESSAGE_RECEIVED');
