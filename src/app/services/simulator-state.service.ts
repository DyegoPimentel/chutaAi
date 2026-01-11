import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SimulatorStateService {
  private readonly storageKey = 'chutaai-simulator-bet';
  private readonly legacyStorageKeys = ['chutaibrasil-simulator-bet'];
  private readonly betSignal = signal<number[] | null>(this.loadBet());

  readonly bet = this.betSignal.asReadonly();

  setBet(numbers: number[]) {
    this.betSignal.set([...numbers]);
    localStorage.setItem(this.storageKey, JSON.stringify(numbers));
  }

  clearBet() {
    this.betSignal.set(null);
    localStorage.removeItem(this.storageKey);
  }

  private loadBet(): number[] | null {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      return this.parseBet(saved);
    }

    for (const legacyKey of this.legacyStorageKeys) {
      const legacySaved = localStorage.getItem(legacyKey);
      if (!legacySaved) {
        continue;
      }

      const parsed = this.parseBet(legacySaved);
      if (parsed) {
        localStorage.setItem(this.storageKey, JSON.stringify(parsed));
        localStorage.removeItem(legacyKey);
        return parsed;
      }
    }

    return null;
  }

  private parseBet(raw: string): number[] | null {
    try {
      const parsed = JSON.parse(raw) as number[];
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}
