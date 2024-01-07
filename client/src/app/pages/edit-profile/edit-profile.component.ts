import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from '@angular/fire/firestore';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { DpDatePickerModule } from 'ng2-date-picker';
import { TagInputModule } from 'ngx-chips';
import { ToastrService } from 'ngx-toastr';
import { UserGender } from '../../../../../shared/src/types/user';
import { LoaderComponent } from '../../components/loader/loader.component';
import { AuthenticationService } from '../../services/authentication.service';
import { SkillsService } from '../../services/skills.service';
import {
  UserResponse,
  UserStoreService,
} from '../../services/user-store.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    TagInputModule,
    FormsModule,
    ReactiveFormsModule,
    DpDatePickerModule,
    LoaderComponent,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css',
})
export class EditProfileComponent implements OnInit {
  public user = signal<UserResponse | undefined>(undefined);
  public allowedSkills: string[] = [];
  public preview = signal<{ previewUrl: string; file: File | null }>({
    previewUrl: '',
    file: null,
  });

  public form!: FormGroup;
  public dateOfBirth = '';

  constructor(
    private userService: UserService,
    private skillsService: SkillsService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private auth: Auth = inject(Auth),
    private toastr: ToastrService,
    public userStore: UserStoreService,
  ) {}

  ngOnInit() {
    this.skillsService.getSkills().subscribe({
      next: (skills) => {
        this.allowedSkills = skills.map((skill) => skill.name);
      },
    });

    this.userService.getUser(this.userStore.user?.uid ?? '').subscribe({
      next: (user) => {
        this.user.set(user);
        this.user()!.profile.skills = user.profile.skills.map((skill) => {
          return (
            this.allowedSkills.find(
              (allowedSkill) =>
                allowedSkill.toLowerCase() === skill.toLowerCase(),
            ) ?? skill
          );
        });
        this.userStore.user = user;
      },
      complete: () => {
        const timestamp = new Timestamp(
          // @ts-ignore
          this.user()!.profile.dateOfBirth._seconds,
          // @ts-ignore
          this.user()!.profile.dateOfBirth._nanoseconds,
        );
        this.preview().previewUrl = this.user()!.profile.profilePictureUrl;
        this.form = this.formBuilder.group({
          email: new FormControl<string>(this.user()!.email!),
          firstName: new FormControl<string>(this.user()!.profile.firstName),
          lastName: new FormControl<string>(this.user()!.profile.lastName),
          gender: new FormControl<UserGender>(this.user()!.profile.gender),
          dateOfBirth: new FormControl<string>(
            timestamp.toDate().toISOString().split('T')[0],
          ),
          phoneNumber: new FormControl<string>(
            this.user()!.profile.phoneNumber,
          ),
          impairments: new FormControl<string[]>(
            this.user()!.profile.impairments,
          ),
          skills: new FormControl<string[]>(this.user()!.profile.skills),
          offers: new FormControl<string[]>(this.user()!.profile.offers),
          city: new FormControl<string>(this.user()!.profile.city),
          state: new FormControl<string>(this.user()!.profile.state),
          address: new FormControl<string>(this.user()!.profile.address),
          bio: new FormControl<string>(this.user()!.profile.bio),
          avatar: new FormControl<File | null>(null),
        });
      },
    });
  }

  selectFile(event: Event): void {
    this.preview().previewUrl = '';
    const selectedFiles = (event.target as HTMLInputElement).files;

    if (selectedFiles) {
      const file: File | null = selectedFiles.item(0);

      if (file) {
        this.preview().previewUrl = '';

        const reader = new FileReader();

        reader.onload = (event: ProgressEvent) => {
          this.preview().previewUrl = (event.target as FileReader)
            .result as string;
          this.preview().file = file;
        };

        reader.readAsDataURL(file);
      }
    }
  }

  async onSubmit() {
    const token = await this.auth.currentUser?.getIdToken();
    if (!token) return;

    const formData = new FormData();

    Object.keys(this.form.value).forEach((key) => {
      if (this.form.value[key] !== '') {
        if (Array.isArray(this.form.value[key])) {
          this.form.value[key].forEach((value: string, index: number) => {
            formData.append(`${key}[${index}]`, value);
          });
        } else {
          formData.append(key, this.form.value[key]);
        }
      }
    });

    if (this.preview().file) {
      formData.set('avatar', this.preview().file!);
    } else {
      formData.delete('avatar');
    }

    formData.append('role', this.user()!.profile.role);

    this.authenticationService.editOrCreateProfile(token, formData).subscribe({
      error: (error: HttpErrorResponse) =>
        this.toastr.error(error.error.message),
      complete: () => this.toastr.success('Profile edited successfully'),
    });
  }
}
