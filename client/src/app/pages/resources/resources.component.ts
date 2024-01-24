import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResourcesService } from '../../services/resources.service';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { MarkdownModule, MarkdownPipe } from 'ngx-markdown';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [RouterLink, CommonModule, MarkdownPipe, MarkdownModule],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css',
})
export class ResourcesComponent implements OnInit {
  public resources = signal<any[]>([]);
  constructor(
    private resourcesService: ResourcesService,
    private auth: Auth,
  ) {}
  ngOnInit(): void {
    this.auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const token = await user.getIdToken();
      this.resourcesService.getResources(token).subscribe({
        next: (response: any) => {
          this.resources.set(response.resources);
        },
      });
    });
  }
}
