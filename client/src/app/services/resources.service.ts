import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resource } from '../../../../shared/src/types/resource';
import { environment } from '../../environments/environment';
import { UserDetails } from './user.service';

export type ResourceDetails = Omit<Resource, 'authorId'> & {
  id: string;
  author: UserDetails;
};

@Injectable({
  providedIn: 'root',
})
export class ResourcesService {
  constructor(private http: HttpClient) {}

  getResources(token: string, pageToken: string = '') {
    return this.http.get<{
      resources: ResourceDetails[];
      nextPageToken: string;
    }>(`${environment.baseUrl}/resources/${pageToken}`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }
  getResourceById(id: string, token: string) {
    return this.http.get(`${environment.baseUrl}/resource/${id}`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }
}
