import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info('Hello logs[2]!', { structuredData: true });
//   response.send('Hello from Firebase[2]!');
// });

export const OnWriteCommand = functions.database
  .ref('/commands/{uid}/{cmd_id}')
  .onWrite((snapshot, context) => {
    const uid = context.params.uid;
    const cmd_id = context.params.cmd_id;

    console.log('command', { uid, cmd_id });
    functions.logger.info('command', { uid, cmd_id });

    if (snapshot.after.exists()) {
      console.log(`command was deleted ${cmd_id}`);
      return;
    }

    // const root = snapshot.after.ref.root;
    // const command = snapshot.after.val();

    return null;
    // return Promise.resolve('test restorno');
    // return root.child('child_test').set({ index: 42, value: 'bla bla' });
  });
