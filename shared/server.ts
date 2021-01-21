export const TYPES_INDEX = [0, 1, 2, 3];

export interface Position {
  row: number;
  column: number;
}

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
  board?: number[][];
}

export interface Update {
  type: 'shift' | 'die' | 'powerup';
  ownerId: string;
  target: Position;
  source?: Position;
  timestamp?: number;
}

export interface Command {
  command: string;
}

