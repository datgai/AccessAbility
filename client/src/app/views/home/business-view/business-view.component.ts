import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { RouterLink } from '@angular/router';
import { SummaryCardComponent } from '../../../components/summary-card/summary-card.component';
import { ApplicantsComponent } from '../../../pages/applicants/applicants.component';
import { UserStoreService } from '../../../services/user-store.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-business-view',
  standalone: true,
  imports: [SummaryCardComponent, RouterLink, ApplicantsComponent],
  templateUrl: './business-view.component.html',
  styleUrl: './business-view.component.css',
})
export class BusinessViewComponent implements OnInit {
  public numApplicants = signal<number>(0);
  public numOffersGiven = signal<number>(0);

  constructor(
    private userService: UserService,
    private auth: Auth,
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    this.auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const token = await user.getIdToken();

      this.userService.getOffersByBusiness(token).subscribe({
        next: (offers) => {
          console.log(offers);
          this.numOffersGiven.set(offers.length);
        },
      });
    });
  }

  setStats(event: { numApplicants: number }) {
    this.numApplicants.set(event.numApplicants);
  }
}
