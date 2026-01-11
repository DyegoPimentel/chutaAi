import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-simulator-page',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './simulator-page.component.html',
  styleUrl: './simulator-page.component.css'
})
export class SimulatorPageComponent {}
