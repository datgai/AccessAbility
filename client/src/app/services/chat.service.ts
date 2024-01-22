import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from 'firebase/firestore';
import { Observable, concatMap, map, take } from 'rxjs';
import { UserService } from './user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserResponse } from './user-store.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private firestore: Firestore,private userService: UserService,private route: ActivatedRoute,private router: Router,) { }

  createChat(otherUser : UserResponse) : Observable<string>{
    const ref = collection(this.firestore, 'chats');
    const id = this.route.snapshot.paramMap.get('id');

    return this.userService.getUser(id!).pipe(
      take(1),
      concatMap(user => addDoc(ref, {
        userIds: [user?.uid, otherUser?.uid],
        users:[
          {
            displayName: user?.profile.firstName ?? 'Unknown',
            photoURL: user?.photoURL??''
          },
          {
            displayName: otherUser?.profile.firstName ?? 'Unknown',
            photoURL: otherUser?.photoURL??''
          }
        ]
      })),
      map(ref => ref.id)
    )

  }
}
