export const ROUTE_PARAMS = {
  id: 'id',
} as const;

export const ROUTE_PATHS = {
  root: '',
  heroes: 'heroes',
  heroDetail: `:${ROUTE_PARAMS.id}`,
  notFound: '404',
  wildcard: '**',
} as const;

export function routeToHeroList(): string {
  return `/${ROUTE_PATHS.heroes}`;
}

export function routeToHeroDetail(heroId: string): string {
  return `/${ROUTE_PATHS.heroes}/${heroId}`;
}

export function routeToNotFound(): string {
  return `/${ROUTE_PATHS.notFound}`;
}
