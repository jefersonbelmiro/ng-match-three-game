import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
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
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    this.afAuth.authState.subscribe((user) => {
      console.log('auth subscribe', { user });
      if (user) {
        let storageUser: any;
        try {
          storageUser = JSON.parse(localStorage.getItem('user'));
        } catch (er) {
          storageUser = {};
        }
        if (storageUser && storageUser.uid === user.uid) {
          user = storageUser;
        }
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
      this.userData = user;
      this.userDataSubject.next(user);
      this.userDataChange.next(user);
    });
  }

  loginAnonymously() {
    return this.userDataObservable.pipe(
      take(1),
      switchMap((user) => {
        const hash = Math.floor(Math.random() * 90000) + 10000;
        const displayName = `player-${hash}`;
        console.log('userData', { user, displayName });
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
        console.log('userData', { user });
        if (user) {
          return of(user);
        }
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        return from(this.afAuth.signInWithRedirect(provider));
      }),
      map(() => {
        console.log('login google');
        return this.userData;
      })
    );
    // return this.afAuth.signInWithPopup(provider).then(response => {
    //   console.log('response', response);
    // });
  }

  signOut() {
    this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['/']);
    });
  }
}
