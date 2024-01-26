import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { UserRole } from '../../../../../shared/src/types/user';
import { AuthenticationService } from '../../services/authentication.service';
import { UserStoreService } from '../../services/user-store.service';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  public errorMessage = signal<string>('');

  constructor(
    private formBulder: FormBuilder,
    private authenticationService: AuthenticationService,
    private loginService: LoginService,
    private userStore: UserStoreService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBulder.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  onSubmit(): void {
    const { email, password } = this.loginForm.value;

    if (!email || !password) {
      this.errorMessage.set('All fields are required');
      return;
    }

    this.authenticationService
      .login({
        email,
        password,
      })
      .pipe(map((credential) => credential.user))
      .subscribe({
        next: async (user) => {
          const userToken = await user.getIdToken();

          // Find the user profile to set in local storage
          this.loginService.getProfile(userToken).subscribe({
            next: async (response) => {
              localStorage.setItem(
                this.userStore.userKey,
                JSON.stringify({ ...user, profile: response.profile }),
              );
            },
            error: (error: HttpErrorResponse) => {
              if (error.status === 404) {
                // Basic template data for profile creation
                const formData = new FormData();
                formData.set('firstName', 'User');
                formData.set('role', UserRole.USER);
                formData.set(
                  'dateOfBirth',
                  new Date().toISOString().split('T')[0],
                );

                // User does not have a profile so create it
                this.authenticationService
                  .editOrCreateProfile(userToken, formData)
                  .subscribe({
                    next: (res) => {
                      localStorage.setItem(
                        this.userStore.userKey,
                        JSON.stringify({ ...user, profile: res.user?.profile }),
                      );
                    },
                    complete: () => this.router.navigate(['']), // Redirect to home page
                  });
              }
            },
            complete: () => this.router.navigate(['']), // Redirect to home page
          });
        },
        error: (error: Error) => {
          switch (error?.message) {
            case 'Firebase: Error (auth/invalid-email).':
              this.errorMessage.set('Invalid email format');
              break;
            case 'Firebase: Error (auth/invalid-credential).':
              this.errorMessage.set('Invalid email or password');
              break;
            default:
              this.errorMessage.set('Login failed: An unknown error occurred.');
          }
        },
      });

    this.loginForm.reset();
  }
}
