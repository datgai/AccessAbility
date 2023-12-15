import { Injectable, inject } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { catchError, from, throwError } from 'rxjs';

interface AuthenticationParams {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public userKey: string = 'user';

  constructor(private auth: Auth = inject(Auth)) {}

  login(params: AuthenticationParams) {
    return from(
      signInWithEmailAndPassword(this.auth, params.email, params.password)
    ).pipe(
      catchError((error: FirebaseError) =>
        throwError(() => new Error(this.translateFirebaseErrorMessage(error)))
      )
    );
  }

  register(params: AuthenticationParams) {
    return from(
      createUserWithEmailAndPassword(this.auth, params.email, params.password)
    ).pipe(
      catchError((error: FirebaseError) =>
        throwError(() => new Error(this.translateFirebaseErrorMessage(error)))
      )
    );
  }

  logout() {
    return from(this.auth.signOut()).pipe(
      catchError((error: FirebaseError) =>
        throwError(() => new Error(this.translateFirebaseErrorMessage(error)))
      )
    );
  }

  private translateFirebaseErrorMessage({ code, message }: FirebaseError) {
    console.log('inside ', message);
    if (code === 'auth/user-not-found') {
      return 'User not found.';
    }
    if (code === 'auth/wrong-password') {
      return 'User not found.';
    }
    return message;
  }
}
