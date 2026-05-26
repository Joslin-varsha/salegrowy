import CryptoJS from 'crypto-js';

// This is a placeholder key. Your lead will give you the real one later.
// We use the environment variable if it exists, otherwise a fallback.
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'SALEROWY_TEMP_KEY_2026';

/**
 * Encrypts a string or object
 */
export const encryptData = (data) => {
  if (!data) return data;
  try {
    const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    return CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption Error:', error);
    return data;
  }
};

/**
 * Decrypts an encrypted string
 */
export const decryptData = (ciphertext) => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) return ciphertext; // Return original if decryption failed to return text

    // Try to parse if it's a JSON object, otherwise return as string
    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (error) {
    console.error('Decryption Error:', error);
    return ciphertext;
  }
};
