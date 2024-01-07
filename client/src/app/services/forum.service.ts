import { Injectable } from '@angular/core';
import { Post } from '../../../../shared/src/types/post'

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  postList: Post[] = [{
    postId:'post1',
    authorId: 'user1',
	  date: 'Jan 10, 2024',
	  title: 'How to ace your interviews',
	  content: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora expedita dicta totam aspernatur doloremque.',
	  thumbnailUrl: '/assets/header-logo.png',
	  comments: [{
        authorId: "user2",
        date:'Jan 11, 2024',
        content: "This is a great post! :+1:"}],
	  isDonation: false
  },
  {
    postId:'post2',
    authorId: 'user2',
	  date: 'Jan 2, 2023',
	  title: 'My Success Story',
	  content: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora expedita dicta totam aspernatur doloremque.',
	  thumbnailUrl: '/assets/sdg4.png',
	  comments: [{
        authorId: "user1",
        date:'Jan 3, 2024',
        content: "This is a great post!"},
        {
          authorId: "user100",
          date:'Jan 3, 2024',
          content: "Wow thanks for sharing!"}
      
      ],
	  isDonation: false
  },
  {
    postId:'post3',
    authorId: 'user7',
	  date: 'Dec 1, 2023',
	  title: 'How Accessibility\'s scholarship changed my life',
	  content: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora expedita dicta totam aspernatur doloremque.',
	  thumbnailUrl: '/assets/hero-bg.png',
	  comments: [{
        authorId: "user0",
        date:'December 10, 2024',
        content: "This is a great post! :+1:"}],
	  isDonation: true
  }
  ]

  getAllPosts(): Post[] {
    return this.postList;
  }
  
  getPostById(id: string): Post | undefined {
    return this.postList.find(post => post.postId === id);
  }

}
