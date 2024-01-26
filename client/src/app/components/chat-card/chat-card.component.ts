import { Component, Input, OnInit } from '@angular/core';
import { ChatDetails, ChatService } from '../../services/chat.service';
import { RouterModule } from '@angular/router';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-chat-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './chat-card.component.html',
  styleUrl: './chat-card.component.css'
})
export class ChatCardComponent implements OnInit {
  @Input() chat!: ChatDetails;

  chatLastMessageDate: String = '';
  UserId = this.userStore.user?.uid!;
  // otherUserIndex = this.getOtherUserIndex(this.userStore.user?.uid!,this.chat.userIds);

  constructor(private chatService:ChatService, private userStore:UserStoreService){
  }

  formatDate(date: any): string {
    return new Date(date.seconds * 1000).toLocaleString();
  }

  getOtherUserIndex(userId : string, usersIdArray : string[]){
    return this.chatService.getOtherUserIndex(userId, usersIdArray);
  }

  ngOnInit(): void {

  }
}
