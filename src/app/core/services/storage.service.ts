import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  setToken(token: string): void {
    this.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  getToken(): string | null {
    return this.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  removeToken(): void {
    this.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error);
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  setUser(user: any): void {
    try {
      this.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  getUser(): any | null {
    try {
      const userData = this.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  removeUser(): void {
    this.removeItem(STORAGE_KEYS.USER_DATA);
  }
}

