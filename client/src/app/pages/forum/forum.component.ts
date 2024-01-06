import { Component } from '@angular/core';
import { PostComponent } from '../../components/post/post.component';
import { UserStoreService } from '../../services/user-store.service'

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [PostComponent, ],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.css'
})
export class ForumComponent {
  constructor(
    private userStore: UserStoreService
  ){}

  public isAuthenticated: boolean = localStorage.getItem(this.userStore.userKey)
    ? true
    : false;

}
