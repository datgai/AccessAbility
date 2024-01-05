import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Job } from '../../../../shared/src/types/job';
import { UserProfile } from '../../../../shared/src/types/user';
import { environment } from '../../environments/environment';

export type JobDetails = Job & { id: string };
export interface JobResponse {
  jobs: JobDetails[];
  nextPageToken: string;
}

export interface JobInfo {
  jobDetails: JobDetails;
  businessDetails: UserProfile;
}

@Injectable({
  providedIn: 'root',
})
export class JobService {
  constructor(private http: HttpClient) {}

  getJobList(token?: string, filter: string = '') {
    return this.http.get<JobResponse>(
      `${environment.baseUrl}/jobs/${token ?? ''}?filter=${filter}`,
    );
  }
}
