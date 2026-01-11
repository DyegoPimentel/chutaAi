import { Injectable, effect, signal } from '@angular/core';

export interface FavoriteBet {
  id: string;
  numbers: number[];
  createdAt: string;
  totalWins?: number;
  totalDraws?: number;
}

type LegacyFavoriteBet = FavoriteBet & { totalSorteios?: number };

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly storageKey = 'chutaai-favorites';
  private readonly legacyStorageKeys = ['chutaibrasil-favorites'];
  private readonly favoritesSignal = signal<FavoriteBet[]>(this.loadFavorites());

  readonly favorites = this.favoritesSignal.asReadonly();

  constructor() {
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.favoritesSignal()));
    });
  }

  addFavorite(numbers: number[], stats?: { totalWins?: number; totalDraws?: number }) {
    const newFavorite: FavoriteBet = {
      id: Date.now().toString(),
      numbers,
      createdAt: new Date().toISOString(),
      ...(stats ?? {})
    };
    this.favoritesSignal.update((prev) => [...prev, newFavorite]);
  }

  removeFavorite(id: string) {
    this.favoritesSignal.update((prev) => prev.filter((fav) => fav.id !== id));
  }

  isFavorite(numbers: number[]): boolean {
    return this.favoritesSignal().some(
      (fav) =>
        fav.numbers.length === numbers.length &&
        fav.numbers.every((num) => numbers.includes(num))
    );
  }

  updateFavoriteStats(id: string, stats: { totalWins?: number; totalDraws?: number }) {
    this.favoritesSignal.update((prev) =>
      prev.map((fav) => (fav.id === id ? { ...fav, ...stats } : fav))
    );
  }

  private loadFavorites(): FavoriteBet[] {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      return this.parseFavorites(saved);
    }

    for (const legacyKey of this.legacyStorageKeys) {
      const legacySaved = localStorage.getItem(legacyKey);
      if (!legacySaved) {
        continue;
      }

      const parsed = this.parseFavorites(legacySaved);
      if (parsed.length > 0) {
        localStorage.removeItem(legacyKey);
        return parsed;
      }
    }

    return [];
  }

  private parseFavorites(raw: string): FavoriteBet[] {
    try {
      const parsed = JSON.parse(raw) as LegacyFavoriteBet[];
      return parsed.map((favorite) => {
        const legacyTotalDraws = favorite.totalSorteios;
        if (favorite.totalDraws === undefined && legacyTotalDraws !== undefined) {
          return { ...favorite, totalDraws: legacyTotalDraws };
        }

        return favorite;
      });
    } catch {
      return [];
    }
  }
}
