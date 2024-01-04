import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { UserProfile } from '../../../../shared/src/types/user';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService {
  constructor(private authenticationService: AuthenticationService) {}

  isAuthenticated() {
    return !localStorage.getItem(this.authenticationService.userKey)
      ? false
      : true;
  }

  get user() {
    const user = localStorage.getItem(this.authenticationService.userKey) ?? '';
    return user
      ? (JSON.parse(user) as (User & { profile: UserProfile }) | undefined)
      : undefined;
  }
}
