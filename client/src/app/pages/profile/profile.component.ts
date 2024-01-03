import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth, User, getIdToken } from '@angular/fire/auth';
import { FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../shared/authentication.service';
import { TestService } from '../../service/test.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent {
  
  public isAuthenticated: boolean = localStorage.getItem(
    this.authenticationService.userKey
  )? true
  : false;

  constructor(
    private auth: Auth = inject(Auth),
    private authenticationService: AuthenticationService,
    private testService: TestService,
    private router: Router
  ) {}
   
  
}
