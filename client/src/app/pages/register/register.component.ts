import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { sendEmailVerification } from '@angular/fire/auth';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DpDatePickerModule } from 'ng2-date-picker';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs';
import { UserRole } from '../../../../../shared/src/types/user';
import { AuthenticationService } from '../../services/authentication.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, DpDatePickerModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  public form!: FormGroup;
  public errorMessage = signal<string>('');

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    private toastr: ToastrService,
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: new FormControl<string>('', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmationPassword: new FormControl<string>('', Validators.required),
      firstName: new FormControl<string>('', Validators.required),
      role: new FormControl<UserRole>(UserRole.USER, Validators.required),
      dateOfBirth: new FormControl<string>('', Validators.required),
    });
  }

  hasEmptyFields(): boolean {
    return Object.values(this.form.value).some(
      (value) => value === '' || value === null,
    );
  }

  onSubmit(): void {
    if (this.hasEmptyFields()) {
      this.errorMessage.set('All fields are required');
      return;
    }

    const { email, password, confirmationPassword, ...formData } =
      this.form.value;

    if (this.form.controls['email'].errors) {
      if (this.form.controls['email'].errors['email']) {
        this.errorMessage.set('Invalid email format');
        return;
      }
    }

    if (this.form.controls['password'].errors) {
      const err = this.form.controls['password'].errors['minlength'];

      if (err.actualLength < err.requiredLength) {
        this.errorMessage.set('Password must be at least 6 characters');
        return;
      }
    }

    if (password !== confirmationPassword) {
      this.errorMessage.set('Passwords do not match');
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
            .editOrCreateProfile(userToken, formData)
            .subscribe({
              error: (error: HttpErrorResponse) => {
                this.toastr.error(error.error.message ?? error.message);
              },
              complete: async () => {
                await sendEmailVerification(user);
                this.toastr.success('Verification email sent.');
              },
            });
        },
        error: (error: Error) => console.log(error.message),
        complete: () => this.router.navigate(['login']),
      });
    this.form.reset();
  }
}
