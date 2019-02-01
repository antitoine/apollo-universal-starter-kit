import ServerModule from '@gqlapp/module-server-ts';
import firebase from 'firebase-admin';

import access from './access';
import auth from './auth';
import schema from './schema.graphql';
import resolvers from './resolvers';
import scopes from './scopes';
import User from './firestore';
import resources from './locales';
import { admin } from '../../../config/firebase';

import settings from '../../../settings';

const createContextFunc = async ({ context: { user } }) => ({
  User,
  user,
  auth: {
    isAuthenticated: !!user,
    scope: user ? scopes[user.role] : null
  }
});
if (settings.user.auth.firebase.enabled) {
  const firebasApp = firebase.initializeApp({
    credential: firebase.credential.cert(admin),
    databaseURL: process.env.DB_FIREBASE
  });
  firebasApp.firestore().settings({ timestampsInSnapshots: true });
}

export { User };

export default new ServerModule(access, auth, {
  schema: [schema],
  createResolversFunc: [resolvers],
  createContextFunc: [createContextFunc],
  localization: [{ ns: 'firebase', resources }]
});