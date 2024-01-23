import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Comment, Post } from '../../../../shared/src/types/post';
import { environment } from '../../environments/environment';
import { UserDetails } from './user.service';

export type PopulatedComment = Omit<Comment, 'authorId'> & {
  author: UserDetails;
};

export type PostDetails = Omit<Post, 'authorId' | 'comments'> & {
  id: string;
  author: UserDetails;
  comments: PopulatedComment[];
};

export interface PostResponse {
  posts: PostDetails[];
}

@Injectable({
  providedIn: 'root',
})
export class ForumService {
  constructor(
    private http: HttpClient,
    private auth: Auth = inject(Auth),
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
      switchMap((token) => {
        if (!token) {
          return throwError(() => 'Authentication token is missing.');
        }
        const headers = new HttpHeaders().set(
          'Authorization',
          `Bearer ${token}`,
        );
        return this.http.post<PostDetails>(
          `${environment.baseUrl}/post`,
          body,
          { headers },
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  getPosts() {
    return this.http.get<PostResponse>(`${environment.baseUrl}/posts`);
  }

  getPostById(postId: string) {
    return this.http.get<PostDetails>(`${environment.baseUrl}/post/${postId}`);
  }

  deletePostById(postId: string) {
    return this.http.delete<PostDetails>(
      `${environment.baseUrl}/post/${postId}`,
    );
  }

  addComment(postId: string, token: string, comment: string) {
    return this.http.patch<{ message: string }>(
      `${environment.baseUrl}/post/${postId}`,
      { content: comment },
      { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) },
    );
  }
}
