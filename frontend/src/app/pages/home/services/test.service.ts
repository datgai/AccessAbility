import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  constructor(private http: HttpClient) {}

  getTest(token: string) {
    return this.http.get<{ message: string; user?: User }>(
      'http://localhost:3000/api/auth/test',
      { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) }
    );
  }
}
