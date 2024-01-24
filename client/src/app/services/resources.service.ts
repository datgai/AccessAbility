import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResourcesService {
  constructor(private http: HttpClient) {
    // router.get('/resources/:token?', isAuthenticated, getResources);
  }

  getResources(token: string, pageToken: string = '') {
    return this.http.get(`${environment.baseUrl}/resources/${pageToken}`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }
}
