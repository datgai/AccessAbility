import { Component, OnInit, signal } from '@angular/core';
import { Message, ChatService, ChatDetails } from '../../services/chat.service';
import { UserStoreService } from '../../services/user-store.service';
import { ActivatedRoute } from '@angular/router';
import { UserDetails } from '../../services/user.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ChatCardComponent } from "../../components/chat-card/chat-card.component";
import { Auth } from '@angular/fire/auth';

@Component({
    selector: 'app-messages',
    standalone: true,
    templateUrl: './messages.component.html',
    styleUrl: './messages.component.css',
    imports: [ReactiveFormsModule, FormsModule, CommonModule, ChatCardComponent]
})
export class MessagesComponent implements OnInit{
  public loading = signal<boolean>(true);

  
  otherUser: UserDetails | undefined
  public messageInput = new FormControl<string>('');
  public messages$ = this.chatService.getMessages(this.route.snapshot.paramMap.get('id')!) as Observable<Message[]>;
  public chat = signal<ChatDetails | undefined>(undefined);
  public UserId = this.userStore.user?.uid!;
  public chatId = this.route.snapshot.paramMap.get('id')!;

  constructor(
    private chatService:ChatService,
    public userStore: UserStoreService,    
    private route:ActivatedRoute,
    private auth:Auth
  ){

  }

  sendMessage(chatId: string){
    this.chatService.sendMessage(chatId, this.messageInput?.value ?? '').subscribe();
    this.messageInput.reset();
  }

  formatDate(date: any): string {
    return new Date(date.seconds * 1000).toLocaleString();
  }

  getOtherUserIndex (userId : string, usersIdArray : string[]){
    if (usersIdArray.indexOf(userId) === 1) {
      return 0;
    } else {
      return 1;
    }
  }

  ngOnInit() {
    const chatId = this.route.snapshot.paramMap.get('id');

    this.auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const token = await user.getIdToken();
      
      this.chatService.getChatById(token,chatId!).subscribe({
        next: (response) => this.chat.set(response),
        complete: () => this.loading.set(false),
        error: (err) => console.error(err),
      });
    })
  }
}
