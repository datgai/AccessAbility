import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, concatMap, from, map, switchMap, toArray } from 'rxjs';
import { Job } from '../../../../shared/src/types/job';
import { UserProfile } from '../../../../shared/src/types/user';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

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
  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}

  getJobList(token?: string, filter: string = '') {
    return this.http.get<JobResponse>(
      `${environment.baseUrl}/jobs/${token ?? ''}?filter=${filter}`,
    );
  }

  formatJobList(jobResponse: Observable<JobResponse>) {
    return jobResponse.pipe(
      switchMap((response) => {
        const businessIds = Array.from(
          new Set(response.jobs.map((job) => job.businessId)),
        );
        return from(businessIds).pipe(
          concatMap((businessId) => this.userService.getUser(businessId)),
          toArray(),
          map((businesses) =>
            response.jobs.map((job) => {
              return {
                jobDetails: job,
                businessDetails: businesses.find(
                  (business) => business.uid === job.businessId,
                )!.profile,
              };
            }),
          ),
        );
      }),
    );
  }
}
