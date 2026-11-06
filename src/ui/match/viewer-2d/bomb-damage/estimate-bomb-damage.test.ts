import { describe, it, expect } from 'vite-plus/test';
import { estimateBombDamage, BOMB_DAMAGE_FALLOFF_DISTANCE } from './estimate-bomb-damage';

describe('estimateBombDamage', () => {
  const lethalReach = 1795; // Mirage A site

  it('should be lethal up to the lethal reach', () => {
    expect(estimateBombDamage(0, lethalReach)).toBe(100);
    expect(estimateBombDamage(1000, lethalReach)).toBe(100);
    expect(estimateBombDamage(lethalReach, lethalReach)).toBe(100);
  });

  it('should lose 100 HP over the falloff distance whatever the lethal reach', () => {
    expect(estimateBombDamage(lethalReach + 900, lethalReach)).toBe(50);
    expect(estimateBombDamage(2228 + 900, 2228)).toBe(50); // Mirage B site
    expect(estimateBombDamage(lethalReach + 1434, lethalReach)).toBe(20);
  });

  it('should truncate the damage', () => {
    expect(estimateBombDamage(lethalReach + 10, lethalReach)).toBe(99);
    expect(estimateBombDamage(lethalReach + 1660, lethalReach)).toBe(7);
  });

  it('should reach 0 at the end of the falloff', () => {
    expect(estimateBombDamage(lethalReach + BOMB_DAMAGE_FALLOFF_DISTANCE, lethalReach)).toBe(0);
    expect(estimateBombDamage(10000, lethalReach)).toBe(0);
  });
});
