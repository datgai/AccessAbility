import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MarkdownModule, MarkdownPipe } from 'ngx-markdown';
import { PopulatedComment } from '../../services/forum.service';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [MarkdownModule, MarkdownPipe, CommonModule],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css',
})
export class CommentComponent {
  @Input({ required: true }) comment!: PopulatedComment;

  formatDate(date: Date | undefined): string {
    return (date ? new Date(date) : new Date()).toLocaleString();
  }
}
