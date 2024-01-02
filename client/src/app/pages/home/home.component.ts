import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Auth, User, getIdToken } from '@angular/fire/auth';
import { FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../shared/authentication.service';
import { TestService } from './services/test.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  public logoutForm!: FormGroup;
  public responseMessage: string | undefined = undefined;
  public user: User | undefined = undefined;

  public isAuthenticated: boolean = localStorage.getItem(
    this.authenticationService.userKey
  )
    ? true
    : false;

  constructor(
    private auth: Auth = inject(Auth),
    private authenticationService: AuthenticationService,
    private testService: TestService,
    private router: Router
  ) {}

  onSubmitLogout(): void {
    this.authenticationService.logout().subscribe({
      next: () => {
        localStorage.removeItem(this.authenticationService.userKey);
        this.router.navigate(['login']);
      },
      error: (error: Error) => console.log(error.message),
    });
  }

  async onSubmit() {
    const token = this.auth.currentUser
      ? await getIdToken(this.auth.currentUser)
      : '';

    this.testService.getTest(token).subscribe({
      next: (response) => {
        this.responseMessage = response.message;
        this.user = response.user;
      },
      error: (response: HttpErrorResponse) => {
        this.responseMessage = response.error.message as string;
      },
    });
  }
}
