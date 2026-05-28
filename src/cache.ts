import * as fs from 'fs';
import * as path from 'path';
import { CacheEntry } from './types';

const CACHE_DIR = '.cache';
const CACHE_FILE = path.join(CACHE_DIR, 'file-cache.json');

export class FileCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlHours: number;

  constructor(ttlHours: number = 24) {
    this.ttlHours = ttlHours;
    this.loadCache();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  }

  private loadCache(): void {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const data = fs.readFileSync(CACHE_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        this.cache = new Map(parsed);
      }
    } catch (error) {
      console.error('Error loading cache:', error);
      this.cache = new Map();
    }
  }

  private saveCache(): void {
    try {
      this.ensureCacheDir();
      const data = Array.from(this.cache.entries());
      fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;
    const ttlMs = this.ttlHours * 60 * 60 * 1000;

    if (age > ttlMs) {
      this.cache.delete(key);
      this.saveCache();
      return null;
    }

    return entry;
  }

  set(key: string, value: CacheEntry): void {
    this.cache.set(key, {
      ...value,
      timestamp: Date.now(),
    });
    this.saveCache();
  }

  clear(): void {
    this.cache.clear();
    try {
      if (fs.existsSync(CACHE_FILE)) {
        fs.unlinkSync(CACHE_FILE);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  getStats(): { size: number; entries: number } {
    return {
      size: this.cache.size,
      entries: this.cache.size,
    };
  }
}
