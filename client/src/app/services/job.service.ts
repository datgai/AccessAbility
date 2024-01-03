import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Job } from '../../../../shared/src/types/job';
import { UserProfile } from '../../../../shared/src/types/user';
import { environment } from '../../environments/environment';

export type JobDetails = Job & { id: string };
export interface JobResponse {
  jobDetails: JobDetails;
  businessDetails: UserProfile;
}

@Injectable({
  providedIn: 'root',
})
export class JobService {
  constructor(private http: HttpClient) {}

  getJobList(token?: string) {
    return this.http.get<{
      jobs: JobDetails[];
      nextPageToken: string;
    }>(`${environment.baseUrl}/jobs/${token ?? ''}`);
  }
}
