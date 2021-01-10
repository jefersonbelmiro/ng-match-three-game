import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const TYPES_INDEX = [0, 1, 2, 3];

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

    // Exit when the data is deleted.
    if (!change.after.exists()) {
      const value = change.before.val();
      console.log(`command was deleted ${cmd_id}`, value);
      // remove player state
      if (value?.command === 'match') {
        return cleanPlayerState(uid, root);
      }
      return null;
    }

    const value = change.after.val();
    const command = value.command;

    console.log('command', { uid, cmd_id, command_value: value });
    functions.logger.info('command', { uid, cmd_id, command_value: value });

    switch (command) {
      case 'match':
        return onMatch(uid, root);
      case 'ready':
        return onReady(uid, value, root);
      case 'move':
        return onMove(uid, value, root);
    }

    return null;
  });

async function onMatch(uid: string, root: admin.database.Reference) {
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

async function onReady(
  uid: string,
  { gameId }: { gameId: string },
  root: admin.database.Reference
) {
  return root.child(`/games/${gameId}`).transaction((state) => {
    if (!state) {
      return null;
    }

    const player = state.players.find((player: { uid: string }) => {
      return player.uid === uid;
    });
    player.ready = true;

    const notReady = state.players.some((player: { ready: boolean }) => {
      return !player.ready;
    });
    if (!notReady) {
      state.board = createBoard();
    }
    return state;
  });
}

interface MovePayload {
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
async function onMove(
  uid: string,
  payload: MovePayload,
  root: admin.database.Reference
) {
  const gameId = payload.gameId;
  return root.child(`/games/${gameId}`).transaction((state) => {
    if (!state) {
      return null;
    }

    const updates = state.updates || [];
    const { source, target } = payload;
    updates.push({ type: 'shift', source, target });

    state.updates = updates;
    return state;
  });
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
    const oponent = game.players.find(
      (player: { uid: string }) => player.uid !== uid
    );
    updates.push(
      root
        .child(`/players_states/${oponent.uid}`)
        .set({ matching: true, updated: true })
    );
    updates.push(root.child(`/games/${state.gameId}`).remove());
  }
  updates.push(root.child(`/players_states/${uid}`).remove());
  return Promise.all(updates);
}

async function createGame(
  playersIds: string[],
  root: admin.database.Reference
) {
  const players = playersIds.map((uid) => {
    return {
      uid,
      ready: false,
      life: 2000,
    };
  });
  const gameRef = await root.child('/games').push();
  const gameId = gameRef.key;
  await gameRef.set({ players, gameId });

  console.log('createGame', gameId, players);

  const updates = playersIds.map((uid, index) => {
    const opponent = index === 0 ? players[1] : players[0];
    return root.child(`/players_states/${uid}`).set({ gameId, opponent });
  });

  return Promise.all(updates);
}

function getRandomType() {
  return TYPES_INDEX[Math.floor(Math.random() * TYPES_INDEX.length)];
}

function createBoard() {
  const data: number[][] = [];
  for (let row = 0; row < 5; row++) {
    data[row] = [];
    for (let column = 0; column < 5; column++) {
      data[row][column] = getRandomType();
    }
  }
  return data;
}
