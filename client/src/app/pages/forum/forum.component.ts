import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from '../../components/loader/loader.component';
import { PostComponent } from '../../components/post/post.component';
import { ForumService, PostDetails } from '../../services/forum.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [PostComponent, CommonModule, RouterModule, LoaderComponent],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.css',
})
export class ForumComponent implements OnInit {
  public loading = signal<boolean>(true);
  public posts = signal<PostDetails[]>([]);
  public nextPageToken = signal<string | undefined>('');

  constructor(
    public userStore: UserStoreService,
    private forumService: ForumService,
  ) {}

  ngOnInit(): void {
    this.forumService.getPosts().subscribe({
      next: (response) => {
        this.posts.set(response.posts);
        this.nextPageToken.set(response.nextPageToken);
      },
      complete: () => this.loading.set(false),
      error: (err) => console.error(err),
    });
  }
}
