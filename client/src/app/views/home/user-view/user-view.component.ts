import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  EMPTY,
  Observable,
  concatMap,
  expand,
  from,
  map,
  switchMap,
  toArray,
} from 'rxjs';
import { MiniInfoCardComponent } from '../../../components/mini-info-card/mini-info-card.component';
import { SummaryCardComponent } from '../../../components/summary-card/summary-card.component';
import {
  JobInfo,
  JobResponse,
  JobService,
} from '../../../services/job.service';
import { UserStoreService } from '../../../services/user-store.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [
    RouterLink,
    MiniInfoCardComponent,
    FormsModule,
    ReactiveFormsModule,
    SummaryCardComponent,
  ],
  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.css',
})
export class UserViewComponent implements OnInit {
  public jobs = signal<JobInfo[]>([]);
  public jobAppliedIds = signal<string[]>([]);
  public searchTerm = new FormControl<string>('');

  private nextPageToken: string = '';

  constructor(
    private jobService: JobService,
    private userService: UserService,
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    // Load intial jobs
    this.formatJobList(
      this.jobService.getJobList(this.nextPageToken),
    ).subscribe({
      next: (jobResponse) => this.jobs.set(jobResponse),
      error: (err) => console.error(err),
    });

    // Get all jobs user applied to
    let nextPageToken: string | undefined = '';
    this.jobService
      .getJobList(nextPageToken)
      .pipe(
        expand((response) =>
          typeof response.nextPageToken === 'undefined'
            ? EMPTY
            : this.jobService.getJobList(nextPageToken),
        ),
      )
      .subscribe({
        next: (response) => {
          response.jobs.forEach((job) => {
            if (job.applicants?.includes(this.userStore.user?.uid ?? '')) {
              if (this.jobAppliedIds().includes(job.id)) return;
              this.jobAppliedIds().push(job.id);
            }
          });
          nextPageToken = response.nextPageToken;
        },
      });
  }

  onSubmit() {
    this.formatJobList(
      this.jobService.getJobList(
        this.nextPageToken,
        this.searchTerm.value ?? '',
      ),
    ).subscribe({
      next: (jobResponse) => this.jobs.set(jobResponse),
      error: (err) => console.error(err),
    });
  }

  private formatJobList(jobResponse: Observable<JobResponse>) {
    return jobResponse.pipe(
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
    );
  }
}
