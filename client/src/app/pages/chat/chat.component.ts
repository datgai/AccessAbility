import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  // user$ = this.usersService.currentUserProfile$;

  searchControl = new FormControl;

  constructor(){

  }

  ngOnInit(): void {
  }
}
