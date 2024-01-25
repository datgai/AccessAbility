import { Injectable, inject } from '@angular/core';
import { UserDetails } from './user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, collectionData, orderBy, query } from '@angular/fire/firestore';

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

  getChats(userId: string){
    return this.http.get<ChatDetails[]>(`${environment.baseUrl}/chats/${userId}`)
  }


  getChatById(chatId: string){
    return this.http.get<ChatDetails>(`${environment.baseUrl}/chat/${chatId}`)
  }

  getMessages$(chatId: string) : Observable<Message[]>{
    return this.http.get<Message[]>( `${environment.baseUrl}/message/${chatId}`)
  }

  loadMessages = (chatId: string) => {
    // Create the query to load the last 12 messages and listen for new ones.
    const recentMessagesQuery = query(collection(this.firestore, 'chats', chatId, 'message'), orderBy('sentDate', 'asc'));
    // Start listening to the query.
    console.log(collectionData(recentMessagesQuery));
    return collectionData(recentMessagesQuery);
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
