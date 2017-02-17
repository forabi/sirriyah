import { blobToArrayBuffer, arrayBufferToString } from 'client/utils';
import omit from 'lodash/omit';

const format = 'jwk';

const algorithms = {
  dh: {
    name: 'ECDH',
    namedCurve: 'P-256', // can be 'P-256', 'P-384', or 'P-521'
  },
  aes: {
    name: 'AES-GCM',
    length: 256, // can be  128, 192, or 256
  },
};

export const generateKeyPair = () => {
  return crypto.subtle.generateKey(
    algorithms.dh,
    true, // extractable
    ['deriveKey'],
  ) as Promise<CryptoKeyPair>;
};

export const deriveSharedKey = (privateKey: CryptoKey, publicKey: CryptoKey) => {
  return crypto.subtle.deriveKey(
    { 
      ...algorithms.dh,
      public: publicKey,
    },
    privateKey,
    algorithms.aes,
    true,
    ['encrypt', 'decrypt']
  );
};

export const exportKey = async (key: CryptoKey) => {
  const k = await crypto.subtle.exportKey(format, key);
  return omit(k, 'key_ops') as typeof k; // Workaround for Firefox
}

export const importKey = (key: JsonWebKey) => {
  return crypto.subtle.importKey(format, key, algorithms.dh, true, []);
}

export const encrypt: Encryptor = async (message, recipientPublicKey) => {
  const { to, localId, status, ...rest } = message;
  const [
    data,
    [sharedKey, publicKey],
  ] = await Promise.all([
    blobToArrayBuffer(new Blob([JSON.stringify(rest)])),
    generateKeyPair().then(own => {
      return Promise.all([
        deriveSharedKey(own.privateKey, recipientPublicKey),
        exportKey(own.publicKey),
      ]);
    }),
  ]);
  const iv = crypto.getRandomValues(new Uint32Array(12));
  const payload = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    sharedKey,
    data,
  );
  return {
    type: 'outgoing',
    status,
    localId, to,
    publicKey, iv, payload,
  };
}

export const decrypt: Decryptor = async (message, ownPrivateKey) => {
  const { payload, iv, publicKey, ...rest } = message;
  const data = payload;
  const importedPublicKey = await importKey(publicKey);
  const sharedKey = await deriveSharedKey(ownPrivateKey, importedPublicKey);
  const buffer = await crypto.subtle.decrypt(
    {
      name: algorithms.aes.name,
      iv,
    },
    sharedKey,
    data,
  );
  const decryptedPayload = JSON.parse(arrayBufferToString(buffer)) as Partial<LocalMessage<'incoming', 'decrypted'>>;
  return {
    ...decryptedPayload,
    ...rest,
    status: 'unread',
  }
}
