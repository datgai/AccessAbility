import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { UserProfile } from '../../../../shared/src/types/user';
import { environment } from '../../environments/environment';

export type UserDetails = User & { profile: UserProfile };

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(userId: string) {
    return this.http.get<UserDetails>(`${environment.baseUrl}/user/${userId}`);
  }
}
