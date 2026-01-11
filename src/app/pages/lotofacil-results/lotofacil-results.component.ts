import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LotofacilDraw } from '../../data/lotofacil-data';
import { FavoritesService } from '../../services/favorites.service';
import { LotteriesApiService, LotteryResult, PrizeTier } from '../../services/loterias-api.service';
import { SimulatorStateService } from '../../services/simulator-state.service';
import { ThemeService } from '../../services/theme.service';

type MatchStatus = 'winner' | 'notWinner';

const matchStatusLabels: Record<MatchStatus, string> = {
  winner: 'premiado',
  notWinner: 'não premiado'
};

export interface MatchResult {
  draw: LotofacilDraw;
  matches: number;
  matchedNumbers: number[];
  prize: number;
  breakdown: PrizeBreakdown[];
  totalCombinations: number;
  status: MatchStatus;
}

interface PrizeBreakdown {
  hits: number;
  combinations: number;
  prizePerHit: number;
  totalPrize: number;
}

function combination(total: number, choose: number): number {
  if (choose < 0 || choose > total) {
    return 0;
  }

  const k = Math.min(choose, total - choose);
  let result = 1;

  for (let i = 1; i <= k; i += 1) {
    result = (result * (total - k + i)) / i;
  }

  return Math.round(result);
}

function countWinningCombinations(totalNumbers: number, matches: number, hits: number): number {
  const nonMatches = totalNumbers - matches;
  const missing = 15 - hits;

  if (hits > matches || missing < 0 || missing > nonMatches) {
    return 0;
  }

  return combination(matches, hits) * combination(nonMatches, missing);
}

function getMatPaginatorIntl(): MatPaginatorIntl {
  const paginatorIntl = new MatPaginatorIntl();
  paginatorIntl.itemsPerPageLabel = 'Itens por pagina';
  paginatorIntl.nextPageLabel = 'Proxima pagina';
  paginatorIntl.previousPageLabel = 'Pagina anterior';
  paginatorIntl.firstPageLabel = 'Primeira pagina';
  paginatorIntl.lastPageLabel = 'Ultima pagina';
  paginatorIntl.getRangeLabel = (page, pageSize, length) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const start = page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, length);
    return `${start} - ${end} de ${length}`;
  };

  return paginatorIntl;
}

@Component({
  selector: 'app-lotofacil-results',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIcon,
    MatPaginatorModule,
    MatProgressSpinner,
    MatSortModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './lotofacil-results.component.html',
  styleUrl: './lotofacil-results.component.css',
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: getMatPaginatorIntl
    }
  ]
})
export class LotofacilResultsComponent {
  private readonly router = inject(Router);
  private readonly simulatorState = inject(SimulatorStateService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly lotteriesApi = inject(LotteriesApiService);
  private readonly dialog = inject(MatDialog);
  private readonly themeService = inject(ThemeService);
  private readonly snackBar = inject(MatSnackBar);

  readonly statusLabels = matchStatusLabels;
  readonly bet = this.simulatorState.bet;
  userNumbers: number[] = [];
  private lotofacilDraws: LotofacilDraw[] = [];
  private readonly drawsLoaded = signal(false);

  itemsPerPage = 5;
  currentPage = 1;
  results: MatchResult[] = [];
  currentResults: MatchResult[] = [];
  dataSource = new MatTableDataSource<MatchResult>([]);
  private unsortedResults: MatchResult[] = [];
  private sortState: Sort = { active: '', direction: '' };
  totalWins = 0;
  totalPrize = 0;
  totalSpent = 0;
  betPrice = 0;
  topNumbers: { num: number; freq: number }[] = [];
  displayedColumns: string[] = [
    'drawNumber',
    'drawDate',
    'drawnNumbers',
    'hits',
    'status',
    'prize',
    'details'
  ];

  constructor() {
    this.lotteriesApi
      .getResultsByLottery('lotofacil')
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (results) => {
          this.lotofacilDraws = this.mapApiResultsToDraws(results);
          this.drawsLoaded.set(true);
          this.tryRecalculate();
        },
        error: () => {
          this.lotofacilDraws = [];
          this.drawsLoaded.set(true);
          this.tryRecalculate();
        }
      });

