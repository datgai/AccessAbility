import { Component } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ForumService } from '../../services/forum.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export class CreatePostComponent {

  createPostForm: FormGroup = new FormGroup(
    {
      postTitle: new FormControl('', [Validators.required]),
      postContent: new FormControl('', [Validators.required]),
      thumbnailUrl: new FormControl(''),
      isDonation: new FormControl(false, [Validators.required])
  }
  );

  constructor(
    private forumService: ForumService, 
    private router: Router
  ) {}

  onSubmit() {
    const { postTitle, postContent, thumbnailUrl, isDonation } = this.createPostForm.value;

    const postBody = {
      title: postTitle,
      content: postContent,
      image: thumbnailUrl,
      isDonation: isDonation, 
    };
    
    this.forumService.createPost(postBody).subscribe({
      next:(post) => {
        console.log('Post created successfully:', post);
        this.router.navigate(['/forum']); 
      },
      error: (err) => console.error('Error creating post:', err)
    });
  }

}
