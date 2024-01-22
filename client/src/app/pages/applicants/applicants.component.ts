import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, expand } from 'rxjs';
import { UserRole } from '../../../../../shared/src/types/user';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MiniInfoCardComponent } from '../../components/mini-info-card/mini-info-card.component';
import { JobDetails, JobService } from '../../services/job.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [MiniInfoCardComponent, LoaderComponent, CommonModule],
  templateUrl: './applicants.component.html',
  styleUrl: './applicants.component.css',
})
export class ApplicantsComponent {
  public jobs = signal<JobDetails[]>([]);
  private numApplicants = signal<number>(0);
  private numOffersGiven = signal<number>(0);

  public totalApplicants = computed<number>(() => {
    return this.jobs().reduce((acc, cur) => {
      acc += cur.applicants.length;
      return acc;
    }, 0);
  });

  @Input({ required: false })
  public fromPage = true;

  @Output()
  public onLoad = new EventEmitter<{
    numApplicants: number;
    numOffersGiven: number;
  }>();

  constructor(
    private jobService: JobService,
    private router: Router,
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    if (this.userStore.user?.profile.role !== UserRole.BUSINESS) {
      this.router.navigate(['404']);
    }

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
        complete: () =>
          this.onLoad.emit({
            numApplicants: this.numApplicants(),
            numOffersGiven: this.numOffersGiven(),
          }),
      });
  }
}
