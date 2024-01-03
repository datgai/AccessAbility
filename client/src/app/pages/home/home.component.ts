import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Auth, User, getIdToken } from '@angular/fire/auth';
import { FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfile, UserRole } from '../../../../../shared/src/types/user';
import { TestService } from '../../service/test.service';
import { AuthenticationService } from '../../services/authentication.service';
import { BusinessViewComponent } from '../../views/home/business-view/business-view.component';
import { LandingViewComponent } from '../../views/home/landing-view/landing-view.component';
import { UserViewComponent } from '../../views/home/user-view/user-view.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    LandingViewComponent,
    UserViewComponent,
    BusinessViewComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  public logoutForm!: FormGroup;
  public responseMessage: string | undefined = undefined;
  public UserRole = UserRole;

  public user: (User & { profile: UserProfile }) | undefined = undefined;
  public isAuthenticated!: boolean;

  constructor(
    private auth: Auth = inject(Auth),
    private authenticationService: AuthenticationService,
    private testService: TestService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = localStorage.getItem(this.authenticationService.userKey) ?? '';
    this.isAuthenticated = user ? true : false;
    this.user = user ? JSON.parse(user) : undefined;
  }

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
        this.user = response.user as User & { profile: UserProfile };
      },
      error: (response: HttpErrorResponse) => {
        this.responseMessage = response.error.message as string;
      },
    });
  }
}
