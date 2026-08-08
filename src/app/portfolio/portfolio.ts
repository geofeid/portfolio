import { Component, inject } from '@angular/core';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class Portfolio {
  protected readonly data = inject(ContentService);
}
