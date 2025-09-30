import { storageKeys, type StorageKey } from "./enums"

export const storage = {
    get<T>(key: StorageKey): T | null {
        try {
            const value = localStorage.getItem(storageKeys[key])
            return value ? (JSON.parse(value) as T) : null
        } catch (error) {
            console.warn(`Failed to get localStorage key "${key}":`, error)
            return null
        }
    },
    set<T>(key: StorageKey, value: T) {
        try {
            localStorage.setItem(storageKeys[key], JSON.stringify(value))
        } catch (error) {
            console.warn(`Failed to set localStorage key "${key}":`, error)
        }
    },
    remove(key: StorageKey) {
        try {
            localStorage.removeItem(storageKeys[key])
        } catch (error) {
            console.warn(`Failed to remove localStorage key "${key}":`, error)
        }
    },
}
