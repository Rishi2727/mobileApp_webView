export const storageKeys = {
    LANGUAGE: 'language',
    AUTH_TOKEN: "auth-token"
} as const;

export type StorageKey = keyof typeof storageKeys;