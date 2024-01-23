import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostDetails } from '../../services/forum.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css',
})
export class PostComponent implements OnInit {
  @Input() post!: PostDetails;

  postId: string = '';
  postAuthor: string = '';

  ngOnInit(): void {
    this.postId = this.post.id;
  }

  formatDate(date: Date): string {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toISOString().split('T')[0];
    return formattedDate;
  }

  truncatedContent(): string {
    const maxLength = 80;
    return this.post.content.length > maxLength
      ? this.post.content.substring(0, maxLength) + '...'
      : this.post.content;
  }
}
