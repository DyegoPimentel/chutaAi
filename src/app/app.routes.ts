import { Routes } from '@angular/router';
import { FavoritesListComponent } from './pages/favorites-list/favorites-list.component';
import { GamePlaceholderComponent } from './pages/game-placeholder/game-placeholder.component';
import { LotofacilResultsComponent } from './pages/lotofacil-results/lotofacil-results.component';
import { LotofacilSimulatorComponent } from './pages/lotofacil-simulator/lotofacil-simulator.component';
import { SimulatorIntroComponent } from './pages/simulator-intro/simulator-intro.component';
import { SimulatorPageComponent } from './pages/simulator-page/simulator-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'simulador-apostas-passada'
  },
  {
    path: 'simulador-apostas-passada',
    component: SimulatorPageComponent,
    children: [
      {
        path: '',
        component: SimulatorIntroComponent
      },
      {
        path: 'lotofacil/resultado',
        component: LotofacilResultsComponent
      },
      {
        path: 'lotofacil',
        component: LotofacilSimulatorComponent
      },
      {
        path: ':game/resultado',
        component: GamePlaceholderComponent
      },
      {
        path: ':game',
        component: GamePlaceholderComponent
      }
    ]
  },
  {
    path: 'favoritos',
    component: FavoritesListComponent
  },
  {
    path: '**',
    redirectTo: 'simulador-apostas-passada'
  }
];
