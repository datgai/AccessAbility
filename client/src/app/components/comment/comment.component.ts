import { Component, Input } from '@angular/core';
import { Comment } from '../../../../../shared/src/types/post';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent {
  @Input() comment!: Comment;
}
