import uniqueId from 'lodash/uniqueId';

export const createMessageId = () => uniqueId('msg_');

export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = e => reject(e.error);
    reader.readAsArrayBuffer(blob);
  });
}

export function blobToString(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = e => reject(e.error);
    reader.readAsBinaryString(blob);
  });
}

export function arrayBufferToString(buffer: ArrayBuffer, encoding = 'utf-8'): string {
  const view = new DataView(buffer);
  const decoder = new TextDecoder(encoding);
  return decoder.decode(view);
}