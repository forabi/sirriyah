export const encryptionParams: EcKeyGenParams = {
  name: 'ECDH',
  namedCurve: 'P-256', // can be 'P-256', 'P-384', or 'P-521'
};

export const encryptionAlgorithm = 'AES-GCM';

export const keyUsages = ['encrypt', 'decrypt'];
