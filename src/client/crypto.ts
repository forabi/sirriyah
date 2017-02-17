import { blobToArrayBuffer, arrayBufferToString } from 'client/utils';

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
  return window.crypto.subtle.deriveKey(
    { 
      ...algorithms.dh,
      public: publicKey,
    },
    privateKey,
    algorithms.aes,
    true,
    ['encrypt', 'decrypt']
  );
}

export const encrypt: Encryptor = async (message, sharedKey) => {
  const { to, ...rest } = message;
  const iv = crypto.getRandomValues(new Uint32Array(12));
  const data = await blobToArrayBuffer(new Blob([JSON.stringify(rest)]));
  const payload = await crypto.subtle.encrypt({
    name: 'AES-GCM',
    iv,
  }, sharedKey, data);
  return {
    ...rest,
    iv,
    to,
    payload,
  }
}

export const decrypt: Decryptor = async (message, sharedKey) => {
  const { payload, iv, ...rest } = message;
  const data = payload;
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
