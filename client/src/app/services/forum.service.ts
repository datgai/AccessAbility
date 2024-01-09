import { Injectable } from '@angular/core';
import { Post } from '../../../../shared/src/types/post'

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  postList: Post[] = [{
    postId:'post1',
    authorId: 'Alison',
	  date: 'Jan 10, 2024',
	  title: 'How to ace your interviews',
	  content: 'Landing that dream job often hinges on how well you perform during the interview. Here are some expert tips to help you navigate the interview process with confidence and leave a lasting impression. ',
	  thumbnailUrl: 'https://www.jobsite.co.uk/advice/wp-content/uploads/the-most-common-interview-questions.jpg',
	  comments: [{
        authorId: "Jane",
        date:'Jan 11, 2024',
        content: "This is a great post!:"}],
	  isDonation: false
  },
  {
    postId:'post2',
    authorId: 'Kevin',
	  date: 'Jan 2, 2023',
	  title: 'My Career Journey',
	  content: 'Overcoming societal misconceptions and barriers, I transformed my disability into a source of strength. Armed with a passion for technology, I delved into the world of accessible design, creating innovative solutions that empowered not only myself but also countless others facing similar challenges.',
	  thumbnailUrl: 'https://www.nationaldisabilityinstitute.org/wp-content/uploads/2022/07/small-business-research-report-featured-image.png',
	  comments: [{
        authorId: "Johnson",
        date:'Jan 3, 2024',
        content: "This is so inspiring."},
        {
          authorId: "Lee",
          date:'Jan 3, 2024',
          content: "Wow thanks for sharing!"}
      
      ],
	  isDonation: false
  },
  {
    postId:'post3',
    authorId: 'Priscilla',
	  date: 'Dec 1, 2023',
	  title: 'How Accessibility\'s scholarship changed my life',
	  content: 'Getting the scholarship was a transformative moment in my life. As a student with a passion for technology but limited financial means, the scholarship not only eased the burden of tuition but also opened doors to a world of opportunities',
	  thumbnailUrl: 'https://www.brookings.edu/wp-content/uploads/2023/04/shutterstock_658847998.jpg?w=1500',
	  comments: [{
        authorId: "Sam",
        date:'December 10, 2024',
        content: "Congrats"}],
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
