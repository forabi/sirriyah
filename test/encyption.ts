import { generateKeyPair, encrypt, decrypt } from 'client/crypto';
import expect from 'expect';
import times from 'lodash/times';
import bluebird from 'bluebird';

describe('Encryption', () => {
  type User = {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
  };
  const original: MessageWithStatus<'outgoing', 'unsent', 'decrypted'> = {
    localId: 'msg_1',
    date: (new Date).toUTCString(),
    status: 'unsent',
    text: 'Hello world!',
    to: 'alice',
    type: 'outgoing',
  };
  let alice: User;
  let bob: User;
  let eve: User;
  let encrypted: LocalMessage<'outgoing', 'encrypted'>;
  let decrypted: LocalMessage<'incoming', 'decrypted'>;
  let incomingMessage: MessageWithStatus<'incoming', 'unprocessed', 'encrypted'>;

  it('should be able to generate a key pair', async () => {
    await bluebird.all(
      times(3, generateKeyPair)
    )
    .then(([pair1, pair2, pair3]) => {
      bob = { ...pair1 };
      alice = { ...pair2 };
      eve = { ...pair3 };
    });
  });

  it(
    'Bob should be able to encrypt a message to Alice correctly using his derived key',
    async () => {
      encrypted = await encrypt(original, alice.publicKey);
      expect(encrypted.to).toEqual(original.to);
      expect(encrypted).toNotIncludeKeys(['text', 'date']);
      expect(encrypted.localId).toEqual(original.localId);
      expect(encrypted.status).toEqual('unsent');
      expect(encrypted.payload).toBeAn(ArrayBuffer);
    },
  );

  it(
    'Alice should be able to decrypt the message from Bob correctly using her derived key',
    async () => {
      incomingMessage = {
        ...encrypted,
        type: 'incoming',
        status: 'unprocessed',
      };
      decrypted = await decrypt(incomingMessage, alice.privateKey);
      expect(decrypted.text).toMatch(original.text);
      expect(decrypted.date).toMatch(original.date);
    },
  );

  it(
    'Eve should not be able to decrypt Bob\'s message to Alice using a key ' +
    'dervied from Bob\'s public key and Eve\'s private key',
    async () => {
      const [error, success] = times(2, () => expect.createSpy());
      await decrypt(incomingMessage, eve.privateKey).then(success, error);
      expect(error).toHaveBeenCalled();
      expect(success).toNotHaveBeenCalled();
    },
  );

});
