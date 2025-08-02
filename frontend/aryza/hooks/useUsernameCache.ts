import { useState, useEffect, useCallback } from 'react';

interface CachedUsername {
  address: string;
  username: string;
  timestamp: number;
}

const CACHE_KEY = 'questboard_usernames';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUsernameCache = () => {
  const [cachedUsernames, setCachedUsernames] = useState<
    Record<string, CachedUsername>
  >({});

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out expired entries
        const now = Date.now();
        const filtered = Object.fromEntries(
          Object.entries(parsed).filter(([, entry]: [string, unknown]) => {
            const cachedEntry = entry as CachedUsername;
            return now - cachedEntry.timestamp < CACHE_DURATION;
          })
        ) as Record<string, CachedUsername>;
        setCachedUsernames(filtered);
      }
    } catch (error) {
      console.error('Error loading username cache:', error);
    }
  }, []);

  // Save cache to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedUsernames));
    } catch (error) {
      console.error('Error saving username cache:', error);
    }
  }, [cachedUsernames]);

  const getCachedUsername = useCallback(
    (address: string): string | null => {
      const cached = cachedUsernames[address.toLowerCase()];
      if (!cached) return null;

      // Check if cache is still valid
      if (Date.now() - cached.timestamp > CACHE_DURATION) {
        // Remove expired entry
        setCachedUsernames((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [address.toLowerCase()]: _, ...rest } = prev;
          return rest;
        });
        return null;
      }

      return cached.username;
    },
    [cachedUsernames]
  );

  const setCachedUsername = useCallback((address: string, username: string) => {
    setCachedUsernames((prev) => ({
      ...prev,
      [address.toLowerCase()]: {
        address: address.toLowerCase(),
        username,
        timestamp: Date.now(),
      },
    }));
  }, []);

  const clearCache = useCallback(() => {
    setCachedUsernames({});
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error clearing username cache:', error);
    }
  }, []);

  return {
    getCachedUsername,
    setCachedUsername,
    clearCache,
  };
};
