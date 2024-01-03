import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { concatMap, from, map, switchMap, toArray } from 'rxjs';
import { MiniInfoCardComponent } from '../../../components/mini-info-card/mini-info-card.component';
import { JobResponse, JobService } from '../../../services/job.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [RouterLink, MiniInfoCardComponent],
  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.css',
})
export class UserViewComponent implements OnInit {
  public jobs: WritableSignal<JobResponse[]> = signal([]);
  private nextPageToken: string = '';

  constructor(
    private jobService: JobService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.jobService
      .getJobList(this.nextPageToken)
      .pipe(
        switchMap((response) => {
          this.nextPageToken = response.nextPageToken;

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
      )
      .subscribe({
        next: (jobResponse) => this.jobs.set(jobResponse),
        error: (err) => console.error(err),
      });
  }
}
