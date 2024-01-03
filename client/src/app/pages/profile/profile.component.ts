import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { TestService } from '../../services/test.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  public isAuthenticated: boolean = localStorage.getItem(
    this.authenticationService.userKey,
  )
    ? true
    : false;

  constructor(
    private auth: Auth = inject(Auth),
    private authenticationService: AuthenticationService,
    private testService: TestService,
    private router: Router,
  ) {}
}
