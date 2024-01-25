import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarkdownModule, MarkdownPipe } from 'ngx-markdown';
import { LoaderComponent } from '../../components/loader/loader.component';
import {
  ResourceDetails,
  ResourcesService,
} from '../../services/resources.service';

@Component({
  selector: 'app-resource-details',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    MarkdownPipe,
    MarkdownModule,
    LoaderComponent,
  ],
  templateUrl: './resource-details.component.html',
  styleUrl: './resource-details.component.css',
})
export class ResourceDetailsComponent implements OnInit {
  public resource = signal<ResourceDetails | undefined>(undefined);

  constructor(
    private resourcesService: ResourcesService,
    private auth: Auth,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    const resourceId = this.route.snapshot.paramMap.get('id');
    if (!resourceId) return this.router.navigate(['404']);

    this.auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const token = await user.getIdToken();
      this.resourcesService.getResourceById(resourceId, token).subscribe({
        next: (resource) => this.resource.set(resource),
      });
    });

    return;
  }

  formatDate(date: Date | undefined): string {
    return (date ? new Date(date) : new Date()).toLocaleDateString();
  }
}
