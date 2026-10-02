"use client";

/**
 * Global axios interceptor setup.
 *
 * Attaches the customer's auth token (stored encrypted in Redux under `pT5`)
 * as a Bearer header to every outgoing axios request so that **all routes**
 * send the token to the backend automatically.
 *
 * Import this module once on the client side (e.g. from ReduxProvider) and
 * every `axios.get/post/...` call across the app will include the token.
 */

import axios from "axios";
import CryptoJS from "crypto-js";

let interceptorsConfigured = false;

/**
 * Read the encrypted token from the persisted Redux store in localStorage
 * and return the decrypted value.
 *
 * redux-persist stores the persisted state under the key configured in
 * `store/index.ts` (persistConfig.key = "root"). The auth slice lives under
 * the `uSess` reducer key.
 */
function getDecryptedToken(): string | null {
  try {
    const passphrase = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
    if (!passphrase) return null;

    // redux-persist stores the root state under "persist:root"
    const raw = localStorage.getItem("persist:root");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    // uSess is the persisted auth slice; its values are JSON-encoded strings
    const uSessRaw = parsed.uSess;
    if (!uSessRaw) return null;

    const uSess = typeof uSessRaw === "string" ? JSON.parse(uSessRaw) : uSessRaw;
    const encryptedToken = uSess?.pT5;
    if (!encryptedToken) return null;

    const bytes = CryptoJS.AES.decrypt(encryptedToken, passphrase);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;

    // pT5 stores the token as a JSON-encoded string (encryptData JSON.stringify's
    // the value before encrypting), so we may need to parse it.
    try {
      const parsedToken = JSON.parse(decrypted);
      return typeof parsedToken === "string" ? parsedToken : decrypted;
    } catch {
      return decrypted;
    }
  } catch {
    return null;
  }
}

/**
 * Configure the global axios request interceptor.
 * Safe to call multiple times — it will only add the interceptor once.
 */
export function setupAxiosInterceptors() {
  if (interceptorsConfigured) return;
  interceptorsConfigured = true;

  axios.interceptors.request.use(
    (config) => {
      const token = getDecryptedToken();
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}