import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { createBoard, createPool, shift } from './../../shared/board';
import { find } from './../../shared/find';
import {
  Game,
  Player,
  playerDamage,
  PlayerState,
  processMatchesFactory,
} from './../../shared/server';

interface ShiftPayload {
  gameId: string;
  source: {
    row: number;
    column: number;
  };
  target: {
    row: number;
    column: number;
  };
}

interface ReadyPayload {
  gameId: string;
}

export const OnCreateCommand = functions.database
  .ref('/commands/{id}/{cmd_id}')
  .onCreate((snapshot, context) => {
    const id = context.params.id;
    const cmd_id = context.params.cmd_id;
    const root = snapshot.ref.root;

    const value = snapshot.val();
    const command = value.command;

    console.log('command', { id, cmd_id, command_value: value });
    functions.logger.info('command', { id, cmd_id, command_value: value });

    switch (command) {
      case 'match':
        return onMatch(id, root);
      case 'cancelMatch':
        return onCancelMatch(id, root);
      case 'ready':
        return onReady(id, value, root);
      case 'shift':
        return onShift(id, value, root);
      case 'exit':
        return onExit(id, root);
      case 'gameEnd':
        return onGameEnd(id, root);
    }

    return null;
  });

async function onGameEnd(id: string, root: admin.database.Reference) {
  const playerState = (
    await root.child(`/players_states/${id}`).once('value')
  )?.val() as PlayerState;

  const updates = [];
  if (playerState?.gameId) {
    const game = (
      await root.child(`/games/${playerState.gameId}`).once('value')
    ).val();
    const opponent = game.players.find(
      (player: { id: string }) => player.id !== id
    );

    const opponentState = (
      await root.child(`/players_states/${opponent.id}`).once('value')
    )?.val() as PlayerState;

    if (!opponentState?.gameId) {
      // remove game
      updates.push(root.child(`/games/${playerState.gameId}`).remove());
    }
  }

  updates.push(
    root.child(`/players_states/${id}`).transaction((state) => {
      if (!state) {
        return null;
      }
      state.match = false;
      state.matching = false;
      state.gameId = null;
      return state;
    })
  );

  updates.push(root.child(`/commands/${id}`).remove());
  return Promise.all(updates);
}

async function onExit(id: string, root: admin.database.Reference) {
  const playerState = (
    await root.child(`/players_states/${id}`).once('value')
  )?.val() as PlayerState;

  const updates = [];
  if (playerState?.gameId) {
    const game = (
      await root.child(`/games/${playerState.gameId}`).once('value')
    ).val();
    const opponent = game.players.find(
      (player: { id: string }) => player.id !== id
    );

    // set opponent to matching again
    updates.push(
      root.child(`/players_states/${opponent.id}`).transaction((state) => {
        if (!state || state.match === false) {
          return null;
        }
        if (state.match) {
          state.match = false;
          state.matching = true;
          state.gameId = null;
          return state;
        }
        return null;
      })
    );

    // remove game
    updates.push(root.child(`/games/${playerState.gameId}`).remove());
  }
  updates.push(root.child(`/players_states/${id}`).remove());
  updates.push(root.child(`/commands/${id}`).remove());
  return Promise.all(updates);
}

async function onCancelMatch(id: string, root: admin.database.Reference) {
  const playerState = (
    await root.child(`/players_states/${id}`).once('value')
  )?.val() as PlayerState;

  const updates = [];
  if (playerState?.gameId) {
    const game = (
      await root.child(`/games/${playerState.gameId}`).once('value')
    ).val();
    const opponent = game.players.find(
      (player: { id: string }) => player.id !== id
    );

    // set opponent to matching again
    updates.push(
      root.child(`/players_states/${opponent.id}`).transaction((state) => {
        if (!state) {
          return null;
        }
        if (state.match) {
          state.match = false;
          state.matching = true;
          state.gameId = null;
        }
        return state;
      })
    );

    // remove game
    updates.push(root.child(`/games/${playerState.gameId}`).remove());
  }
  updates.push(root.child(`/players_states/${id}`).remove());
  updates.push(root.child(`/commands/${id}`).remove());
  return Promise.all(updates);
}

