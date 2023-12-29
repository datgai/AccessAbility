import { Component } from '@angular/core';
import { sendEmailVerification } from '@angular/fire/auth';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, map } from 'rxjs';
import { AuthenticationService } from '../../shared/authentication.service';

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
    private formBulder: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.formBulder.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  onRoleChange(event: any): void {
    this.isJobSeeker = (event.target.value == 'jobseeker') ? true : false;
  }

  onSubmit(): void {
    const { email, password, confirmationPassword } = this.registrationForm.value;

    if (!email || !password || confirmationPassword) {
      this.errorMessage = "All fields are required";
      return;
    }

    if (password !== confirmationPassword) {
      this.errorMessage = "Passwords do not match";
      return;
    }

    const sub: Subscription = this.authenticationService
      .register({
        email,
        password,
      })
      .pipe(map((credential) => credential.user))
      .subscribe({
        next: async (user) => {
          await sendEmailVerification(user);
          this.router.navigate(['login']);
        },
        error: (error: Error) => {
    
          switch (error?.message) {
            case 'Firebase: Error (auth/email-already-in-use).':
              this.errorMessage = 'Email is already registered';
              break;
            case 'Firebase: Error (auth/invalid-email).':
              this.errorMessage = 'Invalid email format';
              break;
            case 'Firebase: Password should be at least 6 characters (auth/weak-password).':
              this.errorMessage = 'Password should be at least 6 characters';
              break;
            default:
              this.errorMessage = 'Registration failed: An unknown error occurred.';
          }
          
          sub.unsubscribe();
        },
        complete: () => sub.unsubscribe(),
      });

    this.registrationForm.reset();
  }
}
