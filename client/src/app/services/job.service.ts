import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Job } from '../../../../shared/src/types/job';
import { environment } from '../../environments/environment';
import { UserDetails } from './user.service';

export type JobDetails = Omit<Job, 'businessId' | 'applicants'> & {
  id: string;
  business: UserDetails;
  applicants: UserDetails[];
};

export interface JobResponse {
  jobs: JobDetails[];
  nextPageToken: string;
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

  getJob(jobId: string) {
    return this.http.get<JobDetails>(`${environment.baseUrl}/job/${jobId}`);
  }

  editJob(jobId: string, body: Partial<Job>) {
    return this.http.patch<JobDetails>(
      `${environment.baseUrl}/job/${jobId}`,
      body,
    );
  }
}
