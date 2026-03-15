import { Injectable, effect, signal } from '@angular/core';
import { LotteryType, normalizeLotteryType } from '../interfaces/global';

export interface FavoriteBet {
  id: string;
  lotteryType: LotteryType;
  numbers: number[];
  createdAt: string;
  totalWins?: number;
  totalDraws?: number;
  roi?: number;
}

type StoredFavoriteBet = Omit<FavoriteBet, 'lotteryType'> & {
  lotteryType?: string;
  betType?: string;
};

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

  addFavorite(
    numbers: number[],
    lotteryType: LotteryType,
    stats?: { totalWins?: number; totalDraws?: number; roi?: number }
  ) {
    const newFavorite: FavoriteBet = {
      id: Date.now().toString(),
      lotteryType: normalizeLotteryType(lotteryType),
      numbers,
      createdAt: new Date().toISOString(),
      ...(stats ?? {})
    };
    this.favoritesSignal.update((prev) => [...prev, newFavorite]);
  }

  removeFavorite(id: string) {
    this.favoritesSignal.update((prev) => prev.filter((fav) => fav.id !== id));
  }

  isFavorite(numbers: number[], lotteryType?: LotteryType): boolean {
    return this.favoritesSignal().some(
      (fav) =>
        (!lotteryType || fav.lotteryType === lotteryType) &&
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
      const parsed = JSON.parse(raw) as StoredFavoriteBet[];
      return parsed.map((favorite) => {
        const legacyTotalDrawsValue = (favorite as Record<string, unknown>)['totalSorteios'];
        const legacyTotalDraws =
          typeof legacyTotalDrawsValue === 'number' ? legacyTotalDrawsValue : undefined;
        const { betType, lotteryType: storedLotteryType, ...rest } = favorite;
        const lotteryType = normalizeLotteryType(storedLotteryType ?? betType);
        const totalDraws = favorite.totalDraws ?? legacyTotalDraws;

        return { ...rest, lotteryType, totalDraws };
      });
    } catch {
      return [];
    }
  }
}
