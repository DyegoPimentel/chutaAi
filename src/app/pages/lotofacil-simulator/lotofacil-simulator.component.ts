import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SimulatorStateService } from '../../services/simulator-state.service';

@Component({
  selector: 'app-lotofacil-simulator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lotofacil-simulator.component.html',
  styleUrl: './lotofacil-simulator.component.css'
})
export class LotofacilSimulatorComponent {
  private readonly router = inject(Router);
  private readonly simulatorState = inject(SimulatorStateService);

  selectedNumbers: number[] = [];
  inputValue = '';
  readonly numbers = Array.from({ length: 25 }, (_, index) => index + 1);
  readonly betCountOptions = [15, 16, 17, 18, 19, 20];
  selectedBetCount = 15;

  handleNumberClick(num: number) {
    if (this.selectedNumbers.includes(num)) {
      this.selectedNumbers = this.selectedNumbers.filter((value) => value !== num);
      return;
    }

    if (this.selectedNumbers.length < this.selectedBetCount) {
      this.selectedNumbers = [...this.selectedNumbers, num].sort((a, b) => a - b);
    }
  }

  handleInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue = value;

    const numbers = value
      .split(/[\s,]+/)
      .map((item) => parseInt(item.trim(), 10))
      .filter((num) => !Number.isNaN(num) && num >= 1 && num <= 25);

    const sortedNumbers = numbers.sort((a, b) => a - b);
    this.selectedNumbers = sortedNumbers.slice(0, this.selectedBetCount);
  }

  handleBetCountChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);

    if (Number.isNaN(value)) {
      return;
    }

    this.selectedBetCount = value;

    if (this.selectedNumbers.length > value) {
      this.selectedNumbers = this.selectedNumbers.slice(0, value);
      this.inputValue = this.selectedNumbers.join(', ');
    }
  }

  completeGame() {
    if (this.selectedNumbers.length >= this.selectedBetCount) {
      return;
    }

    const availableNumbers = new Set(this.selectedNumbers);

    while (availableNumbers.size < this.selectedBetCount) {
      const randomNumber = Math.floor(Math.random() * 25) + 1;
      availableNumbers.add(randomNumber);
    }

    this.applySelection(Array.from(availableNumbers));
  }

  randomizeGame() {
    const availableNumbers = new Set<number>();

    while (availableNumbers.size < this.selectedBetCount) {
      const randomNumber = Math.floor(Math.random() * 25) + 1;
      availableNumbers.add(randomNumber);
    }

    this.applySelection(Array.from(availableNumbers));
  }

  private applySelection(numbers: number[]) {
    this.selectedNumbers = numbers.sort((a, b) => a - b);
    this.inputValue = this.selectedNumbers.join(', ');
  }

  handleClear() {
    this.selectedNumbers = [];
    this.inputValue = '';
  }

  handleSubmit(event: Event) {
    event.preventDefault();

    if (!this.isValid) {
      return;
    }

    this.simulatorState.setBet(this.selectedNumbers);
    this.router.navigate(['/simulador-apostas-passada/lotofacil/resultado']);
  }

  get isValid(): boolean {
    return this.selectedNumbers.length === this.selectedBetCount;
  }
}
