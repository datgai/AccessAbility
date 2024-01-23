import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarkdownModule, MarkdownPipe } from 'ngx-markdown';
import { ToastrService } from 'ngx-toastr';
import { from, mergeMap } from 'rxjs';
import { Job } from '../../../../../shared/src/types/job';
import { UserRole } from '../../../../../shared/src/types/user';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MiniInfoCardComponent } from '../../components/mini-info-card/mini-info-card.component';
import { SummaryCardComponent } from '../../components/summary-card/summary-card.component';
import { JobDetails, JobService } from '../../services/job.service';
import {
  UserResponse,
  UserStoreService,
} from '../../services/user-store.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    LoaderComponent,
    SummaryCardComponent,
    MiniInfoCardComponent,
    MarkdownModule,
    MarkdownPipe,
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  public user = signal<UserResponse | undefined>(undefined);
  public openModal = signal<boolean>(false);
  public jobOfferId = '';

  public businessData = signal({
    jobOffers: signal<JobDetails[]>([]),
    jobsApplied: signal<(Job & { id: string })[]>([]),
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private jobService: JobService,
    private toastr: ToastrService,
    public userStore: UserStoreService,
    private auth: Auth,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return this.router.navigate(['404']);

    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.user.set(user);
        if (this.userStore.user?.uid === user.uid) this.userStore.user = user;
      },
      complete: async () => {
        if (this.userStore.user?.profile.role === UserRole.BUSINESS) {
          this.auth.onAuthStateChanged(async (user) => {
            if (user === null) return;
            const userToken = await user.getIdToken();

            // Get offers received by the user from the business viewing their profile
            this.userService
              .getUserOffers(userToken, this.user()!.uid)
              .subscribe({
                next: (offers) => {
                  console.log(offers);
                  this.businessData().jobOffers.set(
                    offers.filter(
                      (offer) =>
                        offer.business.uid === this.userStore.user?.uid,
                    ),
                  );
                },
              });

            // Get applications the user has for the business viewing their profile
            this.userService
              .getUserApplications(userToken, this.user()!.uid)
              .subscribe({
                next: (applications) => {
                  this.businessData().jobsApplied.set(applications);
                },
              });
          });
        }
      },
      error: () => this.router.navigate(['404']),
    });

    return;
  }

  submitOfferForm() {
    if (!this.jobOfferId) {
      return this.toastr.warning('No position selected.');
    }

    this.userService.addOffer(this.user()!.uid, this.jobOfferId).subscribe({
      next: (response) => this.toastr.success(response.message),
      complete: () => this.removeApplicants(),
    });
    return;
  }

  removeApplicants(message?: string) {
    from(
      this.businessData()
        .jobsApplied()
        .filter((job) => job.businessId === this.userStore.user?.uid),
    )
      .pipe(
        mergeMap((job) => {
          return this.jobService.editJob(job.id, {
            applicants: job.applicants.filter(
              (applicantId) => applicantId !== this.user()?.uid,
            ),
          });
        }),
      )
      .subscribe({
        complete: () => {
          this.businessData().jobsApplied.set([]);
          this.ngOnInit();
          if (message) this.toastr.success(message);
        },
      });
  }
}
