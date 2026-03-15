// Mock data de apostas passadas da Lotofácil
export interface LotofacilDraw {
  drawNumber: number;
  drawDate: string;
  drawnNumbers: number[];
  prizes: {
    hits15: number;
    hits14: number;
    hits13: number;
    hits12: number;
    hits11: number;
  };
}
