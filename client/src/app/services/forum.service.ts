import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
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
  nextPageToken?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ForumService {
  constructor(
    private http: HttpClient,
    private auth: Auth,
  ) {}

  createPost(token: string, body: FormData) {
    return this.http.post<PostDetails>(`${environment.baseUrl}/post`, body, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
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
