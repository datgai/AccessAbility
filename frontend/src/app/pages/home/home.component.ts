import { Component, OnInit, inject } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../shared/authentication.service';

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

  constructor(
    private auth: Auth = inject(Auth),
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (user) => {
      this.isAuthenticated = user ? true : false;
      if (user) console.log(user);
    });
  }

  onSubmit(): void {
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
}
