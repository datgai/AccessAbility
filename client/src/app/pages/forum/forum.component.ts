import { Component, inject } from '@angular/core';
import { PostComponent } from '../../components/post/post.component';
import { UserStoreService } from '../../services/user-store.service'
import { Post } from '../../../../../shared/src/types/post'
import { CommonModule } from '@angular/common';
import { ForumService } from '../../services/forum.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [PostComponent, CommonModule, RouterModule],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.css'
})

export class ForumComponent{
  postList: Post[] = [];
  forumService: ForumService = inject(ForumService);

  constructor(public userStore: UserStoreService) {
    this.postList = this.forumService.getAllPosts();
  }

}
