export * from './board';
export * from './position';
export * from './store';
export * from './tile';

export enum Colors {
  Blue = '#2C76F5',
  Red = '#F50C20',
  Pink = '#D95ADB',
  Yellow = '#FADE2A',
  Grey = '#999',
}

export enum Monsters {
  Unicorn = 'assets/monsters/unicorn/Unicorn_1.png',
  Pig = 'assets/monsters/pig/Pig_1.png',
  Rabbit = 'assets/monsters/rabbit/Rabbit_1.png',
  Spider = 'assets/monsters/spider/01.png',
  Lizard = 'assets/monsters/lizard/Lizard_1.png',
  Octopus = 'assets/monsters/octopus/Octopus_1.png',
  Owl = 'assets/monsters/owl/Owl_1.png',
  Sheep = 'assets/monsters/sheep/Sheep_1.png',
  Cat = 'assets/monsters/cat/Cat_1.png',

  // Rainbow = 'assets/monsters/rainbow/Rainbow_1.png',
  // Dragon = 'assets/monsters/dragon/Head_1.png',
}

export enum PowerUps {
  VerticalArrow = 'vertical_arrow',
  HorizontalArrow = 'horizontal_arrow',
  Star = 'star',
  Axe = 'axe',
}

export interface PowerUp {
  value: number;
  type: PowerUps;
}

export interface Level {
  moves: number;
  score: number;
  current: number;
  target: {
    type: string;
    remain: number;
  }[];
  tiles: number[][];
  types: number[];
  complete?: boolean;
}

export interface MultiplayerPlayer {
  uid: string;
  displayName: string;
  life: number;
  ready?: boolean;
}

export interface MultiplayerData {
  turn?: 'player' | 'opponent';
  gameId?: string;
  opponent?: MultiplayerPlayer;
  player?: MultiplayerPlayer;
}
