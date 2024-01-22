import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SummaryCardComponent } from '../../../components/summary-card/summary-card.component';
import { ApplicantsComponent } from '../../../pages/applicants/applicants.component';
import { UserStoreService } from '../../../services/user-store.service';

@Component({
  selector: 'app-business-view',
  standalone: true,
  imports: [SummaryCardComponent, RouterLink, ApplicantsComponent],
  templateUrl: './business-view.component.html',
  styleUrl: './business-view.component.css',
})
export class BusinessViewComponent {
  public numApplicants = signal<number>(0);
  public numOffersGiven = signal<number>(0);

  constructor(public userStore: UserStoreService) {}

  setStats(event: { numApplicants: number; numOffersGiven: number }) {
    this.numApplicants.set(event.numApplicants);
    this.numOffersGiven.set(event.numOffersGiven);
  }
}
