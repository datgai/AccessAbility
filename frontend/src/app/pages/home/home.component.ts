import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Auth, User, getIdToken, onAuthStateChanged } from '@angular/fire/auth';
import { FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../shared/authentication.service';
import { TestService } from './services/test.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  public isAuthenticated = false;
  public logoutForm!: FormGroup;
  public responseMessage: string | undefined = undefined;
  public user: User | undefined = undefined;

  constructor(
    private auth: Auth = inject(Auth),
    private authenticationService: AuthenticationService,
    private testService: TestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (user) => {
      this.isAuthenticated = user ? true : false;
      if (user) console.log(user);
    });
  }

  onSubmitLogout(): void {
    const sub: Subscription = this.authenticationService.logout().subscribe({
      next: () => {
        localStorage.removeItem(this.authenticationService.userKey);
        this.router.navigate(['login']);
      },
      error: (error: Error) => {
        console.log(error.message);
        sub.unsubscribe();
      },
      complete: () => sub.unsubscribe(),
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
      error: (error: HttpErrorResponse) => {
        this.responseMessage = error.error.message as string;
      },
    });
  }
}
