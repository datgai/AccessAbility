import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarkdownModule, MarkdownPipe } from 'ngx-markdown';
import { ToastrService } from 'ngx-toastr';
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
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    const resourceId = this.route.snapshot.paramMap.get('id');
    if (!resourceId) return this.router.navigate(['404']);

    this.auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const token = await user.getIdToken();
      this.resourcesService.getResourceById(resourceId, token).subscribe({
        next: (resource) => this.resource.set(resource),
        error: (error: HttpErrorResponse) => {
          if (error.status === 403) return this.router.navigate(['404']);
          return this.toastr.error(error.error.message || error.message);
        },
      });
    });

    return;
  }

  formatDate(date: Date | undefined): string {
    return (date ? new Date(date) : new Date()).toLocaleDateString();
  }

  get price() {
    if (!this.resource()) return 'FREE';
    return String(this.resource()!.price) === '0.00'
      ? 'FREE'
      : `RM ${this.resource()?.price}`;
  }
}
