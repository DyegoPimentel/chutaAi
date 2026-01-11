import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'chutaai-theme';
  private readonly legacyStorageKeys = ['chutaibrasil-theme'];
  private readonly document = inject(DOCUMENT);
  private readonly isDarkSignal = signal(this.loadTheme());

  readonly isDark = this.isDarkSignal.asReadonly();

  constructor() {
    effect(() => {
      const isDark = this.isDarkSignal();
      localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
      this.document.documentElement.classList.toggle('dark', isDark);
    });
  }

  toggleTheme() {
    this.isDarkSignal.update((value) => !value);
  }

  private loadTheme(): boolean {
    const saved = localStorage.getItem(this.storageKey);
    if (saved !== null) {
      return saved === 'dark';
    }

    for (const legacyKey of this.legacyStorageKeys) {
      const legacySaved = localStorage.getItem(legacyKey);
      if (legacySaved !== null) {
        localStorage.removeItem(legacyKey);
        return legacySaved === 'dark';
      }
    }

    return false;
  }
}
