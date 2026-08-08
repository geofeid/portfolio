import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Portfolio } from './portfolio/portfolio';
import { Blogs } from './blogs/blogs';
import { Contact } from './contact/contact';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: 'portfolio', component: Portfolio },
  { path: 'blogs', component: Blogs },
  { path: 'contact', component: Contact },
  { path: '**', redirectTo: '' },
];
