import { Component } from '@angular/core';
import { PostComponent } from '../../components/post/post.component';
import { UserStoreService } from '../../services/user-store.service'
import { Post, Comment } from '../../../../../shared/src/types/post'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [PostComponent, CommonModule],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.css'
})
export class ForumComponent {
  constructor(
    public userStore: UserStoreService
  ){}

  postList: Post[] = [{
    postId:'post1',
    authorId: 'user1',
	  date: 'Jan 10, 2024',
	  title: 'How to ace your interviews',
	  content: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora expedita dicta totam aspernatur doloremque.',
	  thumbnailUrl: '/assets/header-logo.png',
	  comments: [{
        authorId: "user2",
        content: "This is a great post! :+1:"}],
	  isDonation: false
  },
  {
    postId:'post2',
    authorId: 'user2',
	  date: 'Jan 2, 2023',
	  title: 'My Success Story',
	  content: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora expedita dicta totam aspernatur doloremque.',
	  thumbnailUrl: '/assets/header-logo.png',
	  comments: [{
        authorId: "user1",
        content: "This is a great post! :+1:"}],
	  isDonation: false
  },
  {
    postId:'post3',
    authorId: 'user7',
	  date: 'Dec 1, 2023',
	  title: 'How Accessibility\'s scholarship changed my life',
	  content: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora expedita dicta totam aspernatur doloremque.',
	  thumbnailUrl: '/assets/header-logo.png',
	  comments: [{
        authorId: "user0",
        content: "This is a great post! :+1:"}],
	  isDonation: true
  }
  ]

  /*
  postList: PostComponent[] = [
  new PostComponent( 0,'John','Jan 1, 2024','How to ace your interviews.',
   'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora expedita dicta totam aspernatur doloremque. ',
    'Career',12,50)
  , 
  new PostComponent( 0,'Jane','Jan 4, 2024','My Success Story.',
  'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora expedita dicta totam aspernatur doloremque. ',
   'Community',23,80)
 , 
  ]

  */

}
