import { Routes } from '@angular/router';
import { CreateJobComponent } from './pages/create-job/create-job.component';
import { ForumComponent } from './pages/forum/forum.component';
import { HomeComponent } from './pages/home/home.component';
import { JobDetailsComponent } from './pages/job-details/job-details.component';
import { JobListingComponent } from './pages/job-listing/job-listing.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { LoginComponent } from './pages/login/login.component';
import { MyJobsComponent } from './pages/my-jobs/my-jobs.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'jobs', component: JobsComponent },
  { path: 'jobs/:id', component: JobDetailsComponent },
  { path: 'job-listing', component: JobListingComponent },
  { path: 'my-jobs', component: MyJobsComponent },
  { path: 'create-job', component: CreateJobComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'forum', component: ForumComponent },
  { path: '**', component: NotFoundComponent },
];
