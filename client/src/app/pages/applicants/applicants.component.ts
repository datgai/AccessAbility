import { Component, signal } from '@angular/core';
import { EMPTY, expand, from } from 'rxjs';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MiniInfoCardComponent } from '../../components/mini-info-card/mini-info-card.component';
import { JobDetails, JobService } from '../../services/job.service';
import {
  UserResponse,
  UserStoreService,
} from '../../services/user-store.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [MiniInfoCardComponent, LoaderComponent],
  templateUrl: './applicants.component.html',
  styleUrl: './applicants.component.css',
})
export class ApplicantsComponent {
  public jobApplicationIds = signal<string[]>([]);
  public applications = signal<
    {
      jobDetails: JobDetails;
      applicantDetails: UserResponse;
    }[]
  >([]);
  public numOffers = signal<number>(0);

  constructor(
    private jobService: JobService,
    private userService: UserService,
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
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
            if (job.businessId !== this.userStore.user?.uid) return;
            // Load number of applications
            this.jobApplicationIds().push(...job.applicants);

            // Load applicants
            from(job.applicants).subscribe({
              next: (applicantId) => {
                this.userService.getUser(applicantId).subscribe({
                  next: (user) => {
                    // Get number of offers the busines has given
                    if (user.profile.offers.includes(job.id)) {
                      this.numOffers.set(this.numOffers() + 1);
                    }

                    this.applications().push({
                      jobDetails: job,
                      applicantDetails: user,
                    });
                  },
                });
              },
            });
          });

          nextPageToken = response.nextPageToken;
        },
      });
  }
}
