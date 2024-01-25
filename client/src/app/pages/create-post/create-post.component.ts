import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ForumService } from '../../services/forum.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css',
})
export class CreatePostComponent implements OnInit {
  public form!: FormGroup;
  public thumbnail = signal<File | null>(null);

  constructor(
    private formBuilder: FormBuilder,
    private forumService: ForumService,
    private router: Router,
    private toastr: ToastrService,
    private auth: Auth,
    public userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      title: new FormControl<string>('', Validators.required),
      content: new FormControl<string>('', Validators.required),
      thumbnail: new FormControl<File | null>(null),
      isDonation: new FormControl<boolean>(false),
    });
  }

  onThumbnailSelect(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    const file = files && files.length > 0 ? files[0] : null;
    this.thumbnail.set(file);
  }

  async onSubmit() {
    if (!this.form.valid) {
      return this.toastr.error('Missing inputs.');
    }

    const formData = new FormData();

    Object.keys(this.form.value).forEach((key) => {
      if (this.form.value[key] !== '') {
        formData.append(key, this.form.value[key]);
      }
    });

    if (this.thumbnail()) formData.set('thumbnail', this.thumbnail()!);

    const token = await this.auth.currentUser?.getIdToken();
    if (!token) {
      return this.toastr.error('You are not authorised to create a resource.');
    }

    this.forumService.createPost(token, formData).subscribe({
      next: (post) => this.router.navigate(['/post', post.id]),
      error: (err) => console.error('Error creating post:', err),
      complete: () => this.toastr.success('Post created successfully.'),
    });

    return;
  }
}
