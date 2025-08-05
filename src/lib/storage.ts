import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = "https://pijqlyzuavxgxcqblykx.supabase.co";

// Cache configuration
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
const MEMORY_CACHE_SIZE = 100; // Maximum number of URLs to cache in memory

// In-memory cache for fastest access
const memoryCache = new Map<string, { url: string; timestamp: number }>();

// Cache interface for consistent typing
interface CacheEntry {
  url: string;
  timestamp: number;
}

// Memory cache management
const addToMemoryCache = (key: string, url: string) => {
  // If cache is full, remove oldest entry
  if (memoryCache.size >= MEMORY_CACHE_SIZE) {
    const oldestKey = Array.from(memoryCache.keys())[0];
    memoryCache.delete(oldestKey);
  }
  
  memoryCache.set(key, { url, timestamp: Date.now() });
};

const getFromMemoryCache = (key: string): string | null => {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  
  // Check if expired
  if (Date.now() - entry.timestamp > CACHE_EXPIRY_MS) {
    memoryCache.delete(key);
    return null;
  }
  
  return entry.url;
};

// localStorage cache management with error handling
const addToLocalStorage = (key: string, url: string) => {
  try {
    const cacheEntry: CacheEntry = { url, timestamp: Date.now() };
    localStorage.setItem(`img_cache_${key}`, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn('Failed to save to localStorage cache:', error);
  }
};

const getFromLocalStorage = (key: string): string | null => {
  try {
    const cached = localStorage.getItem(`img_cache_${key}`);
    if (!cached) return null;
    
    const entry: CacheEntry = JSON.parse(cached);
    
    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(`img_cache_${key}`);
      return null;
    }
    
    return entry.url;
  } catch (error) {
    console.warn('Failed to read from localStorage cache:', error);
    return null;
  }
};

// Clean expired entries from localStorage
const cleanExpiredCache = () => {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('img_cache_')) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry = JSON.parse(cached);
            if (Date.now() - entry.timestamp > CACHE_EXPIRY_MS) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid JSON, remove it
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    if (keysToRemove.length > 0) {
      console.log(`🧹 Cleaned up ${keysToRemove.length} expired cache entries`);
    }
  } catch (error) {
    console.warn('Failed to clean expired cache:', error);
  }
};

// Run cache cleanup on module load
cleanExpiredCache();

export const getImageUrl = async (path: string): Promise<string> => {
  if (!path) return '';
  
  // If path already contains full URL, return as-is
  if (path.startsWith('http')) return path;
  
  // Clean the path - remove any leading slashes or bucket prefixes
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Remove 'baritems/' prefix if it somehow still exists
  if (cleanPath.startsWith('baritems/')) {
    cleanPath = cleanPath.replace('baritems/', '');
  }
  
  // Use cleanPath as cache key
  const cacheKey = cleanPath;
  
  // Try memory cache first (fastest)
  const memoryResult = getFromMemoryCache(cacheKey);
  if (memoryResult) {
    console.log(`🚀 Cache hit (memory) for ${cleanPath}`);
    return memoryResult;
  }
  
  // Try localStorage cache (faster than network)
  const localStorageResult = getFromLocalStorage(cacheKey);
  if (localStorageResult) {
    console.log(`💾 Cache hit (localStorage) for ${cleanPath}`);
    // Also add to memory cache for next time
    addToMemoryCache(cacheKey, localStorageResult);
    return localStorageResult;
  }
  
  // Cache miss - fetch from Supabase
  console.log(`🌐 Cache miss - creating signed URL for ${cleanPath}`);
  
  try {
    // Create signed URL for private bucket access (expires in 1 hour)
    const { data, error } = await supabase.storage
      .from('baritems')
      .createSignedUrl(cleanPath, 3600); // 1 hour expiry
    
    if (error) {
      console.error(`Error creating signed URL for ${cleanPath}:`, error);
      return '';
    }
    
    const signedUrl = data.signedUrl;
    console.log(`✅ Signed URL created for ${cleanPath}`);
    
    // Cache the result in both memory and localStorage
    addToMemoryCache(cacheKey, signedUrl);
    addToLocalStorage(cacheKey, signedUrl);
    
    return signedUrl;
  } catch (error) {
    console.error(`❌ Error getting signed URL for ${cleanPath}:`, error);
    return '';
  }
};

