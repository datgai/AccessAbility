import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkdownPipe } from 'ngx-markdown';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MiniInfoCardComponent } from '../../components/mini-info-card/mini-info-card.component';
import { JobDetails, JobService } from '../../services/job.service';
import { UserStoreService } from '../../services/user-store.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    public userStore: UserStoreService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return this.router.navigate(['404']);

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
