import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly lightMode = signal(false);

  toggleTheme(): void {
    this.lightMode.update((v) => !v);
    document.body.classList.toggle('light-mode', this.lightMode());
  }
}
