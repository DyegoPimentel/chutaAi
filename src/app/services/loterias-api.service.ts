import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export type LotteryId =
  | 'diadesorte'
  | 'duplasena'
  | 'federal'
  | 'lotofacil'
  | 'lotomania'
  | 'maismilionaria'
  | 'megasena'
  | 'quina'
  | 'supersete'
  | 'timemania';

export interface WinnerState {}

type WinnerCityStateApi = Record<string, unknown>;
type PrizeTierApi = Record<string, unknown>;
type LotteryResultApi = Record<string, unknown>;

export interface WinnerCityState {
  winners: number;
  city: string;
  fantasyNameUL: string;
  position: number;
  series: string;
  stateCode: string;
}

export interface PrizeTier {
  description: string;
  tier: number;
  winners: number;
  prizeValue: number;
}

export interface LotteryResult {
  accumulated: boolean;
  drawNumber: number;
  drawDate: string;
  nextDrawDate: string;
  drawNumbers: string[];
  drawOrderNumbers?: string[];
  awardedStates?: WinnerState[];
  location?: string;
  winnerLocations?: WinnerCityState[];
  lotteryId: LotteryId;
  luckyMonth?: string | null;
  notes?: string;
  prizeTiers?: PrizeTier[];
  nextDrawNumber?: number;
  luckyTeam?: string | null;
  clovers?: string[];
  specialAccumulatedValue?: number;
  accumulatedValue_0_5?: number;
  nextDrawAccumulatedValue?: number;
  totalCollectedValue?: number;
  nextDrawEstimatedValue?: number;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function toOptionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((item): item is string => typeof item === 'string');
}

@Injectable({
  providedIn: 'root'
})
export class LotteriesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://loteriascaixa-api.herokuapp.com/api';

  getLotteries(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}`);
  }

  getResultsByLottery(lottery: LotteryId): Observable<LotteryResult[]> {
    return this.http
      .get<LotteryResultApi[]>(`${this.baseUrl}/${lottery}`)
      .pipe(map((results) => results.map((result) => this.mapApiResult(result))));
  }

  getLatestResult(lottery: LotteryId): Observable<LotteryResult> {
    return this.http
      .get<LotteryResultApi>(`${this.baseUrl}/${lottery}/latest`)
      .pipe(map((result) => this.mapApiResult(result)));
  }

  getResultByDrawNumber(lottery: LotteryId, drawNumber: number): Observable<LotteryResult> {
    return this.http
      .get<LotteryResultApi>(`${this.baseUrl}/${lottery}/${drawNumber}`)
      .pipe(map((result) => this.mapApiResult(result)));
  }

  private mapApiResult(result: LotteryResultApi): LotteryResult {
    const api = result as Record<string, unknown>;
    const winnerLocations = Array.isArray(api['localGanhadores'])
      ? (api['localGanhadores'] as WinnerCityStateApi[]).map((location) =>
          this.mapWinnerLocation(location)
        )
      : undefined;
    const prizeTiers = Array.isArray(api['premiacoes'])
      ? (api['premiacoes'] as PrizeTierApi[]).map((tier) => this.mapPrizeTier(tier))
      : undefined;

    return {
      accumulated: Boolean(api['acumulou']),
      drawNumber: Number(api['concurso'] ?? 0),
      drawDate: String(api['data'] ?? ''),
      nextDrawDate: String(api['dataProximoConcurso'] ?? ''),
      drawNumbers: toStringArray(api['dezenas']),
      drawOrderNumbers: toOptionalStringArray(api['dezenasOrdemSorteio']),
      awardedStates: api['estadosPremiados'] as WinnerState[] | undefined,
      location: api['local'] as string | undefined,
      winnerLocations,
      lotteryId: api['loteria'] as LotteryId,
      luckyMonth: api['mesSorte'] as string | null | undefined,
      notes: api['observacao'] as string | undefined,
      prizeTiers,
      nextDrawNumber: api['proximoConcurso'] as number | undefined,
      luckyTeam: api['timeCoracao'] as string | null | undefined,
      clovers: toOptionalStringArray(api['trevos']),
      specialAccumulatedValue: api['valorAcumuladoConcursoEspecial'] as number | undefined,
      accumulatedValue_0_5: api['valorAcumuladoConcurso_0_5'] as number | undefined,
      nextDrawAccumulatedValue: api['valorAcumuladoProximoConcurso'] as number | undefined,
      totalCollectedValue: api['valorArrecadado'] as number | undefined,
      nextDrawEstimatedValue: api['valorEstimadoProximoConcurso'] as number | undefined
    };
  }

  private mapPrizeTier(tier: PrizeTierApi): PrizeTier {
    const apiTier = tier as Record<string, unknown>;
    return {
      description: String(apiTier['descricao'] ?? ''),
      tier: Number(apiTier['faixa'] ?? 0),
      winners: Number(apiTier['ganhadores'] ?? 0),
      prizeValue: Number(apiTier['valorPremio'] ?? 0)
    };
  }

  private mapWinnerLocation(location: WinnerCityStateApi): WinnerCityState {
    const apiLocation = location as Record<string, unknown>;
    return {
      winners: Number(apiLocation['ganhadores'] ?? 0),
      city: String(apiLocation['municipio'] ?? ''),
      fantasyNameUL: String(apiLocation['nomeFatansiaUL'] ?? ''),
      position: Number(apiLocation['posicao'] ?? 0),
      series: String(apiLocation['serie'] ?? ''),
      stateCode: String(apiLocation['uf'] ?? '')
    };
  }
}
