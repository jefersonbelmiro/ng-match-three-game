import { Tile, Position } from './board';

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
  updates?: any[];
  pool?: number[];
  board?: number[][];
}

export interface Update {
  type: 'shift' | 'die' | 'powerup';
  ownerId: string;
  target: Position | Position[];
  source?: Tile;
  timestamp?: number;
}

export interface Command {
  command: string;
}

