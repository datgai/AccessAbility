import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { UserProfile, UserRole } from '../../../../shared/src/types/user';

export type UserResponse = User & { profile: UserProfile };

@Injectable({
  providedIn: 'root',
})
export class UserStoreService {
  public userKey: string = 'user';
  public UserRole = UserRole;

  isAuthenticated() {
    return !localStorage.getItem(this.userKey) ? false : true;
  }

  get user() {
    const user = localStorage.getItem(this.userKey) ?? '';
    return user ? (JSON.parse(user) as UserResponse | undefined) : undefined;
  }

  set user(newUser: UserResponse | undefined) {
    localStorage.setItem(this.userKey, JSON.stringify(newUser));
  }
}
