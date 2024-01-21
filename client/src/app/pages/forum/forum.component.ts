import { Component, OnInit, inject } from '@angular/core';
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

export class ForumComponent implements OnInit{
  postList: Post[] = [];
  forumService: ForumService = inject(ForumService);

  constructor(public userStore: UserStoreService) {}

  ngOnInit(): void {
    this.loadPosts()
  }

  loadPosts() {
  this.forumService.getPostList().subscribe({
    next: (response) => {
      this.postList = response.posts
    },
    error: (err) => console.error(err),
  });
}

}
