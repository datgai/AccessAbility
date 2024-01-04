import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Auth, getIdToken } from '@angular/fire/auth';
import { UserRole } from '../../../../../shared/src/types/user';
import { TestService } from '../../services/test.service';
import { UserStoreService } from '../../services/user-store.service';
import { BusinessViewComponent } from '../../views/home/business-view/business-view.component';
import { LandingViewComponent } from '../../views/home/landing-view/landing-view.component';
import { UserViewComponent } from '../../views/home/user-view/user-view.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LandingViewComponent, UserViewComponent, BusinessViewComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  public responseMessage: string | undefined = undefined;
  public UserRole = UserRole;

  constructor(
    private auth: Auth = inject(Auth),
    private testService: TestService,
    public userStore: UserStoreService,
  ) {}

  async onSubmit() {
    const token = this.auth.currentUser
      ? await getIdToken(this.auth.currentUser)
      : '';

    this.testService.getTest(token).subscribe({
      next: (response) => {
        this.responseMessage = response.message;
        // this.user = response.user as User & { profile: UserProfile };
      },
      error: (response: HttpErrorResponse) => {
        this.responseMessage = response.error.message as string;
      },
    });
  }
}
