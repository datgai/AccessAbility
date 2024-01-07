import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../../../shared/src/types/post'
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent {
  @Input() post!: Post;

/*
  public id: number = 1
  public author: string = 'John'
  public date: string = 'Jan 1, 2024'
  public title: string = 'How to ace your interviews.'
  public content: string = 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora expedita dicta totam aspernatur doloremque. '
  public tag: string = 'Career'
  public comments: number = 12
  public likes: number = 50
*/
}