async function onMatch(id: string, root: admin.database.Reference) {
  await root.child(`players_states/${id}`).set({ matching: true });

  const players =
    (await root.child('/players_states').once('value'))?.val() || {};

  console.log('players', players);

  const opponent = Object.keys(players).find((key: string) => {
    const player = players[key] as PlayerState;
    if (key === id || player?.matching !== true) {
      return false;
    }
    return true;
  });

  if (opponent) {
    return createGame([id, opponent], root);
  }

  console.log('opponent', opponent);
  return null;
}

async function onReady(
  id: string,
  { gameId }: ReadyPayload,
  root: admin.database.Reference
) {
  return root.child(`/games/${gameId}`).transaction((state: Game) => {
    if (!state) {
      return null;
    }

    const player: Player = state.players.find((item) => item.id === id)!;
    player.ready = true;

    const allReady = state.players.every((item) => item.ready);

    if (allReady) {
      state.board = createBoard();
      state.pool = {};
      state.players.forEach((item) => {
        (state.pool as any)[item.id] = createPoolList();
      });
      console.log('onReady: all ready', state);
    }
    return state;
  });
}

async function onShift(
  id: string,
  payload: ShiftPayload,
  root: admin.database.Reference
) {
  const { gameId } = payload;
  return root.child(`/games/${gameId}`).transaction((state: Game) => {
    if (!state) {
      return null;
    }

    const timestamp = Date.now();
    const { source, target } = payload;
    const updates = state.updates || [];
    const pool = state.pool || {};
    let board = state.board || [];

    board = shift(source, target, board);
    const matches = find(board);

    state.turnId = state.players.find(
      (player) => player.id !== state.turnId
    )?.id;

    updates.push({
      type: 'shift',
      ownerId: id,
      source,
      target,
      timestamp,
    });

    if (matches?.length) {
      const poolType = pool[id].map((item) => item.value);
      const processMatches = processMatchesFactory(board, poolType, {
        ownerId: id,
        timestamp,
      });
      const { board: boardUpdated, updates: newUpdates } = processMatches(
        matches
      );

      // update removed index from processMatches
      while (pool[id].length > poolType.length) {
        pool[id].shift();
      }

      updates.push(...newUpdates);
      board = boardUpdated;

      let damage = 0;
      newUpdates.forEach((item) => {
        if (item.type === 'die') {
          damage += playerDamage(item.data?.length || 0);
        }
      });
      const opponent = state.players.find(
        (player) => player.id === state.turnId
      );
      if (opponent?.life) {
        opponent.life -= damage;
      }
      if (opponent?.life !== undefined && opponent.life <= 0) {
        opponent.life = 0;
        state.winnerId = id;
        state.turnId = '';
      }
      console.log('damage', {
        damage,
        opponentLife: opponent?.life,
        winnerId: state.winnerId,
      });
    }

    if (pool[id].length < 50) {
      pool[id].push(...createPoolList({ offset: pool[id].length }));
    }

    state.updates = updates;
    state.board = board;
    state.players = state.players;
    state.pool = pool;

    return state;
  });
}

function createPoolList(options?: { length?: number; offset?: number }) {
  const { length = 100, offset = 0 } = options || {};
  const timestamp = Date.now();
  return createPool(length).map((value, index) => {
    return { index: offset + index, value, timestamp };
  });
}

async function createGame(
  playersIds: string[],
  root: admin.database.Reference
) {
  const players = playersIds.map((id) => {
    return {
      id,
      ready: false,
      life: 666,
    };
  });
  const turnId = playersIds[Math.floor(Math.random() * players.length)];
  const gameRef = await root.child('/games').push();
  const gameId = gameRef.key;
  await gameRef.set({ id: gameId, players, turnId });

  console.log('createGame', gameId, players, turnId);

  const updates = playersIds.map((id) => {
    return root
      .child(`/players_states/${id}`)
      .set({ gameId, matching: false, match: true });
  });

  return Promise.all(updates);
}
