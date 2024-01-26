import { Injectable, inject } from '@angular/core';
import { UserDetails } from './user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, collectionChanges, collectionData, orderBy, query, where } from '@angular/fire/firestore';

export interface ChatDetails {
  id: string;
  lastMessage?:string;
  lastMessageDate?:Date;
  userIds: string[];
  users: UserDetails[];

  //only for display
  chatPic?: string;
  chatName?: string;
}

export interface Message{
  id:string;
  text: string;
  senderId: string;
  sentDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  firestore: Firestore = inject(Firestore);

  constructor(private http: HttpClient,private auth: Auth) { }
 
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

  getChats = (userId: string) => {
    const ChatsQuery = query(collection(this.firestore, 'chats'), where('userIds','array-contains',userId), orderBy('lastMessageDate','asc'));
    return collectionData(ChatsQuery,{ idField: 'id'});
  }

  getMessages = (chatId: string) => {
    const recentMessagesQuery = query(collection(this.firestore, 'chats', chatId, 'message'), orderBy('sentDate', 'asc'));
    return collectionData(recentMessagesQuery,{ idField: 'id'});
  }
  
  sendMessage(chatId: string,message:String){
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
        return this.http.post<Message>(
          `${environment.baseUrl}/message/${chatId}`,
          {content : message},
          { headers },
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }
}
