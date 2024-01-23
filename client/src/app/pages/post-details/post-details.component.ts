import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkdownModule, MarkdownPipe } from 'ngx-markdown';
import { ToastrService } from 'ngx-toastr';
import { CommentComponent } from '../../components/comment/comment.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { ForumService, PostDetails } from '../../services/forum.service';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [
    CommonModule,
    CommentComponent,
    MarkdownModule,
    MarkdownPipe,
    FormsModule,
    ReactiveFormsModule,
    LoaderComponent,
  ],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css',
})
export class PostDetailsComponent implements OnInit {
  public post = signal<PostDetails | undefined>(undefined);
  public comment = new FormControl<string>('', Validators.required);

  constructor(
    private forumService: ForumService,
    private route: ActivatedRoute,
    private router: Router,
    private auth: Auth,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId) return this.router.navigate(['404']);

    this.forumService.getPostById(postId).subscribe({
      next: (post) => this.post.set(post),
      error: (error) => {
        console.error('Error loading post:', error);
      },
    });

    return;
  }

  formatDate(date: Date | undefined): string {
    return (date ? new Date(date) : new Date()).toLocaleDateString();
  }

  onSubmit() {
    this.auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const token = await user.getIdToken();

      this.forumService
        .addComment(this.post()!.id, token, this.comment.value ?? '')
        .subscribe({
          next: (response) => {
            this.comment.reset();
            this.toastr.success(response.message);
          },
          complete: () => this.ngOnInit(),
        });
    });
  }
}
