import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentComponent } from '../../components/comment/comment.component';
import { ForumService, PostDetails } from '../../services/forum.service';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, CommentComponent],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css',
})
export class PostDetailsComponent implements OnInit {
  public post = signal<PostDetails | undefined>(undefined);

  constructor(
    private forumService: ForumService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId) return this.router.navigate(['404']);

    this.forumService.getPostById(postId).subscribe({
      next: (post) => {
        this.post.set(post);
        console.log('Post loaded successfully:', this.post);
      },
      error: (error) => {
        console.error('Error loading post:', error);
      },
    });

    console.log(this.post());

    return;
  }

  formatDate(date: Date | undefined): string {
    return (date ? new Date(date) : new Date()).toLocaleDateString();
  }
}
