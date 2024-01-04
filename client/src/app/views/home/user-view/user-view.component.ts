import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, concatMap, from, map, switchMap, toArray } from 'rxjs';
import { MiniInfoCardComponent } from '../../../components/mini-info-card/mini-info-card.component';
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
  imports: [ReactiveFormsModule, RouterLink, MiniInfoCardComponent],
  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.css',
})
export class UserViewComponent implements OnInit {
  public jobs = signal<JobInfo[]>([]);
  private nextPageToken: string = '';

  public searchForm!: FormGroup<{
    searchTerm: FormControl<string>;
  }>;

  constructor(
    private jobService: JobService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      searchTerm: new FormControl<string>('') as FormControl<string>,
    });

    this.formatJobList(
      this.jobService.getJobList(this.nextPageToken),
    ).subscribe({
      next: (jobResponse) => this.jobs.set(jobResponse),
      error: (err) => console.error(err),
    });
  }

  onSubmit() {
    const { searchTerm } = this.searchForm.value;
    this.formatJobList(
      this.jobService.getJobList(this.nextPageToken, searchTerm),
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
