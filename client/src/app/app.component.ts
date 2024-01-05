import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { UserStoreService } from './services/user-store.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(
    private userService: UserService,
    private userStore: UserStoreService,
  ) {}

  // Keep local storage in sync when loading the application
  ngOnInit(): void {
    // Delete user from local storage if not logged in
    if (!this.userStore.isAuthenticated()) return this.userStore.deleteUser();

    // Update profile
    this.userService.getUser(this.userStore.user?.uid ?? '').subscribe({
      next: (user) => (this.userStore.user = user),
    });
  }
}
