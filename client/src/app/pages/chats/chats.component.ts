import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ChatDetails,ChatService} from '../../services/chat.service';
import { UserStoreService } from '../../services/user-store.service';
import { ChatCardComponent } from '../../components/chat-card/chat-card.component';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule, ChatCardComponent,CommonModule],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class ChatsComponent implements OnInit {
  public loading = signal<boolean>(true);
  public chats = signal<ChatDetails[]>([]);
  
  public chats$ = this.chatService.getChats(this.userStore.user?.uid!) as Observable<ChatDetails[]>;

  constructor(
    private chatService:ChatService,
    public userStore: UserStoreService
  ){
    this.chatService.getChats(this.userStore.user?.uid!).subscribe({
      next: (response) => this.chats.set(response),
      complete: () => this.loading.set(false),
      error: (err) => console.error(err),
    });

  }

  ngOnInit() {
  }
}
