import { Component } from '@angular/core';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent {

  public author: string = 'John'
  public date: string = 'Jan 1, 2024'
  public title: string = 'How to ace your interviews.'
  public content: string = 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora expedita dicta totam aspernatur doloremque. '
  public tag: string = 'Career'
  public comments: number = 12
  public likes: number = 50

}
