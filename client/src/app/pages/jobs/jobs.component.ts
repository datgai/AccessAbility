import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { MiniInfoCardComponent } from '../../components/mini-info-card/mini-info-card.component';
import { JobInfo, JobService } from '../../services/job.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MiniInfoCardComponent],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css',
})
export class JobsComponent implements OnInit {
  public jobs = signal<JobInfo[]>([]);
  public nextPageToken = signal<string | undefined>('');
  public searchTerm = new FormControl<string>('');

  constructor(
    private jobService: JobService,
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    this.jobService
      .formatJobList(
        this.jobService
          .getJobList(this.nextPageToken())
          .pipe(
            tap((response) => this.nextPageToken.set(response.nextPageToken)),
          ),
      )
      .subscribe({
        next: (jobResponse) => this.jobs.set(jobResponse),
        error: (err) => console.error(err),
      });
  }

  onSubmit() {
    this.jobService
      .formatJobList(
        this.jobService
          .getJobList(this.nextPageToken(), this.searchTerm.value ?? '')
          .pipe(
            tap((response) => this.nextPageToken.set(response.nextPageToken)),
          ),
      )
      .subscribe({
        next: (jobResponse) => this.jobs.set(jobResponse),
        error: (err) => console.error(err),
      });
  }

  loadMore() {
    this.jobService
      .formatJobList(
        this.jobService
          .getJobList(this.nextPageToken())
          .pipe(
            tap((response) => this.nextPageToken.set(response.nextPageToken)),
          ),
      )
      .subscribe({
        next: (jobResponse) => this.jobs().push(...jobResponse),
        error: (err) => console.error(err),
      });
  }
}
