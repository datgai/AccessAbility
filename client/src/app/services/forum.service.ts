import { Injectable } from '@angular/core';
import { Post } from '../../../../shared/src/types/post'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { throwError, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { switchMap, catchError } from 'rxjs/operators';

export type PostDetails = Post & { id: string };

export interface PostResponse {
  posts: PostDetails[];
}

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
    }) {
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

    getPostList() {
      return this.http.get<PostResponse>(`${environment.baseUrl}/posts`);
    }
  
    getPost(postId: string) {
      return this.http.get<PostDetails>(`${environment.baseUrl}/post/${postId}`);
    }

    deletePost(postId: string) {
      return this.http.delete<PostDetails>(`${environment.baseUrl}/post/${postId}`);
    }
}
