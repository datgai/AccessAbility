import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, map } from 'rxjs';
import { AuthenticationService } from '../../shared/authentication.service';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;

  constructor(
    private formBulder: FormBuilder,
    private authenticationService: AuthenticationService,
    private loginService: LoginService,
    private router: Router
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
      console.log(this.loginForm.errors);
      return;
    }

    const sub: Subscription = this.authenticationService
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
                this.authenticationService.userKey,
                JSON.stringify({ ...user, profile: response.profile })
              );
            },
            error: (error: HttpErrorResponse) => {
              if (error.status === 404) {
                // User does not have a profile so create it
                this.loginService.createProfile(userToken).subscribe({
                  next: (res) => {
                    localStorage.setItem(
                      this.authenticationService.userKey,
                      JSON.stringify({ ...user, profile: res.user?.profile })
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
          console.log(error.message);
          sub.unsubscribe();
        },
        complete: () => sub.unsubscribe(),
      });

    this.loginForm.reset();
  }
}
