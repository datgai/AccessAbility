import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ResourcesService } from '../../services/resources.service';

@Component({
  selector: 'app-create-resource',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './create-resource.component.html',
  styleUrl: './create-resource.component.css',
})
export class CreateResourceComponent implements OnInit {
  public form!: FormGroup;
  public thumbnail = signal<File | null>(null);

  constructor(
    private formBuilder: FormBuilder,
    private resourceService: ResourcesService,
    private auth: Auth,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      title: new FormControl<string>('', Validators.required),
      description: new FormControl<string>('', Validators.required),
      price: new FormControl<number>(0, Validators.required),
      thumbnail: new FormControl<File | null>(null),
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

    this.resourceService.createResource(token, formData).subscribe({
      next: (resource) => this.router.navigate(['resource', resource.id]),

      complete: () =>
        this.toastr.success(
          'Created resource successfully. Awaiting admin verification.',
        ),
    });
    return;
  }
}
