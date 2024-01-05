import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkdownPipe } from 'ngx-markdown';
import { concatMap, from, map, switchMap, toArray } from 'rxjs';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MiniInfoCardComponent } from '../../components/mini-info-card/mini-info-card.component';
import { JobInfo, JobService } from '../../services/job.service';
import { SkillsService } from '../../services/skills.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [MiniInfoCardComponent, MarkdownPipe, CommonModule, LoaderComponent],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.css',
})
export class JobDetailsComponent implements OnInit {
  public job = signal<JobInfo | undefined>(undefined);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private userService: UserService,
    private skillsService: SkillsService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return this.router.navigate(['404']);

    this.jobService
      .getJob(id)
      .pipe(
        switchMap((job) => {
          const businessId = job.businessId;
          const skillIds = Array.from(new Set(job.skills));

          return from(skillIds).pipe(
            concatMap((skillId) => this.skillsService.getSkill(skillId)),
            map((skill) => skill.name),
            toArray(),
            switchMap((skills) => {
              return from(businessId).pipe(
                concatMap(() => this.userService.getUser(businessId)),
                map((business) => {
                  return {
                    jobDetails: { ...job, skills },
                    businessDetails: business.profile,
                  };
                }),
              );
            }),
          );
        }),
      )
      .subscribe({
        next: (response) => this.job.set(response),
        error: () => this.router.navigate(['404']),
      });

    return;
  }
}
