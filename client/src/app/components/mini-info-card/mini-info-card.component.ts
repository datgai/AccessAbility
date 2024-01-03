import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mini-info-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mini-info-card.component.html',
  styleUrl: './mini-info-card.component.css',
})
export class MiniInfoCardComponent {
  @Input({ required: true }) infoLink!: string;
  @Input({ required: true }) infoImageUrl!: string;
  @Input({ required: true }) infoTitle!: string;
  @Input({ required: true }) infoName!: string;
  @Input({ required: true }) infoType!: string;
}
