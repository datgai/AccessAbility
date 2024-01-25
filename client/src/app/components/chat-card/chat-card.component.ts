import { Component, Input, OnInit } from '@angular/core';
import { ChatDetails } from '../../services/chat.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-chat-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './chat-card.component.html',
  styleUrl: './chat-card.component.css'
})
export class ChatCardComponent implements OnInit {
  @Input() chat!: ChatDetails;

  chatId: String = '';
  chatLastMessageDate: String = '';

  ngOnInit(): void {
    this.chatId = this.chat.id;
  }
  
}
