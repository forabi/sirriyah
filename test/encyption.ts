import { generateKeyPair, deriveSharedKey, encrypt, decrypt } from 'client/crypto';
import expect from 'expect';
import times from 'lodash/times';
import bluebird from 'bluebird';

describe('Encryption', () => {
  const original: MessageWithStatus<'outgoing', 'unsent', 'decrypted'> = {
    localId: 'msg_1',
    date: new Date,
    status: 'unsent',
    text: 'Hello world!',
    to: 'alice',
    type: 'outgoing',
  };
  type User = {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
    derivedKey?: CryptoKey;
  }
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
    bob.derivedKey = await deriveSharedKey(bob.privateKey, alice.publicKey);
    alice.derivedKey = await deriveSharedKey(alice.privateKey, bob.publicKey);
  });

  it('Bob should be able to encrypt a message correctly using his derived key', async () => {
    encrypted = await encrypt(original, bob.derivedKey!);
    expect(encrypted.to).toEqual(original.to);
    expect(encrypted.localId).toEqual(original.localId);
    expect(encrypted.status).toEqual('unsent');
    expect(encrypted.payload).toBeAn(ArrayBuffer);
  });

  it('Alice should be able to decrypt the message correctly using her derived key', async () => {
    incomingMessage = {
      ...encrypted,
      type: 'incoming',
      status: 'unprocessed',
    };
    decrypted = await decrypt(incomingMessage, alice.derivedKey!);
    expect(decrypted.text).toMatch(original.text);
    expect(decrypted.date).toMatch(original.date);
  });

  it('Eve should not be able to decrypt the message using a key dervied from Bob\'s public key', async () => {
    eve.derivedKey = await deriveSharedKey(eve.privateKey, bob.publicKey);
    const [error, success] = times(2, () => expect.createSpy());
    await decrypt(incomingMessage, eve.derivedKey).then(success, error);
    expect(error).toHaveBeenCalled();
    expect(success).toNotHaveBeenCalled();
  });

});
