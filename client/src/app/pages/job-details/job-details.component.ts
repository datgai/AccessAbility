import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkdownPipe } from 'ngx-markdown';
import { map } from 'rxjs';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MiniInfoCardComponent } from '../../components/mini-info-card/mini-info-card.component';
import { JobDetails, JobService } from '../../services/job.service';
import { UserStoreService } from '../../services/user-store.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [
    MiniInfoCardComponent,
    MarkdownPipe,
    CommonModule,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.css',
})
export class JobDetailsComponent implements OnInit {
  public job = signal<JobDetails | undefined>(undefined);
  public userOfferedBusinesses = signal<string[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private jobService: JobService,
    private auth: Auth,
    public userStore: UserStoreService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return this.router.navigate(['404']);

    this.auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const token = await user.getIdToken();

      this.userService
        .getUserOffers(token, user.uid)
        .pipe(map((offers) => offers.map((offer) => offer.business.uid)))
        .subscribe({
          next: (businessIds) => this.userOfferedBusinesses.set(businessIds),
          complete: () => console.log(this.userOfferedBusinesses()),
        });
    });

    this.jobService.getJob(id).subscribe({
      next: (response) => this.job.set(response),
      error: () => this.router.navigate(['404']),
    });

    return;
  }

  jobHasApplicant() {
    return this.job()?.applicants.some(
      (applicant) => applicant.uid === this.userStore.user?.uid,
    );
  }

  applyJob() {
    this.jobService
      .editJob(this.job()?.id ?? '', {
        applicants: [
          ...this.job()!.applicants.map((applicant) => applicant.uid),
          this.userStore.user!.uid,
        ],
      })
      .subscribe({
        complete: () => this.ngOnInit(),
      });
  }
}
