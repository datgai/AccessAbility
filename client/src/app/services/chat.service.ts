import { Injectable } from '@angular/core';
import { UserDetails } from './user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { Auth } from '@angular/fire/auth';

export interface Chat {
  cid: string;
  lastMessage?:string;
  lastMessageDate?:Date;
  userIds: string[];
  users: UserDetails[];

  //only for display
  chatPic?: string;
  chatName?: string;
}

export interface ChatDetails{
  userIds: string[];
  users:UserDetails[]
}

export interface Message{
  text: string;
  senderId: string;
  sentDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http: HttpClient,private auth: Auth,) { }

  createChat(otherUser:UserDetails){
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      return throwError(() => 'Current user is undefined.');
    }

    return from(currentUser.getIdToken()).pipe(
      switchMap((token) => {
        if (!token) {
          return throwError(() => 'Authentication token is missing.');
        }
        const headers = new HttpHeaders().set(
          'Authorization',
          `Bearer ${token}`,
        );
        return this.http.post<ChatDetails>(
          `${environment.baseUrl}/chat`,
          otherUser,
          { headers },
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  addChatNameAndPic(currentUserId: string, chats:Chat[]): Chat[]{
    chats.forEach(chat => {
      const otherIndex = chat.userIds.indexOf(currentUserId) === 0 ? 1 :0;
      const {displayName, photoURL} = chat.users[otherIndex];
      chat.chatName = displayName || '';
      chat.chatPic = photoURL|| '';
    })
    return chats
  }
}
