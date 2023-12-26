import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { UserProfile, UserRole } from '../../../../../../shared/src/types/user';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  getProfile(token: string) {
    return this.http.get<{ profile?: UserProfile }>(
      `${environment.baseUrl}/api/user/profile`,
      { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) }
    );
  }

  createProfile(token: string) {
    return this.http.post<{
      message: string;
      user?: User & { profile: UserProfile };
    }>(
      `${environment.baseUrl}/api/user/profile`,
      { role: UserRole.USER },
      { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) }
    );
  }
}
