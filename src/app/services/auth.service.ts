import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

// import { firebase } from '@firebase/app'
import firebase from 'firebase/app';
// import 'firebase/auth';

// import * as firebase from 'firebase';
// import 'firebase/auth'
// import firebase from 'firebase/app'

import { from, of, ReplaySubject, Subject } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

export interface IUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}

@Injectable()
export class AuthService {
  userData: any; // Save logged in user data

  userDataChange = new Subject<firebase.User>();
  userDataSubject = new ReplaySubject<firebase.User>(1);
  userDataObservable = this.userDataSubject.asObservable();

  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth // Inject Firebase auth service
  ) {
    this.afAuth.authState.subscribe((user) => {
      this.userData = user;
      this.userDataSubject.next(user);
      this.userDataChange.next(user);
    });
  }

  updateProfile(profile?: {
    displayName?: string | null;
    photoURL?: string | null;
  }) {
    const user = this.userData;
    if (!user) {
      return Promise.reject('Empty user');
    }
    if (!profile?.displayName) {
      const hash = Math.floor(Math.random() * 90000) + 10000;
      profile = { ...profile, displayName: `player-${hash}` };
    }
    return user.updateProfile(profile);
  }

  loginAnonymously() {
    return this.userDataObservable.pipe(
      take(1),
      switchMap((user) => {
        if (user) {
          return of(user);
        }
        return from(this.afAuth.signInAnonymously());
      }),
      switchMap(() => {
        return this.userDataChange.pipe(take(1));
      })
    );
  }

  loginWithGoogle() {
    return this.userDataObservable.pipe(
      take(1),
      switchMap((user) => {
        if (user) {
          return of(user);
        }
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        return from(this.afAuth.signInWithRedirect(provider));
      }),
      map(() => {
        return this.userData;
      })
    );
  }

  signOut() {
    return from(this.afAuth.signOut());
  }
}
