import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const TYPES_INDEX = [0, 1, 2, 3];

export enum TileState {
  Idle = 'idle',
  Shift = 'shift',
  Dead = 'dead',
}

interface Tile {
  row: number;
  column: number;
  type: number;
  state: TileState;
}

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info('Hello logs[3]!', { structuredData: true });
//   response.send('Hello from Firebase[3.1]!');
// });

export const OnWriteCommand = functions.database
  .ref('/commands/{uid}/{cmd_id}')
  .onWrite((change, context) => {
    const uid = context.params.uid;
    const cmd_id = context.params.cmd_id;
    const root = change.after.ref.root;

    console.log('command', { uid, cmd_id });
    functions.logger.info('command', { uid, cmd_id });

    // Exit when the data is deleted.
    if (!change.after.exists()) {
      console.log(`command was deleted ${cmd_id}`);
      // remove player state
      if (change.before.val() === 'match') {
        return cleanPlayerState(uid, root);
      }
      return null;
    }

    const command = change.after.val();

    switch (command) {
      case 'match':
        return match(uid, root);
    }

    return null;
  });

async function match(uid: string, root: admin.database.Reference) {
  await root.child(`players_states/${uid}`).set({ matching: true });

  const players =
    (await root.child('/players_states').once('value'))?.val() || {};
  console.log('players', players);

  const opponent = Object.keys(players).find((key: string) => {
    const value = players[key];
    if (key === uid || value?.matching !== true) {
      return false;
    }
    return true;
  });

  if (opponent) {
    return createGame([uid, opponent], root);
  }

  console.log('opponent', opponent);
  return null;
}

async function cleanPlayerState(uid: string, root: admin.database.Reference) {
  const state = (
    await root.child(`/players_states/${uid}`).once('value')
  )?.val();

  const updates = [];
  if (state?.gameId) {
    const game = (
      await root.child(`/games/${state.gameId}`).once('value')
    ).val();
    const oponentID = game.players.find((id: string) => id !== uid);
    updates.push(
      root
        .child(`/players_states/${oponentID}`)
        .set({ matching: true, updated: true })
    );
    updates.push(root.child(`/games/${state.gameId}`).remove());
  }
  updates.push(root.child(`/players_states/${uid}`).remove());
  return Promise.all(updates);
}

async function createGame(players: string[], root: admin.database.Reference) {
  const board = createBoard();
  const gameRef = await root.child('/games').push({ players, board });
  const gameId = gameRef.key;

  console.log('createGame', players);
  console.log('gameRef', gameRef.key, board);

  const updates = players.map((uid, index) => {
    const opponent = index === 0 ? players[1] : players[0];
    return root.child(`/players_states/${uid}`).set({ gameId, opponent });
  });

  return Promise.all(updates);
}

function getRandomType() {
  return TYPES_INDEX[Math.floor(Math.random() * TYPES_INDEX.length)];
}

function createBoard() {
  const data: Tile[][] = [];
  for (let row = 0; row < 5; row++) {
    data[row] = [];
    for (let column = 0; column < 5; column++) {
      const type = getRandomType();
      data[row][column] = { row, column, type, state: TileState.Idle };
    }
  }
  return data;
}