    effect(() => {
      const bet = this.bet();
      if (!bet) {
        this.router.navigate(['/simulador-apostas-passada/lotofacil']);
        return;
      }

      this.userNumbers = [...bet];
      this.tryRecalculate();
    });
  }

  get favorited(): boolean {
    return this.favoritesService.isFavorite(this.userNumbers);
  }

  readonly isLoading = computed(() => !this.drawsLoaded());

  handleAddFavorite() {
    if (!this.favorited) {
      this.favoritesService.addFavorite(this.userNumbers, {
        totalWins: this.totalWins,
        totalDraws: this.results.length
      });
      this.showFavoriteSnack('Aposta adicionada aos favoritos');
    }
  }

  private showFavoriteSnack(message: string) {
    this.snackBar.open(message, '', {
      duration: 1800,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success', 'snackbar-above-overlay']
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getStatusLabel(status: MatchStatus): string {
    return this.statusLabels[status];
  }

  formatCurrencyValue(value: number): string {
    return this.formatCurrency(value).replace('R$', '').trim();
  }

  get hitRate(): number {
    return this.results.length > 0 ? this.totalWins / this.results.length : 0;
  }

  get roi(): number {
    return this.totalSpent > 0 ? (this.totalPrize - this.totalSpent) / this.totalSpent : 0;
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  }

  handlePage(event: PageEvent) {
    this.itemsPerPage = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.updatePagination();
  }

  openDetails(result: MatchResult) {
    const panelClass = this.themeService.isDark() ? 'dark' : undefined;

    this.dialog.open(LotofacilResultDetailsDialogComponent, {
      data: {
        result,
        userNumbers: this.userNumbers
      },
      panelClass
    });
  }

  startNewSimulation() {
    this.simulatorState.clearBet();
    this.router.navigate(['/simulador-apostas-passada/lotofacil']);
  }

  private tryRecalculate() {
    const bet = this.bet();

    if (!this.drawsLoaded() || !bet || bet.length === 0) {
      return;
    }

    this.userNumbers = [...bet];
    this.recalculate(bet, this.lotofacilDraws);
  }

  private recalculate(numbers: number[], draws: LotofacilDraw[]) {
    this.results = draws.map((draw) => {
      const matchedNumbers = numbers.filter((num) => draw.drawnNumbers.includes(num));
      const matches = matchedNumbers.length;

      const breakdown = this.buildPrizeBreakdown(matches, numbers.length, draw.prizes);
      const prize = breakdown.reduce((sum, entry) => sum + entry.totalPrize, 0);
      const totalCombinations = combination(numbers.length, 15);
      const status: MatchStatus = breakdown.length > 0 ? 'winner' : 'notWinner';

      return { draw, matches, matchedNumbers, prize, breakdown, totalCombinations, status };
    });

    const lotofacilPriceTable: { [key: number]: number } = {
      15: 3.5,
      16: 56.0,
      17: 476.0,
      18: 2856.0,
      19: 13566.0,
      20: 54264.0
    };

    this.betPrice = lotofacilPriceTable[numbers.length] || 0;
    this.totalSpent = this.betPrice * this.results.length;

    this.totalWins = this.results.filter((result) => result.status === 'winner').length;
    this.totalPrize = this.results.reduce((sum, result) => sum + result.prize, 0);

    const numberFrequency: { [key: number]: number } = {};
    this.results.forEach((result) => {
      result.matchedNumbers.forEach((num) => {
        numberFrequency[num] = (numberFrequency[num] || 0) + 1;
      });
    });

    this.topNumbers = Object.entries(numberFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([num, freq]) => ({ num: parseInt(num, 10), freq }));

    this.unsortedResults = [...this.results];
    this.applySort();
  }

  private buildPrizeBreakdown(
    matches: number,
    betSize: number,
    prizes: LotofacilDraw['prizes']
  ): PrizeBreakdown[] {
    if (betSize < 15 || matches < 11) {
      return [];
    }

    const prizeByHits: Record<number, number> = {
      15: prizes.hits15,
      14: prizes.hits14,
      13: prizes.hits13,
      12: prizes.hits12,
      11: prizes.hits11
    };

    return [15, 14, 13, 12, 11]
      .map((hits) => {
        const combinations = countWinningCombinations(betSize, matches, hits);
        const prizePerHit = prizeByHits[hits] ?? 0;
        return {
          hits,
          combinations,
          prizePerHit,
          totalPrize: combinations * prizePerHit
        };
      })
      .filter((entry) => entry.combinations > 0);
  }

  private updatePagination() {
    const totalPages = Math.max(1, Math.ceil(this.results.length / this.itemsPerPage));
    this.currentPage = Math.min(this.currentPage, totalPages);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.results.length);

    this.currentResults = this.results.slice(startIndex, endIndex);
    this.dataSource.data = this.currentResults;
  }

  handleSort(sort: Sort) {
    this.sortState = sort;
    this.applySort();
  }

  private applySort() {
    const { active, direction } = this.sortState;
    if (!direction) {
      this.results = [...this.unsortedResults];
      this.currentPage = 1;
      this.updatePagination();
      return;
    }

    const isAsc = direction === 'asc';
    this.results = [...this.unsortedResults].sort((a, b) => {
      const valueA = this.getSortValue(a, active);
      const valueB = this.getSortValue(b, active);
      return this.compareValues(valueA, valueB, isAsc);
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  private getSortValue(result: MatchResult, column: string): number | string {
    switch (column) {
      case 'drawNumber':
        return result.draw.drawNumber;
      case 'drawDate':
        return this.parseDrawDate(result.draw.drawDate);
      case 'hits':
        return result.matches;
      case 'status':
        return result.status;
      case 'prize':
        return result.prize;
      default:
        return '';
    }
  }

  private parseDrawDate(value: string): number {
    const parts = value.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts.map((part) => Number(part));
      if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
        return new Date(year, month - 1, day).getTime();
      }
    }

    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private compareValues(a: number | string, b: number | string, isAsc: boolean): number {
    if (typeof a === 'number' && typeof b === 'number') {
      return (a - b) * (isAsc ? 1 : -1);
    }

    return a
      .toString()
      .localeCompare(b.toString(), 'pt-BR', { numeric: true })
      * (isAsc ? 1 : -1);
  }

  private mapApiResultsToDraws(results: LotteryResult[]): LotofacilDraw[] {
    return results.map((result) => ({
      drawNumber: result.drawNumber,
      drawDate: result.drawDate,
      drawnNumbers: result.drawNumbers
        .map((num) => parseInt(num, 10))
        .filter((num) => !Number.isNaN(num))
        .sort((a, b) => a - b),
      prizes: this.mapPrizes(result.prizeTiers)
    }));
  }

  private mapPrizes(prizeTiers: PrizeTier[] | undefined): LotofacilDraw['prizes'] {
    return {
      hits15: this.getPrizeValue(prizeTiers, 1, 15),
      hits14: this.getPrizeValue(prizeTiers, 2, 14),
      hits13: this.getPrizeValue(prizeTiers, 3, 13),
      hits12: this.getPrizeValue(prizeTiers, 4, 12),
      hits11: this.getPrizeValue(prizeTiers, 5, 11)
    };
  }

  private getPrizeValue(
    prizeTiers: PrizeTier[] | undefined,
    tierIndex: number,
    hits: number
  ): number {
    if (!prizeTiers || prizeTiers.length === 0) {
      return 0;
    }

    const byHits = prizeTiers.find(
      (prizeTier) => this.getHitsFromDescription(prizeTier.description) === hits
    );
    if (byHits) {
      return byHits.prizeValue;
    }

    const byTier = prizeTiers.find((prizeTier) => prizeTier.tier === tierIndex);
    return byTier?.prizeValue ?? 0;
  }

  private getHitsFromDescription(description: string): number | null {
    const match = description.match(/(\d+)/);
    return match ? Number(match[1]) : null;
  }
}

interface LotofacilResultDetailsData {
  result: MatchResult;
  userNumbers: number[];
}

@Component({
  selector: 'app-lotofacil-result-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIcon, MatSnackBarModule],
  templateUrl: './lotofacil-result-details-dialog.component.html',
  styleUrl: './lotofacil-result-details-dialog.component.css'
})
export class LotofacilResultDetailsDialogComponent {
  readonly data = inject<LotofacilResultDetailsData>(MAT_DIALOG_DATA);
  private readonly snackBar = inject(MatSnackBar);
  readonly statusLabels = matchStatusLabels;

  getStatusLabel(status: MatchStatus): string {
    return this.statusLabels[status];
  }

  isMatched(num: number): boolean {
    return this.data.result.matchedNumbers.includes(num);
  }

  copyNumbers(numbers: number[], label: string) {
    const text = numbers.join(', ');

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.showCopiedSnack(label);
        })
        .catch(() => {
          this.fallbackCopy(text);
          this.showCopiedSnack(label);
        });
      return;
    }

    this.fallbackCopy(text);
    this.showCopiedSnack(label);
  }

  private showCopiedSnack(label: string) {
    this.snackBar.open(`${label} foram copiados`, '', {
      duration: 1500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success', 'snackbar-above-overlay']
    });
  }

  private fallbackCopy(text: string) {
    if (typeof document === 'undefined') {
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
