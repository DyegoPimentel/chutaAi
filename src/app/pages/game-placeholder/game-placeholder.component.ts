import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-game-placeholder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-placeholder.component.html',
  styleUrl: './game-placeholder.component.css'
})
export class GamePlaceholderComponent implements OnInit {
  game = '';
  view: 'simulator' | 'results' = 'simulator';

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit() {
    this.game = this.route.snapshot.paramMap.get('game') ?? '';
    this.view = this.router.url.includes('/resultado') ? 'results' : 'simulator';
  }

  get displayName(): string {
    if (!this.game) {
      return 'Jogo';
    }
    return this.game.charAt(0).toUpperCase() + this.game.slice(1);
  }
}
