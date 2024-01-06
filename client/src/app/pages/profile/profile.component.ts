import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarkdownModule, MarkdownPipe } from 'ngx-markdown';
import { concatMap, from, map, mergeMap, of, switchMap, toArray } from 'rxjs';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MiniInfoCardComponent } from '../../components/mini-info-card/mini-info-card.component';
import { SummaryCardComponent } from '../../components/summary-card/summary-card.component';
import { SkillsService } from '../../services/skills.service';
import {
  UserResponse,
  UserStoreService,
} from '../../services/user-store.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    LoaderComponent,
    SummaryCardComponent,
    MiniInfoCardComponent,
    MarkdownModule,
    MarkdownPipe,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  public user = signal<UserResponse | undefined>(undefined);
  public openModal = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private skillsService: SkillsService,
    public userStore: UserStoreService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return this.router.navigate(['404']);

    this.userService
      .getUser(id)
      .pipe(
        mergeMap((user) => {
          const skillIds = Array.from(new Set(user.profile.skills));

          return from(skillIds).pipe(
            concatMap((skillId) => this.skillsService.getSkill(skillId)),
            map((skill) => skill.name),
            toArray(),
            switchMap((skills) => {
              user.profile.skills = skills;
              return of(user);
            }),
          );
        }),
      )
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.userStore.user = user;
        },
        error: (err) => {
          console.error(err);
          this.router.navigate(['404']);
        },
      });

    return;
  }
}
