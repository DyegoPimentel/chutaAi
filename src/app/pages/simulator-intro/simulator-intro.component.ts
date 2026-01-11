import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-simulator-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulator-intro.component.html',
  styleUrl: './simulator-intro.component.css'
})
export class SimulatorIntroComponent {
  readonly gameOptions = [
    'maismilionaria',
    'megasena',
    'lotofacil',
    'quina',
    'lotomania',
    'timemania',
    'duplasena',
    'federal',
    'diadesorte',
    'supersete'
  ];

  selectedGame = '';

  private readonly gameLabelMap: Record<string, string> = {
    maismilionaria: 'Mais Milionária',
    megasena: 'Mega-Sena',
    lotofacil: 'Lotofácil',
    quina: 'Quina',
    lotomania: 'Lotomania',
    timemania: 'Timemania',
    duplasena: 'Dupla Sena',
    federal: 'Federal',
    diadesorte: 'Dia de Sorte',
    supersete: 'Super Sete'
  };

  private readonly router = inject(Router);

  getGameLabel(game: string): string {
    return this.gameLabelMap[game] ?? game;
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
