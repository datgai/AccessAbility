import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';

import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { catchError, from, throwError } from 'rxjs';
import { UserProfile } from '../../../../shared/src/types/user';
import { environment } from '../../environments/environment';

interface AuthenticationParams {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private auth: Auth,
    private http: HttpClient,
  ) {}

  login(params: AuthenticationParams) {
    return from(
      signInWithEmailAndPassword(this.auth, params.email, params.password),
    ).pipe(
      catchError((error: FirebaseError) =>
        throwError(() => new Error(this.translateFirebaseErrorMessage(error))),
      ),
    );
  }

  register(params: AuthenticationParams) {
    return from(
      createUserWithEmailAndPassword(this.auth, params.email, params.password),
    ).pipe(
      catchError((error: FirebaseError) =>
        throwError(() => new Error(this.translateFirebaseErrorMessage(error))),
      ),
    );
  }

  logout() {
    return from(signOut(this.auth)).pipe(
      catchError((error: FirebaseError) =>
        throwError(() => new Error(this.translateFirebaseErrorMessage(error))),
      ),
    );
  }

  editOrCreateProfile(token: string, body: FormData) {
    return this.http.post<{
      message: string;
      user?: User & { profile: UserProfile };
    }>(`${environment.baseUrl}/user/profile`, body, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
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
