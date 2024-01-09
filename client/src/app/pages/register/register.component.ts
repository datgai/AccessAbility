import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { sendEmailVerification } from '@angular/fire/auth';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  public registrationForm!: FormGroup;
  public componentTitle: string = 'Create An Account';
  public errorMessage: string = '';
  public isJobSeeker: Boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.registrationForm = this.formBuilder.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmationPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    this.isJobSeeker ? this.addJobSeekerControls() : this.addEmployerControls();
  }

  addJobSeekerControls(): void {
    this.registrationForm.addControl(
      'firstName',
      new FormControl('', [Validators.required]),
    );
    this.registrationForm.addControl(
      'lastName',
      new FormControl('', [Validators.required]),
    );
    this.registrationForm.addControl(
      'dob',
      new FormControl('', [Validators.required]),
    );
    this.registrationForm.addControl(
      'profilePic',
      new FormControl('', [Validators.required]),
    );
    this.registrationForm.addControl(
      'mobileNumber',
      new FormControl('', [Validators.required]),
    );
    this.registrationForm.addControl(
      'impairments',
      new FormControl('', [Validators.required]),
    );
  }

  addEmployerControls(): void {
    this.registrationForm.addControl(
      'companyName',
      new FormControl('', [Validators.required]),
    );
    this.registrationForm.addControl(
      'registrationNumber',
      new FormControl('', [Validators.required]),
    );
    this.registrationForm.addControl(
      'companyPhoneNo',
      new FormControl('', [Validators.required]),
    );
    this.registrationForm.addControl(
      'city',
      new FormControl('', [Validators.required]),
    );
    this.registrationForm.addControl(
      'state',
      new FormControl('', [Validators.required]),
    );
    this.registrationForm.addControl(
      'address',
      new FormControl('', [Validators.required]),
    );
  }

  onRoleChange(event: any): void {
    this.isJobSeeker = event.target.value === 'jobseeker';
    this.buildForm();
  }

  checkEmptyFields(): boolean {
    return Object.values(this.registrationForm.value).some(
      (value) => value === '' || value === null,
    );
  }

  onSubmit(): void {
    const { email, password, confirmationPassword } =
      this.registrationForm.value;

    if (this.checkEmptyFields()) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (!this.registrationForm.controls['email'].valid) {
      this.errorMessage = 'Invalid email format';
      return;
    }

    if (!this.registrationForm.controls['password'].valid) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    if (password !== confirmationPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.authenticationService
      .register({
        email,
        password,
      })
      .pipe(map((credential) => credential.user))
      .subscribe({
        next: async (user) => {
          const userToken = await user.getIdToken();

          this.authenticationService
            .editOrCreateProfile(userToken, new FormData())
            .subscribe({
              complete: async () => await sendEmailVerification(user),
            });
        },
        error: (error: Error) => console.log(error.message),
        complete: () => this.router.navigate(['login']),
      });
    this.registrationForm.reset();
  }
}
