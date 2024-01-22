import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Job } from '../../../../shared/src/types/job';
import { UserProfile } from '../../../../shared/src/types/user';
import { environment } from '../../environments/environment';
import { JobDetails } from './job.service';

export type UserDetails = User & { profile: UserProfile };

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(userId: string) {
    return this.http.get<UserDetails>(`${environment.baseUrl}/user/${userId}`);
  }

  addOffer(userId: string, offerId: string) {
    return this.http.patch<{ message: string }>(
      `${environment.baseUrl}/user/${userId}`,
      { offerId },
    );
  }

  getUserOffers(token: string, userId: string) {
    return this.http.get<JobDetails[]>(
      `${environment.baseUrl}/user/${userId}/offers`,
      { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) },
    );
  }

  getUserApplications(token: string, userId: string) {
    return this.http.get<(Job & { id: string })[]>(
      `${environment.baseUrl}/user/${userId}/applications`,
      { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) },
    );
  }

  getOffersByBusiness(token: string) {
    return this.http.get<JobDetails[]>(`${environment.baseUrl}/user/offers`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }
}
