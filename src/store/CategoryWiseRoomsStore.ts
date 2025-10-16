import { create } from 'zustand';
import { getCategoryWiseDesks, getAvailabilityCategories } from './api';
import type { CategoryWiseAvailabilityRoom, RoomCategoryConfig } from './api/ResponseModels';
import type { CatWiseRooms } from './api/RequestModels';
import { groupBy, isEqual } from 'lodash';
import { baseUrl } from './api/client';
import { roomImage, roomMiniMap } from '@/assets';


let refreshTimer: ReturnType<typeof setInterval> | null = null;
const intervalMs = 2000;


export type GroupedData = {
  grouped: GroupedByCatCode;
  raw: CategoryWiseAvailabilityRoom[];
  counts: {
    categories: {
      code: string;
      name: string;
    }[];
    libraries: {
      code: string;
      name: string;
    }[];
    floors: {
      color: string;
      code: string;
      name: string;
      libCode: string;
      libName: string;
    }[];
  };
};

// All levels are objects with numeric keys or 'all' as key
export type GroupedByCatCode = {
  [catCode: string]: GroupedByLibCode;
};

export type GroupedByLibCode = {
  [libCode: string]: GroupedByFloorCode;
};

export type GroupedByFloorCode = {
  [floorCode: string]: GroupedByIdentity[];
};

export type GroupedByIdentity = CategoryWiseAvailabilityRoom[];



// Web-compatible cache interface for IndexedDB
interface CacheEntry {
  file: string;
  data: string;
  timestamp: number;
}

type CatCategoryWiseRoomsStore = {
  init: (catCodes: string[], includeAvailability: boolean) => void;
  stopAndClear: () => void;
  categories: RoomCategoryConfig[] | null;
  fetchCategories?: () => Promise<void>;
  categoriesWiseGroupedData: GroupedData | null;
  CategoriesWiseDesksChoice: { catCodes: string[]; payload: CatWiseRooms; };
  setCategoriesWiseDesksChoice: (catCodes: string[], payload: CatWiseRooms) => void;
  getCategoryWiseDesks?: () => Promise<void>;
  isMapsDownloading?: boolean;
  downloadMapFiles: (files: string[]) => Promise<void>;
  getCachedFileUri: (file: string) => Promise<string>;
};

const groupKeyCalculator = (r: CategoryWiseAvailabilityRoom) => {
  // Create a unique key based on room properties
  const specialKey = (r.roomWiseBooking) ? '' : r.roomCode; // If roomWiseBooking is true, use an empty string;
  return `${r.roomcatCode}_${r.libCode}_${r.floorCode}_${specialKey}_${r.roomMaxUsers}`;
};

