import { Injectable } from '@angular/core';
import { Post } from '../../../../shared/src/types/post'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { Component, inject } from '@angular/core';
import { Auth, getIdToken } from '@angular/fire/auth';
import { UserStoreService } from './user-store.service';
import { switchMap, catchError } from 'rxjs/operators';
import { UserService } from './user.service';


export type PostDetails = Post & { id: string };

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  constructor(
    private http: HttpClient, 
    private auth: Auth = inject(Auth)
    ) {}

    createPost(body: {
      title: string;
      content: string;
      image: string;
      isDonation: boolean;
    }): Observable<PostDetails> {
      const currentUser = this.auth.currentUser;
  
      if (!currentUser) {
        return throwError(() => 'Current user is undefined.');
      }
  
      return from(currentUser.getIdToken()).pipe(
        switchMap(token => {
          if (!token) {
            return throwError(() => 'Authentication token is missing.');
          }

          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          return this.http.post<PostDetails>(`${environment.baseUrl}/post`, body, { headers });
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
    }

    getPostList(): Observable<PostDetails[]> {
      return this.http.get<PostDetails[]>(`${environment.baseUrl}/posts`);
    }
  
    getPost(postId: string) {
      return this.http.get<PostDetails>(`${environment.baseUrl}/posts/${postId}`);
    }

    deletePost(postId: string): Observable<void> {
      return this.http.delete<void>(`${environment.baseUrl}/post/${postId}`);
    }
  
}
