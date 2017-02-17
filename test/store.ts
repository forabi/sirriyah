import createConfiguredStore from 'client/store';
import { getMessages, getPrivateKey, getPublicKey } from 'client/store/reducer';
import { keyPairGenereated, sendMessage, messageReceived } from 'client/actions';
import { generateKeyPair, encrypt, decrypt } from 'client/crypto';
import { Store } from 'redux';
import expect from 'expect';
import { delay } from './helpers';

describe('Store', () => {
  let store: Store<StoreState>;
  before(() => {
    store = createConfiguredStore();
  });

  it('should work', async () => {
    const pair = await generateKeyPair();
    const { publicKey } = pair;
    const bob = { ...pair };
    store.dispatch(keyPairGenereated(pair));
    const outgoing: MessageWithStatus<'outgoing', 'unsent', 'decrypted'> = {
      date: (new Date).toUTCString(),
      localId: 'msg_1',
      status: 'unsent',
      text: 'I am Bob!',
      to: 'alice',
      type: 'outgoing',
    };
    store.dispatch(sendMessage({ message: outgoing, publicKey }));
    let state = store.getState();
    expect(getPrivateKey(state)).toBeTruthy();
    expect(getPublicKey(state)).toBeTruthy();
    let messagesById = getMessages(state);
    expect(messagesById).toIncludeKey(outgoing.localId);
    let storedMessage = messagesById[outgoing.localId];
    expect(storedMessage).toIncludeKeys(['text', 'status']);
    expect(storedMessage.status).toBe('encrypting');
    const originalFromAlice: MessageWithStatus<'outgoing', 'unsent', 'decrypted'> = {
      date: (new Date).toUTCString(),
      to: 'bob',
      localId: 'msg_2',
      status: 'unsent',
      text: 'I am Alice!',
      type: 'outgoing',
    };
    const encryptedFromAlice: MessageWithStatus<'incoming', 'unprocessed', 'encrypted'>  = {
      ...(await encrypt(originalFromAlice, bob.publicKey)),
      type: 'incoming',
      status: 'unprocessed',
    };
    store.dispatch(messageReceived(encryptedFromAlice));
    state = store.getState();
    messagesById = getMessages(state);
    let storedFromAlice = messagesById[encryptedFromAlice.localId];
    expect(storedFromAlice).toBeTruthy();
    expect(storedFromAlice.status).toBe('decrypting');
    expect(storedFromAlice).toNotIncludeKeys(['text', 'date']);
    await delay(50);
    state = store.getState();
    messagesById = getMessages(state);
    storedFromAlice = messagesById[encryptedFromAlice.localId];
    expect(storedFromAlice.status).toBe('unread');
    expect(storedFromAlice).toIncludeKeys(['text', 'date']);
  });
});