import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { RouterLink } from '@angular/router';
import { MarkdownModule, MarkdownPipe } from 'ngx-markdown';
import { LoaderComponent } from '../../components/loader/loader.component';
import {
  ResourceDetails,
  ResourcesService,
} from '../../services/resources.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    MarkdownPipe,
    MarkdownModule,
    LoaderComponent,
  ],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css',
})
export class ResourcesComponent implements OnInit {
  public resources = signal<ResourceDetails[]>([]);
  public nextPageToken = signal<string | undefined>('');
  public loading = signal<boolean>(true);

  constructor(
    private resourcesService: ResourcesService,
    private auth: Auth,
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    this.auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const token = await user.getIdToken();
      this.resourcesService.getResources(token).subscribe({
        next: (response) => {
          this.resources.set(response.resources);
          this.nextPageToken.set(response.nextPageToken);
        },
        complete: () => this.loading.set(false),
      });
    });
  }
}
