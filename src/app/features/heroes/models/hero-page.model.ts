export interface HeroQuery {
  readonly search: string;
  readonly page: number;
  readonly size: number;
}

export interface HeroPage<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly size: number;
}
