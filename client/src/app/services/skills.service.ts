import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SkillsService {
  constructor(private http: HttpClient) {}

  getSkill(skillId: string) {
    return this.http.get<{ name: string }>(
      `${environment.baseUrl}/skill/${skillId}`,
    );
  }

  getSkills(filter?: string) {
    return this.http.get<{ id: string; name: string }[]>(
      `${environment.baseUrl}/skills${filter ? `?filter=${filter}` : ''}`,
    );
  }
}
