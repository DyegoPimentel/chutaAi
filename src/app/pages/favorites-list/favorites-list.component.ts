import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { getLotteryLabel } from '../../interfaces/global';
import { FavoriteBet, FavoritesService } from '../../services/favorites.service';
import { LotteriesApiService } from '../../services/loterias-api.service';
import { SimulatorStateService } from '../../services/simulator-state.service';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './favorites-list.component.html',
  styleUrl: './favorites-list.component.css'
})
export class FavoritesListComponent {
  private readonly lotteriesApi = inject(LotteriesApiService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly simulatorState = inject(SimulatorStateService);
  private readonly router = inject(Router);
  readonly favorites = this.favoritesService.favorites;
  readonly getLotteryLabel = getLotteryLabel;
  totalDraws = 0;
  private drawNumbers: number[][] = [];

  constructor() {
    this.lotteriesApi
      .getResultsByLottery('lotofacil')
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (results) => {
          this.drawNumbers = results.map((result) =>
            result.drawNumbers
              .map((value) => Number.parseInt(value, 10))
              .filter((num) => Number.isFinite(num))
          );
          this.totalDraws = this.drawNumbers.length;
          this.updateFavoritesStats(this.favoritesService.favorites());
        },
        error: () => {
          this.drawNumbers = [];
          this.totalDraws = 0;
        }
      });

    effect(() => {
      const favorites = this.favoritesService.favorites();
      this.updateFavoritesStats(favorites);
    });
  }

  removeFavorite(id: string) {
    this.favoritesService.removeFavorite(id);
  }

  goToResults(favorite: FavoriteBet) {
    this.simulatorState.setBet(favorite.numbers);
    this.router.navigate(['/simulador-apostas-passada', favorite.lotteryType, 'resultado']);
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('pt-BR');
  }

  formatRoi(value?: number): string {
    if (value === undefined || Number.isNaN(value)) {
      return '--';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  }

  trackById(_index: number, favorite: FavoriteBet) {
    return favorite.id;
  }

  private updateFavoritesStats(favorites: FavoriteBet[]) {
    if (this.drawNumbers.length === 0) {
      return;
    }

    favorites.forEach((favorite) => {
      if (favorite.totalWins === undefined || favorite.totalDraws === undefined) {
        const wins = this.drawNumbers.filter((draw) => {
          const matches = favorite.numbers.filter((num) => draw.includes(num)).length;
          return matches >= 11;
        }).length;

        this.favoritesService.updateFavoriteStats(favorite.id, {
          totalWins: favorite.totalWins ?? wins,
          totalDraws: favorite.totalDraws ?? this.drawNumbers.length
        });
      }
    });
  }
}
