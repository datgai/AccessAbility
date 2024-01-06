import { Component,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ForumService } from '../../services/forum.service';


@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule,ActivatedRoute, ForumService],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css'
})
export class PostDetailsComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  forumService = inject(ForumService);

  constructor() {
    const postId = Number(this.route.snapshot.params['id']);
    //this.postDetails = this.forumService.getPostDetailsById(postId);
  }

}
