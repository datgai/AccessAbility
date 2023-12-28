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
import { Subscription, map } from 'rxjs';
import { AuthenticationService } from '../../shared/authentication.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  public registrationForm!: FormGroup;
  public componentTitle: string = 'Create An Account'; 

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

  onSubmit(): void {
    const { email, password } = this.registrationForm.value;

    if (!email || !password) {
      console.log(this.registrationForm.errors);
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
          console.log(error.message);
          sub.unsubscribe();
        },
        complete: () => sub.unsubscribe(),
      });

    this.registrationForm.reset();
  }
}