// Synchronous version that creates a placeholder and loads async
export const getImageUrlSync = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Return a placeholder initially, then update via React state
  return '';
};

export const uploadImage = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('baritems')
    .upload(path, file);
  
  if (error) throw error;
  return data;
};

export const uploadProfileImage = async (file: File, userId: string) => {
  // Create a unique file name with user ID and timestamp
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('profiles')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true // Replace existing file if it exists
    });
  
  if (error) throw error;
  return data;
};

export const getProfileImageUrl = async (userId: string): Promise<string> => {
  try {
    // List files in the user's profile folder to find their avatar
    const { data: files, error: listError } = await supabase.storage
      .from('profiles')
      .list(userId, { limit: 10 });
    
    if (listError) throw listError;
    
    // Find avatar file (could be .jpg, .png, .webp, etc.)
    const avatarFile = files?.find(file => file.name.startsWith('avatar.'));
    
    if (!avatarFile) return '';
    
    const filePath = `${userId}/${avatarFile.name}`;
    
    // Create signed URL for the profile image
    const { data, error } = await supabase.storage
      .from('profiles')
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    
    if (error) throw error;
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting profile image URL:', error);
    return '';
  }
};

export const deleteImage = async (path: string) => {
  const { error } = await supabase.storage
    .from('baritems')
    .remove([path]);
  
  if (error) throw error;
};

// Cache management utilities
export const clearImageCache = () => {
  try {
    // Clear memory cache
    memoryCache.clear();
    
    // Clear localStorage cache
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('img_cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`🧹 Cleared image cache: ${keysToRemove.length} localStorage entries`);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};

export const getCacheStats = () => {
  try {
    let localStorageCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('img_cache_')) {
        localStorageCount++;
      }
    }
    
    return {
      memoryEntries: memoryCache.size,
      localStorageEntries: localStorageCount,
      maxMemorySize: MEMORY_CACHE_SIZE,
      cacheExpiryMinutes: CACHE_EXPIRY_MS / (60 * 1000)
    };
  } catch (error) {
    console.warn('Failed to get cache stats:', error);
    return null;
  }
};

export const testStorageAccess = async () => {
  try {
    console.log('🔍 Testing storage access to baritems bucket...');
    
    // Check current auth state
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 Current auth user:', user?.id || 'No user');
    console.log('🔑 Auth error:', authError);
    
    // Try to list files in the bucket to test access
    const { data, error } = await supabase.storage
      .from('baritems')
      .list('', { limit: 50 });
    
    if (error) {
      console.error('❌ Storage access error:', error);
      console.log('🔍 Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }
    
    console.log('📁 Files in baritems bucket:', data?.map(f => f.name));
    console.log('📊 Total files found:', data?.length || 0);
    
    // Test creating a signed URL for the first file (if any exist)
    if (data && data.length > 0) {
      const testFile = data[0].name;
      console.log(`🧪 Testing signed URL for first file: ${testFile}`);
      
      const { data: signedData, error: signedError } = await supabase.storage
        .from('baritems')
        .createSignedUrl(testFile, 3600);
      
      if (signedError) {
        console.error(`❌ Failed to create signed URL for ${testFile}:`, signedError);
        console.log('🔍 Signed URL error details:', JSON.stringify(signedError, null, 2));
      } else {
        console.log(`✅ Successfully created signed URL for ${testFile}`);
      }
    }
    
    return { success: true, files: data };
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return { success: false, error: error.message };
  }
};