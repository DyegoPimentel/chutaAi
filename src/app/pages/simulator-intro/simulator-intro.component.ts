import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { getLotteryLabel, lotteryOptions } from '../../interfaces/global';

@Component({
  selector: 'app-simulator-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulator-intro.component.html',
  styleUrl: './simulator-intro.component.css'
})
export class SimulatorIntroComponent {
  readonly gameOptions = lotteryOptions;

  selectedGame = '';

  private readonly router = inject(Router);

  getGameLabel(game: string): string {
    return getLotteryLabel(game);
  }

  onGameChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedGame = value;

    if (!value) {
      return;
    }

    this.router.navigate(['/simulador-apostas-passada', value]);
  }
}
