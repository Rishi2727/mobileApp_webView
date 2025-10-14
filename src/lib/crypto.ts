import * as CryptoJS from 'crypto-js';

// Helper function to convert string to hex
const stringToHex = (str: string): string => {
  return Array.from(str)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
};

// Helper function to pad or truncate key/IV to required length
const padOrTruncate = (str: string, length: number): string => {
  if (str.length > length) {
    return str.substring(0, length);
  }
  return str.padEnd(length, '0');
};

export const encryptText = async (plainText: string, keyHex: string, ivHex: string): Promise<string> => {
  const key = CryptoJS.enc.Hex.parse(keyHex);
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  return encrypted.toString();
};

export const decryptText = async (cipherBase64: string, keyHex: string, ivHex: string): Promise<string> => {
  const key = CryptoJS.enc.Hex.parse(keyHex);
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  
  const decrypted = CryptoJS.AES.decrypt(cipherBase64, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  return decrypted.toString(CryptoJS.enc.Utf8);
};

// Convenience functions that work with string keys/IVs
export const encryptWithStringKey = async (plainText: string, keyString: string, ivString: string): Promise<string> => {
  // Convert strings to hex and ensure proper lengths (32 bytes = 64 hex chars for key, 16 bytes = 32 hex chars for IV)
  const keyHex = padOrTruncate(stringToHex(keyString), 64);
  const ivHex = padOrTruncate(stringToHex(ivString), 32);
  
  return encryptText(plainText, keyHex, ivHex);
};

export const decryptWithStringKey = async (cipherBase64: string, keyString: string, ivString: string): Promise<string> => {
  // Convert strings to hex and ensure proper lengths
  const keyHex = padOrTruncate(stringToHex(keyString), 64);
  const ivHex = padOrTruncate(stringToHex(ivString), 32);
  
  return decryptText(cipherBase64, keyHex, ivHex);
};
