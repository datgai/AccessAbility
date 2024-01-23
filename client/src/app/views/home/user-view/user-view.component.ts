import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EMPTY, expand } from 'rxjs';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { MiniInfoCardComponent } from '../../../components/mini-info-card/mini-info-card.component';
import { SummaryCardComponent } from '../../../components/summary-card/summary-card.component';
import { JobDetails, JobService } from '../../../services/job.service';
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
    LoaderComponent,
  ],
  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.css',
})
export class UserViewComponent implements OnInit {
  public jobs = signal<JobDetails[]>([]);
  public jobAppliedIds = signal<string[]>([]);
  public searchTerm = new FormControl<string>('');

  public nextPageToken = signal<string>('');

  constructor(
    private jobService: JobService,
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    // Load intial jobs
    this.jobService
      .getJobList(this.nextPageToken())
      .pipe(
        expand((response) =>
          typeof response.nextPageToken === 'undefined'
            ? EMPTY
            : this.jobService.getJobList(this.nextPageToken()),
        ),
      )
      .subscribe({
        next: (response) => {
          if (this.jobs().length < 10) {
            this.jobs.set(response.jobs.slice(0, 10));
          }
          this.nextPageToken.set(response.nextPageToken);

          // Get all jobs
          response.jobs.forEach((job) => {
            if (
              job.applicants.some(
                (applicant) => applicant.uid === this.userStore.user?.uid,
              )
            ) {
              if (this.jobAppliedIds().includes(job.id)) return;
              this.jobAppliedIds().push(job.id);
            }
          });
        },
      });
  }

  onSubmit() {
    this.jobService
      .getJobList(this.nextPageToken(), this.searchTerm.value ?? '')
      .subscribe({
        next: (response) => {
          this.jobs.set(response.jobs);
          this.nextPageToken.set(response.nextPageToken);
        },
      });
  }
}
