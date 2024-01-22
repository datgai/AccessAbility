import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MiniInfoCardComponent } from '../../components/mini-info-card/mini-info-card.component';
import { JobDetails, JobService } from '../../services/job.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MiniInfoCardComponent,
    LoaderComponent,
  ],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css',
})
export class JobsComponent implements OnInit {
  public jobs = signal<JobDetails[]>([]);
  public nextPageToken = signal<string | undefined>('');
  public searchTerm = new FormControl<string>('');

  constructor(
    private jobService: JobService,
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    this.jobService.getJobList(this.nextPageToken()).subscribe({
      next: (response) => {
        this.jobs.set(response.jobs);
        this.nextPageToken.set(response.nextPageToken);
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

  loadMore() {
    this.jobService.getJobList(this.nextPageToken()).subscribe({
      next: (response) => {
        this.jobs().push(...response.jobs);
        this.nextPageToken.set(response.nextPageToken);
      },
    });
  }
}
