'use client';

import { useState, useEffect, useCallback } from 'react';

export interface RecentSearch {
  id: string;
  intent: 'rent' | 'buy';
  city: { id: number; name: string } | null;
  localities: { id: number; name: string }[];
  roomTypes: string[];
  propertyType: string;
  timestamp: number;
}

const STORAGE_KEY = 'zindstay_recent_searches';
const MAX_SEARCHES = 4;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }, []);

  const addSearch = useCallback((search: Omit<RecentSearch, 'id' | 'timestamp'>) => {
    setRecentSearches((prev) => {
      // Create new record
      const newSearch: RecentSearch = {
        ...search,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };

      // Filter out duplicate identical searches (same intent, city, localities, filters)
      const isDuplicate = (a: RecentSearch, b: RecentSearch) => {
        if (a.intent !== b.intent) return false;
        if (a.city?.id !== b.city?.id) return false;
        if (a.propertyType !== b.propertyType) return false;
        if (a.roomTypes.join(',') !== b.roomTypes.join(',')) return false;
        if (a.localities.map(l => l.id).join(',') !== b.localities.map(l => l.id).join(',')) return false;
        return true;
      };

      let nextList = prev.filter(s => !isDuplicate(s, newSearch));
      
      // Add to front
      nextList.unshift(newSearch);
      
      // Trim to max length
      if (nextList.length > MAX_SEARCHES) {
        nextList = nextList.slice(0, MAX_SEARCHES);
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      } catch (e) {
        console.error('Failed to save recent searches', e);
      }

      return nextList;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { recentSearches, addSearch, clearSearches };
}
