import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserProfile } from '../../../../../../shared/src/types/user';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  getProfile(token: string) {
    return this.http.get<{ profile?: UserProfile }>(
      `${environment.baseUrl}/user/profile`,
      { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) }
    );
  }
}