export const useCategoryWiseRoomsStore = create<CatCategoryWiseRoomsStore>((set, get) => ({
  init: (catCodes, includeAvailability) => {
    if (refreshTimer) return; // already started
    const choice = get().CategoriesWiseDesksChoice;
    set({ CategoriesWiseDesksChoice: { catCodes, payload: { includeAvailability } }, });
    const choiceAfter = get().CategoriesWiseDesksChoice;
    if (!isEqual(choice, choiceAfter)) { set({ categoriesWiseGroupedData: null }); }
    if (catCodes.length > 0) { get().getCategoryWiseDesks?.(); }
    refreshTimer = setInterval(() => {
      if (catCodes.length > 0) { get().getCategoryWiseDesks?.(); }
    }, intervalMs);
  },

  stopAndClear: () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  },

  categories: null,
  fetchCategories: async () => {
    const res = await getAvailabilityCategories();
    if (res?.success && res.data) {
      set({ categories: res.data });
    }
  },


  categoriesWiseGroupedData: null,
  CategoriesWiseDesksChoice: { catCodes: [], payload: { includeAvailability: true } },
  setCategoriesWiseDesksChoice: (catCodes: string[], payload: CatWiseRooms) => { set({ CategoriesWiseDesksChoice: { catCodes, payload } }); },
  getCategoryWiseDesks: async () => {
    const choice = get().CategoriesWiseDesksChoice;
    const res = await getCategoryWiseDesks(choice.catCodes.join(','), choice.payload);
    if (res?.success && res.data && choice === get().CategoriesWiseDesksChoice) {
      const raw = res.data;

      const maps: string[] = [...raw.map(room => room.roomNavigationMap), ...raw.map(room => room.floorMap), ...raw.map(room => room.zoneMap), ...raw.map(room => room.roomMap)].filter(map => map && map !== '' && map !== null && map !== 'null');

      if (maps.length > 0) {
        get().downloadMapFiles(maps);
      }

      // Helper to build floor-level grouping with 'all'
      const buildFloor = (rooms: CategoryWiseAvailabilityRoom[]) => {
        const byFloor = groupBy(rooms, (r: CategoryWiseAvailabilityRoom) => r.floorCode.toString());
        const result: any = {};
        Object.entries(byFloor).forEach(([floorKey, roomsInFloor]) => {
          const identityGroups = Object.values(groupBy(roomsInFloor, groupKeyCalculator));
          (identityGroups as any).all = roomsInFloor;
          result[floorKey] = identityGroups;
        });
        const allIdentity = Object.values(groupBy(rooms, groupKeyCalculator));
        (allIdentity as any).all = rooms;
        result.all = allIdentity;
        return result;
      };
      // Helper to build library-level grouping with 'all'
      const buildLib = (rooms: CategoryWiseAvailabilityRoom[]) => {
        const byLib = groupBy(rooms, (r: CategoryWiseAvailabilityRoom) => r.libCode.toString());
        const result: any = {};
        Object.entries(byLib).forEach(([libKey, roomsInLib]) => {
          result[libKey] = buildFloor(roomsInLib);
        });
        result.all = buildFloor(rooms);
        return result;
      };
      // Helper to build category-level grouping with 'all'
      const buildCat = (rooms: CategoryWiseAvailabilityRoom[]) => {
        const byCat = groupBy(rooms, (r: CategoryWiseAvailabilityRoom) => r.roomcatCode.toString());
        const result: any = {};
        Object.entries(byCat).forEach(([catKey, roomsInCat]) => {
          result[catKey] = buildLib(roomsInCat);
        });
        result.all = buildLib(rooms);
        return result as GroupedByCatCode;
      };
      const grouped = buildCat(raw);

      const groupedData: GroupedData = {
        grouped,
        raw,
        counts: {
          categories: Array.from(
            raw.reduce(
              (map, r) => map.set(r.roomcatCode, { code: String(r.roomcatCode), name: r.roomcatName }),
              new Map<number, { code: string; name: string }>()
            ).values()
          ),
          libraries: Array.from(
            raw.reduce(
              (map, r) => map.set(r.libCode, { code: String(r.libCode), name: r.libName }),
              new Map<number, { code: string; name: string }>()
            ).values()
          ),
          floors: Array.from(
            raw.reduce(
              (map, r) => map.set(r.floorCode, { color: String(r.floorColor), code: String(r.floorCode), name: r.floorName, libCode: String(r.libCode), libName: r.libName }),
              new Map<number, { color: string; code: string; name: string; libCode: string; libName: string }>()
            ).values()
          )
        }
      };
      if (!isEqual(groupedData.raw, get().categoriesWiseGroupedData?.raw)) {
        set({ categoriesWiseGroupedData: groupedData });
      }
    }
  },


  isMapsDownloading: false,
  downloadMapFiles: async (files: string[]) => {
    if (get().isMapsDownloading) return;
    set({ isMapsDownloading: true });

    try {
      for (const file of files) {
        await getWebCompatibleFileUri(file);
      }
    } catch (error) {
      console.warn('Error downloading map files:', error);
    } finally {
      set({ isMapsDownloading: false });
    }
  },

  getCachedFileUri: async (file: string): Promise<string> => {
    return await getWebCompatibleFileUri(file);
  },
}));


