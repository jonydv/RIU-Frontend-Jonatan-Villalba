import { TestBed } from '@angular/core/testing';
import { HeroEventsService } from './hero-events.service';
import { HERO_EVENT_TYPE } from '../../features/heroes/constants/hero-event.constants';
import { HERO_PUBLISHERS } from '../../features/heroes/constants/hero.constants';
import type { Hero } from '../../features/heroes/models/hero.model';
import type { HeroEvent } from '../../features/heroes/models/hero-event.model';

const HERO: Hero = {
  id: 'hero-1',
  name: 'SUPERMAN',
  alterEgo: 'Clark Kent',
  imageUrl: null,
  publisher: HERO_PUBLISHERS.dc,
  powers: ['Vuelo'],
  powerLevel: 99,
  firstAppearance: '1938-06-01',
  active: true,
};

function create(): HeroEventsService {
  TestBed.configureTestingModule({});

  return TestBed.inject(HeroEventsService);
}

describe('HeroEventsService', () => {
  it('should emit events to subscribers', () => {
    const service = create();
    const received: HeroEvent[] = [];
    service.events$.subscribe((event) => received.push(event));

    service.emit({ type: HERO_EVENT_TYPE.created, hero: HERO });
    service.emit({ type: HERO_EVENT_TYPE.deleted, heroId: HERO.id });

    expect(received).toEqual([
      { type: HERO_EVENT_TYPE.created, hero: HERO },
      { type: HERO_EVENT_TYPE.deleted, heroId: HERO.id },
    ]);
  });

  it('should not replay events emitted before subscribing', () => {
    const service = create();

    service.emit({ type: HERO_EVENT_TYPE.updated, hero: HERO });

    const received: HeroEvent[] = [];
    service.events$.subscribe((event) => received.push(event));

    expect(received).toEqual([]);
  });
});
