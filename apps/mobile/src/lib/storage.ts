import AsyncStorage from "@react-native-async-storage/async-storage";

export const storageKeys = {
  theme: "levelup.theme",
  preferredName: "levelup.preferredName",
} as const;

/** Reads a value, treating storage failures as "not set" so the app always starts. */
export async function readItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.warn(`[storage] Failed to read ${key}`, error);
    return null;
  }
}

export async function writeItem(key: string, value: string | null): Promise<void> {
  try {
    if (value === null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.warn(`[storage] Failed to write ${key}`, error);
  }
}
