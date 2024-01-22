import { Component,OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../../../../../shared/src/types/post';
import { ForumService } from '../../services/forum.service';
import { CommentComponent } from '../../components/comment/comment.component';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, CommentComponent],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css'
})
export class PostDetailsComponent implements OnInit{
  public postId: string = '' 

  forumService = inject(ForumService);
  post: Post | undefined;

  constructor(private route:ActivatedRoute){}

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    this.postId = params['id'];
    
    this.forumService.getPost(this.postId).subscribe(
      (post) => {
        this.post = post;
        console.log('Post loaded successfully:', this.post);
      },
      (error) => {
        console.error('Error loading post:', error);
      }
    );
  }

  formatDate(date: Date | undefined): string {
    return (date ? new Date(date) : new Date()).toLocaleDateString();
  }
  
  
}
