import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EMPTY, expand } from 'rxjs';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { MiniInfoCardComponent } from '../../../components/mini-info-card/mini-info-card.component';
import { SummaryCardComponent } from '../../../components/summary-card/summary-card.component';
import { ApplicantsComponent } from '../../../pages/applicants/applicants.component';
import { JobDetails, JobService } from '../../../services/job.service';
import { UserStoreService } from '../../../services/user-store.service';

@Component({
  selector: 'app-business-view',
  standalone: true,
  imports: [
    SummaryCardComponent,
    RouterLink,
    MiniInfoCardComponent,
    LoaderComponent,
    ApplicantsComponent,
  ],
  templateUrl: './business-view.component.html',
  styleUrl: './business-view.component.css',
})
export class BusinessViewComponent implements OnInit {
  public jobs = signal<JobDetails[]>([]);
  public numApplicants = signal<number>(0);
  public numOffersGiven = signal<number>(0);

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
            console.log(job.applicants);
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
