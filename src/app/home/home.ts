import { Component, inject } from '@angular/core';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly data = inject(ContentService);
}
