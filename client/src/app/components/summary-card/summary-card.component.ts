import { Component, Input } from '@angular/core';

interface SummaryInfo {
  title: string;
  stats: number;
}

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.css',
})
export class SummaryCardComponent {
  @Input({ required: true }) summaryInfo!: SummaryInfo[];
}
