import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  constructor(private http: HttpClient) {}

  getTest(token: string) {
    return this.http.get<{ message: string; user?: User }>(
      `${environment.baseUrl}/auth/test`,
      { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) }
    );
  }
}
