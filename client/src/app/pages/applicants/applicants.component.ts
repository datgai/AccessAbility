import { Component, Input, computed, signal } from '@angular/core';
import { EMPTY, expand } from 'rxjs';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MiniInfoCardComponent } from '../../components/mini-info-card/mini-info-card.component';
import { JobDetails, JobService } from '../../services/job.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [MiniInfoCardComponent, LoaderComponent],
  templateUrl: './applicants.component.html',
  styleUrl: './applicants.component.css',
})
export class ApplicantsComponent {
  public jobs = signal<JobDetails[]>([]);
  public numApplicants = signal<number>(0);
  public numOffersGiven = signal<number>(0);

  public totalApplicants = computed<number>(() => {
    return this.jobs().reduce((acc, cur) => {
      acc += cur.applicants.length;
      return acc;
    }, 0);
  });

  @Input({ required: false })
  public showHeading = true;

  constructor(
    private jobService: JobService,
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
            if (job.business.uid !== this.userStore.user?.uid) return;

            // Get number of applications the business has
            this.numApplicants.set(
              this.numApplicants() + job.applicants.length,
            );

            // Get number of offers the business has given
            job.applicants.forEach((applicant) => {
              if (applicant.profile.offers.includes(job.id)) {
                this.numOffersGiven.set(this.numOffersGiven() + 1);
              }
            });

            this.jobs().push(job);
          });

          nextPageToken = response.nextPageToken;
        },
      });
  }
}
