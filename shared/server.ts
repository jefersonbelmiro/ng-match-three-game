import { Tile, Position, matchesToUpdate, apply, fill, from } from './board';
import { find } from './find';

export interface Player {
  id: string;
  displayName?: string;
  ready?: boolean;
  life?: number;
}

export interface PlayerState {
  matching?: boolean;
  match?: boolean;
  gameId?: string;
  opponent?: Player;
}

export interface Game {
  id: string;
  players: Player[];
  turnId?: string;
  winnerId?: string;
  updates?: any[];
  pool?: number[];
  board?: number[][];
}

export interface Update {
  type: 'shift' | 'die' | 'new' | 'fill' | 'powerup';
  ownerId?: string;
  target?: Position;
  source?: Tile;
  timestamp?: number;
  data?: Update[];
}

export interface Command {
  command: string;
}

export function playerDamage(matches: number) {
  let damage = matches * 10;
  if (matches > 3) {
    damage += (matches - 3) * 10;
  }
  if (matches > 5) {
    damage += (matches - 3) * 5;
  }
  return damage;
}

export function processMatchesFactory(
  board: number[][],
  pool: number[],
  options?: {
    ownerId?: string;
    timestamp?: number;
  }
) {
  let _board = from(board);
  const { ownerId, timestamp } = options || {};
  return function processMatches(matches: Tile[]) {
    const updates: Update[] = [];

    const updatesDie = matchesToUpdate(matches);
    _board = apply(updatesDie, _board);

    const updatesFill = fill(_board, pool);
    _board = apply(updatesFill, _board);

    updates.push({
      type: 'die',
      data: updatesDie,
      ownerId,
      timestamp,
    });
    updates.push({
      type: 'fill',
      data: updatesFill,
      ownerId,
      timestamp,
    });

    const newMatches = find(_board);
    if (newMatches.length) {
      const { updates: newUpdates } = processMatches(newMatches);
      updates.push(...newUpdates);
    }

    return { board: _board, updates };
  };
}
