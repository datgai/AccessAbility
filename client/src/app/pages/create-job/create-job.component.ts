import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ForumService } from '../../services/forum.service';
import { UserStoreService } from '../../services/user-store.service';
import { TagInputModule } from 'ngx-chips';
import { JobService } from '../../services/job.service';
import { JobLocationType, JobType, Skill } from '../../../../../shared/src/types/job';
import { SkillsService } from '../../services/skills.service';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [ReactiveFormsModule, TagInputModule],
  templateUrl: './create-job.component.html',
  styleUrl: './create-job.component.css'
})
export class CreateJobComponent implements OnInit{
  public form!: FormGroup;
  public allowedSkills: string[] = [];

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
        this.allowedSkills = skills.map((skill) => skill.name);
      },
    });
    
    this.form = this.formBuilder.group({
      position: new FormControl<string>('', Validators.required),
      type: new FormControl<JobType>(JobType.FULL_TIME, Validators.required),
      locationType: new FormControl<JobLocationType>(JobLocationType.ON_SITE, Validators.required),
      description: new FormControl<string>('', Validators.required),
      skills: new FormControl<string[]>([], Validators.required)
    });
  }

  async onSubmit(){

    if (!this.form.valid) {
      return this.toastr.error('Missing inputs.');
    }

    const formData = new FormData();

    Object.keys(this.form.value).forEach((key) => {
      if (this.form.value[key] !== '') {
        formData.append(key, this.form.value[key]);
      }
    });

    const token = await this.auth.currentUser?.getIdToken();
    if (!token) {
      return this.toastr.error('You are not authorised to create a job.');
    }

    this.jobService.createJob(token, formData).subscribe({
      next: (job) => this.router.navigate(['job', job.id]),

      complete: () =>
        this.toastr.success(
          'Created job successfully. Awaiting admin verification.',
        ),
    });
    return;
  }

}
