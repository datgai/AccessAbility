import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EMPTY, expand, tap } from 'rxjs';
import { MiniInfoCardComponent } from '../../../components/mini-info-card/mini-info-card.component';
import { SummaryCardComponent } from '../../../components/summary-card/summary-card.component';
import { JobInfo, JobService } from '../../../services/job.service';
import { UserStoreService } from '../../../services/user-store.service';

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
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    // Load intial jobs
    this.jobService
      .formatJobList(
        this.jobService
          .getJobList(this.nextPageToken)
          .pipe(
            tap((response) => (this.nextPageToken = response.nextPageToken)),
          ),
      )
      .subscribe({
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
    this.jobService
      .formatJobList(
        this.jobService
          .getJobList(this.nextPageToken, this.searchTerm.value ?? '')
          .pipe(
            tap((response) => (this.nextPageToken = response.nextPageToken)),
          ),
      )
      .subscribe({
        next: (jobResponse) => this.jobs.set(jobResponse),
        error: (err) => console.error(err),
      });
  }
}
