import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { Game, PlayerState } from './../../shared/server';
import {
  apply,
  createBoard,
  createPool,
  fill,
  matchesToUpdate,
  shift,
} from './../../shared/board';
import { find } from './../../shared/find';

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

    console.group('board udpate');
    console.log('-- previous', board);

    board = shift(source, target, board);
    const matches = find(board, target);

    console.log('-- current', board);
    console.log('-- matches', matches.length);
    console.groupEnd();

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
      const updatesDie = matchesToUpdate(matches);
      const updatesFill = fill(board, pool);
      // update current board
      board = apply(updatesDie, board);
      board = apply(updatesFill, board);
      // story list of updates
      updates.push(...updatesDie);
      updates.push(...updatesFill);
    }

    state.updates = updates;
    state.board = board;
    state.pool = pool;

    console.log('onShift updates', updates);

    return state;
  });
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
      life: 2000,
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
