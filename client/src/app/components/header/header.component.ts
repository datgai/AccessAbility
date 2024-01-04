import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(
    public userStore: UserStoreService,
    private authenticationService: AuthenticationService,
    private router: Router,
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
}
