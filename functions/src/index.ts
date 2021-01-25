import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {
  apply,
  createBoard,
  createPool,
  fill,
  matchesToUpdate,
  shift,
  Tile,
} from './../../shared/board';
import { find } from './../../shared/find';
import { Game, playerDamage, PlayerState, Update } from './../../shared/server';

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

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info('Hello logs[3]!', { structuredData: true });
//   response.send('Hello from Firebase[3.1]!');
// });

export const OnWriteCommand = functions.database
  .ref('/commands/{id}/{cmd_id}')
  .onWrite((change, context) => {
    const id = context.params.id;
    const cmd_id = context.params.cmd_id;
    const root = change.after.ref.root;

    // Exit when the data is deleted.
    if (!change.after.exists()) {
      const beforeValue = change.before.val();
      console.log(`command was deleted ${cmd_id}`, beforeValue);
      // remove player state
      if (beforeValue?.command === 'match') {
        return cleanPlayerState(id, root);
      }
      return null;
    }

    const value = change.after.val();
    const command = value.command;

    console.log('command', { id, cmd_id, command_value: value });
    functions.logger.info('command', { id, cmd_id, command_value: value });

    switch (command) {
      case 'match':
        return onMatch(id, root);
      case 'ready':
        return onReady(id, value, root);
      case 'shift':
        return onShift(id, value, root);
    }

    return null;
  });

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
  return root.child(`/games/${gameId}`).transaction((state) => {
    if (!state) {
      return null;
    }

    const player = state.players.find((item: { id: string }) => {
      return item.id === id;
    });
    player.ready = true;

    const allReady = state.players.every((item: { ready: boolean }) => {
      return item.ready;
    });
    if (allReady) {
      state.board = createBoard();
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
    const pool = state.pool || [];
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
      const processMatches = processMatchesFactory(id, timestamp, pool);
      const [boardUpdated, newUpdates] = processMatches(matches, board);

      updates.push(...newUpdates);
      board = boardUpdated;

      let damage = 0;
      newUpdates.forEach((item) => {
        if (item.type === 'die') {
          damage += item.data?.length || 1;
        }
      });
      console.log('damage', damage);
      const opponent = state.players.find(
        (player) => player.id === state.turnId
      );
      if (opponent?.life) {
        opponent.life -= playerDamage(damage);
      }
      if (opponent?.life !== undefined && opponent.life <= 0) {
        state.winnerId = id;
        state.turnId = '';
        setTimeout(() => onGameEnd(state, root), 1500);
      }
    }

    state.updates = updates;
    state.board = board;
    state.players = state.players;

    if (pool.length < 50) {
      state.pool = [...pool, ...createPool(50)];
    }

    return state;
  });
}

function onGameEnd(state: Game, root: admin.database.Reference) {
  const playerStates = (state.players || []).map((player) => {
    return root
      .child(`/players_states/${player.id}`)
      .transaction((playerState) => {
        if (!playerState) {
          return null;
        }
        playerState.match = false;
        playerState.matching = false;
        playerState.gameId = null;
        return playerState;
      });
  });
  const commands = (state.players || []).map((player) => {
    return root.child(`/commands/${player.id}`).remove();
  });
  const game = root.child(`/games/${state.id}`).remove();
  const updates = playerStates.concat(commands).concat(game);
  return Promise.all(updates);
}

async function cleanPlayerState(id: string, root: admin.database.Reference) {
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
  return Promise.all(updates);
}

async function createGame(
  playersIds: string[],
  root: admin.database.Reference
) {
  const players = playersIds.map((id) => {
    return {
      id,
      ready: false,
      life: 500,
    };
  });
  const pool = createPool();
  const turnId = playersIds[Math.floor(Math.random() * players.length)];
  const gameRef = await root.child('/games').push();
  const gameId = gameRef.key;
  await gameRef.set({ id: gameId, players, turnId, pool });

  console.log('createGame', gameId, players);

  const updates = playersIds.map((id) => {
    return root
      .child(`/players_states/${id}`)
      .set({ gameId, matching: false, match: true });
  });

  return Promise.all(updates);
}

function processMatchesFactory(
  ownerId: string,
  timestamp: number,
  pool: number[]
) {
  return function processMatches(
    matches: Tile[],
    boardData: number[][]
  ): [number[][], Update[]] {
    const updates: Update[] = [];
    let board = boardData;

    const updatesDie = matchesToUpdate(matches);
    board = apply(updatesDie, board);

    const updatesFill = fill(board, pool);
    board = apply(updatesFill, board);

    updates.push({
      type: 'die',
      ownerId,
      data: updatesDie,
      timestamp,
    });
    updates.push({
      type: 'fill',
      ownerId,
      data: updatesFill,
      timestamp,
    });

    const newMatches = find(board);
    if (newMatches.length) {
      const [newBoardUpdated, newUpdates] = processMatches(newMatches, board);
      board = newBoardUpdated;
      updates.push(...newUpdates);
    }

    return [board, updates];
  };
}
