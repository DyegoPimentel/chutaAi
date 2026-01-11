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

export const lotofacilDraws: LotofacilDraw[] = [
  {
    drawNumber: 3001,
    drawDate: '05/01/2026',
    drawnNumbers: [1, 2, 4, 5, 7, 9, 11, 13, 15, 17, 18, 20, 22, 23, 25],
    prizes: {
      hits15: 1500000,
      hits14: 1800,
      hits13: 30,
      hits12: 12,
      hits11: 6
    }
  },
  {
    drawNumber: 3000,
    drawDate: '04/01/2026',
    drawnNumbers: [2, 3, 5, 6, 8, 10, 12, 14, 16, 17, 19, 21, 22, 24, 25],
    prizes: {
      hits15: 2000000,
      hits14: 2000,
      hits13: 35,
      hits12: 13,
      hits11: 6
    }
  },
  {
    drawNumber: 2999,
    drawDate: '03/01/2026',
    drawnNumbers: [1, 3, 4, 6, 7, 9, 11, 13, 14, 16, 18, 20, 21, 23, 25],
    prizes: {
      hits15: 1800000,
      hits14: 1900,
      hits13: 32,
      hits12: 12,
      hits11: 6
    }
  },
  {
    drawNumber: 2998,
    drawDate: '02/01/2026',
    drawnNumbers: [2, 4, 5, 7, 8, 10, 11, 13, 15, 17, 19, 20, 22, 24, 25],
    prizes: {
      hits15: 1600000,
      hits14: 1700,
      hits13: 28,
      hits12: 11,
      hits11: 5
    }
  },
  {
    drawNumber: 2997,
    drawDate: '01/01/2026',
    drawnNumbers: [1, 2, 3, 5, 7, 9, 12, 14, 15, 17, 18, 20, 21, 23, 24],
    prizes: {
      hits15: 1900000,
      hits14: 1950,
      hits13: 33,
      hits12: 12,
      hits11: 6
    }
  },
  {
    drawNumber: 2996,
    drawDate: '31/12/2025',
    drawnNumbers: [3, 4, 6, 7, 9, 10, 12, 13, 15, 16, 18, 19, 21, 23, 25],
    prizes: {
      hits15: 2100000,
      hits14: 2100,
      hits13: 36,
      hits12: 13,
      hits11: 6
    }
  },
  {
    drawNumber: 2995,
    drawDate: '30/12/2025',
    drawnNumbers: [1, 4, 5, 7, 8, 11, 12, 14, 16, 17, 19, 21, 22, 24, 25],
    prizes: {
      hits15: 1700000,
      hits14: 1750,
      hits13: 29,
      hits12: 11,
      hits11: 5
    }
  },
  {
    drawNumber: 2994,
    drawDate: '29/12/2025',
    drawnNumbers: [2, 3, 5, 6, 8, 9, 11, 13, 14, 16, 18, 20, 22, 23, 25],
    prizes: {
      hits15: 1550000,
      hits14: 1650,
      hits13: 27,
      hits12: 10,
      hits11: 5
    }
  },
  {
    drawNumber: 2993,
    drawDate: '28/12/2025',
    drawnNumbers: [1, 2, 4, 6, 7, 10, 12, 13, 15, 17, 19, 20, 21, 24, 25],
    prizes: {
      hits15: 1850000,
      hits14: 1880,
      hits13: 31,
      hits12: 12,
      hits11: 6
    }
  },
  {
    drawNumber: 2992,
    drawDate: '27/12/2025',
    drawnNumbers: [3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 22, 23, 24],
    prizes: {
      hits15: 2200000,
      hits14: 2200,
      hits13: 37,
      hits12: 14,
      hits11: 7
    }
  },
  {
    drawNumber: 2991,
    drawDate: '26/12/2025',
    drawnNumbers: [1, 3, 4, 5, 7, 9, 10, 13, 14, 16, 19, 21, 22, 24, 25],
    prizes: {
      hits15: 1650000,
      hits14: 1680,
      hits13: 28,
      hits12: 11,
      hits11: 5
    }
  },
  {
    drawNumber: 2990,
    drawDate: '25/12/2025',
    drawnNumbers: [2, 4, 5, 6, 8, 10, 11, 13, 15, 16, 18, 19, 21, 23, 25],
    prizes: {
      hits15: 1750000,
      hits14: 1770,
      hits13: 30,
      hits12: 12,
      hits11: 6
    }
  },
  {
    drawNumber: 2989,
    drawDate: '24/12/2025',
    drawnNumbers: [1, 2, 3, 6, 7, 9, 12, 14, 16, 17, 19, 20, 22, 23, 24],
    prizes: {
      hits15: 1950000,
      hits14: 1990,
      hits13: 34,
      hits12: 13,
      hits11: 6
    }
  },
  {
    drawNumber: 2988,
    drawDate: '23/12/2025',
    drawnNumbers: [3, 4, 5, 7, 8, 10, 11, 13, 14, 16, 18, 21, 22, 24, 25],
    prizes: {
      hits15: 1600000,
      hits14: 1620,
      hits13: 27,
      hits12: 10,
      hits11: 5
    }
  },
  {
    drawNumber: 2987,
    drawDate: '22/12/2025',
    drawnNumbers: [1, 3, 5, 6, 9, 11, 12, 15, 17, 18, 19, 20, 21, 23, 25],
    prizes: {
      hits15: 2300000,
      hits14: 2350,
      hits13: 39,
      hits12: 15,
      hits11: 7
    }
  },
  {
    drawNumber: 2986,
    drawDate: '21/12/2025',
    drawnNumbers: [2, 4, 6, 7, 8, 9, 10, 12, 14, 16, 17, 19, 22, 24, 25],
    prizes: {
      hits15: 1700000,
      hits14: 1730,
      hits13: 29,
      hits12: 11,
      hits11: 5
    }
  },
  {
    drawNumber: 2985,
    drawDate: '20/12/2025',
    drawnNumbers: [1, 2, 4, 5, 7, 10, 11, 13, 15, 18, 19, 21, 22, 23, 25],
    prizes: {
      hits15: 1800000,
      hits14: 1850,
      hits13: 31,
      hits12: 12,
      hits11: 6
    }
  },
  {
    drawNumber: 2984,
    drawDate: '19/12/2025',
    drawnNumbers: [3, 5, 6, 8, 9, 11, 13, 14, 16, 17, 18, 20, 21, 23, 24],
    prizes: {
      hits15: 1900000,
      hits14: 1920,
      hits13: 32,
      hits12: 12,
      hits11: 6
    }
  },
  {
    drawNumber: 2983,
    drawDate: '18/12/2025',
    drawnNumbers: [1, 3, 4, 6, 7, 9, 10, 12, 14, 15, 17, 19, 20, 22, 25],
    prizes: {
      hits15: 1550000,
      hits14: 1580,
      hits13: 26,
      hits12: 10,
      hits11: 5
    }
  },
  {
    drawNumber: 2982,
    drawDate: '17/12/2025',
    drawnNumbers: [2, 4, 5, 7, 8, 11, 13, 15, 16, 18, 19, 21, 22, 24, 25],
    prizes: {
      hits15: 2000000,
      hits14: 2050,
      hits13: 35,
      hits12: 13,
      hits11: 6
    }
  }
];
