import { Component, inject } from '@angular/core';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.html',
  styleUrl: './blogs.scss',
})
export class Blogs {
  protected readonly data = inject(ContentService);
}
