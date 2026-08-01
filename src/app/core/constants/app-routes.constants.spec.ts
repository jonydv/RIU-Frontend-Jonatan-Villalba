import {
  ROUTE_PARAMS,
  ROUTE_PATHS,
  routeToHeroDetail,
  routeToHeroList,
  routeToNotFound,
} from './app-routes.constants';

describe('appRoutesConstants', () => {
  it('should derive the hero detail segment from the id route param', () => {
    expect(ROUTE_PATHS.heroDetail).toBe(`:${ROUTE_PARAMS.id}`);
  });

  it('should build the hero list url', () => {
    expect(routeToHeroList()).toBe('/heroes');
  });

  it('should build the hero detail url for a given id', () => {
    expect(routeToHeroDetail('hero-1')).toBe('/heroes/hero-1');
  });

  it('should build the not found url', () => {
    expect(routeToNotFound()).toBe('/404');
  });
});
