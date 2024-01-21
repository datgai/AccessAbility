import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ForumService } from '../../services/forum.service';
import { HttpClient } from '@angular/common/http';

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
    private httpClient: HttpClient,
    private forumService: ForumService
  ) {}

  onSubmit() {
    
  }



}