// Asset mapping for bundled files - Web compatible
const assetMap: { [key: string]: string } = {
  // Main store assets
  'RM-566-20250710.png': roomImage.rm566,
  'RM-567-20250710.png': roomImage.rm567,
  'RM-568-20250710.png': roomImage.rm568,
  'RM-592-20250710.png': roomImage.rm592,
  'RM-593-20250710.png': roomImage.rm593,
  'RM-594-20250710.png': roomImage.rm594,
  'RM-595-20250710.png': roomImage.rm595,
  // MiniMaps assets
  'miniMaps/RM-NAV-566-20250804.png': roomMiniMap.rmNav566,
  'miniMaps/RM-NAV-567-20250804.png': roomMiniMap.rmNav567,
  'miniMaps/RM-NAV-568-20250804.png': roomMiniMap.rmNav568,
  'miniMaps/RM-NAV-592-20250804.png': roomMiniMap.rmNav592,
  'miniMaps/RM-NAV-593-20250804.png': roomMiniMap.rmNav593,
  'miniMaps/RM-NAV-594-20250804.png': roomMiniMap.rmNav594,
  'miniMaps/RM-NAV-595-20250804.png': roomMiniMap.rmNav595,
};

// Web-compatible caching using IndexedDB
const DB_NAME = 'MapFilesCache';
const DB_VERSION = 1;
const STORE_NAME = 'files';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(new Error(request.error?.message || 'Failed to open database'));
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'file' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
};

const getCachedFile = async (file: string): Promise<CacheEntry | null> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.get(file);
    request.onerror = () => reject(new Error(request.error?.message || 'Failed to get cached file'));
    request.onsuccess = () => resolve(request.result || null);
  });
};

const setCachedFile = async (entry: CacheEntry): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.put(entry);
    request.onerror = () => reject(new Error(request.error?.message || 'Failed to cache file'));
    request.onsuccess = () => resolve();
  });
};

// Convert file to base64 data URI
const fileToDataUri = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error(reader.error?.message || 'Failed to read file'));
    reader.readAsDataURL(blob);
  });
};

// Web-compatible file handling
const getWebCompatibleFileUri = async (file: string): Promise<string> => {
  // Step 1: Check if file exists in bundled assets
  if (assetMap[file]) {
    console.log(`Using bundled asset: ${file}`);
    return assetMap[file];
  }

  // Step 2: Check cache
  try {
    const cached = await getCachedFile(file);
    if (cached) {
      console.log(`Using cached file: ${file}`);
      return cached.data;
    }
  } catch (error) {
    console.warn(`Error checking cache for ${file}:`, error);
  }

  // Step 3: Download from server
  return await downloadFromWebServer(file);
};

const downloadFromWebServer = async (file: string): Promise<string> => {
  console.log(`Downloading map file: ${file}`);
  
  try {
    const response = await fetch(`${baseUrl}/store/${file}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const dataUri = await fileToDataUri(blob);
    
    // Cache the result
    try {
      await setCachedFile({
        file,
        data: dataUri,
        timestamp: Date.now()
      });
    } catch (cacheError) {
      console.warn(`Failed to cache file ${file}:`, cacheError);
      // Continue even if caching fails
    }
    
    console.log(`Successfully downloaded: ${file}`);
    return dataUri;
  } catch (error) {
    console.warn(`Failed to download ${file}:`, error);
    throw new Error(`Unable to load file: ${file}`);
  }
};

export async function deleteAllGifs() {
  console.log('Clearing all cached files...');
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(new Error(request.error?.message || 'Failed to clear cache'));
      request.onsuccess = () => resolve();
    });
    
    console.log('Cache cleared successfully');
  } catch (error) {
    console.warn('Error clearing cache:', error);
  }
}