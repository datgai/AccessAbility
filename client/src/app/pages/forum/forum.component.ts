import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostComponent } from '../../components/post/post.component';
import { ForumService, PostDetails } from '../../services/forum.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [PostComponent, CommonModule, RouterModule],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.css'
})

export class ForumComponent implements OnInit{
  postList: PostDetails[] = [];
  forumService: ForumService = inject(ForumService);

  constructor(public userStore: UserStoreService) {}

  ngOnInit(): void {
    this.loadPosts()
  }

  loadPosts() {
  this.forumService.getPosts().subscribe({
    next: (response) => {
      this.postList = response.posts
    },
    error: (err) => console.error(err),
  });
}

}
