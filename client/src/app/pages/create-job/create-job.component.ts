import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TagInputModule } from 'ngx-chips';
import { ToastrService } from 'ngx-toastr';
import { JobLocationType, JobType } from '../../../../../shared/src/types/job';
import { JobService } from '../../services/job.service';
import { SkillsService } from '../../services/skills.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [ReactiveFormsModule, TagInputModule],
  templateUrl: './create-job.component.html',
  styleUrl: './create-job.component.css',
})
export class CreateJobComponent implements OnInit {
  public form!: FormGroup;
  public skills: string[] = [];

  public jobType: JobType = JobType.FULL_TIME;
  public jobTypeKeys = Object.values(JobType);

  public jobLocationType: JobLocationType = JobLocationType.ON_SITE;
  public jobLocationTypeKeys = Object.values(JobLocationType);

  constructor(
    private formBuilder: FormBuilder,
    private jobService: JobService,
    private skillsService: SkillsService,
    private router: Router,
    private toastr: ToastrService,
    private auth: Auth,
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    this.skillsService.getSkills().subscribe({
      next: (skills) => {
        this.skills = skills.map((skill) => skill.name);
      },
    });

    this.form = this.formBuilder.group({
      position: new FormControl<string>('', Validators.required),
      type: new FormControl<JobType>(JobType.FULL_TIME, Validators.required),
      locationType: new FormControl<JobLocationType>(
        JobLocationType.ON_SITE,
        Validators.required,
      ),
      description: new FormControl<string>('', Validators.required),
      skills: new FormControl<string[]>([], Validators.required),
      applicants: new FormControl<string[]>([]),
    });
  }

  async onSubmit() {
    if (!this.form.valid) {
      return this.toastr.error('Missing inputs.');
    }

    const token = await this.auth.currentUser?.getIdToken();
    if (!token) {
      return this.toastr.error('You are not authorised to create a job.');
    }

    const jobData = this.form.value;

    this.jobService.createJob(token, jobData).subscribe({
      next: (job) => {
        this.router.navigate(['/jobs', job.id]);
        this.form.reset();
        this.toastr.success('Created job successfully.');
      },
      error: (err) => {
        // Handle error during job creation (you may customize this part)
        console.error('Error creating job:', err);
        this.toastr.error('Error creating job. Please try again.');
      },
    });
    return;
  }
}
