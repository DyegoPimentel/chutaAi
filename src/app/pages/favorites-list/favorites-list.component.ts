import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { lotofacilDraws } from '../../data/lotofacil-data';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FavoriteBet, FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './favorites-list.component.html',
  styleUrl: './favorites-list.component.css'
})
export class FavoritesListComponent {
  private readonly favoritesService = inject(FavoritesService);
  readonly favorites = this.favoritesService.favorites;
  readonly totalDraws = lotofacilDraws.length;

  constructor() {
    effect(() => {
      const favorites = this.favoritesService.favorites();
      favorites.forEach((favorite) => {
        if (favorite.totalWins === undefined || favorite.totalDraws === undefined) {
          const wins = lotofacilDraws.filter((draw) => {
            const matches = favorite.numbers.filter((num) => draw.drawnNumbers.includes(num)).length;
            return matches >= 11;
          }).length;

          this.favoritesService.updateFavoriteStats(favorite.id, {
            totalWins: favorite.totalWins ?? wins,
            totalDraws: favorite.totalDraws ?? lotofacilDraws.length
          });
        }
      });
    });
  }

  removeFavorite(id: string) {
    this.favoritesService.removeFavorite(id);
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('pt-BR');
  }

  trackById(_index: number, favorite: FavoriteBet) {
    return favorite.id;
  }
}
