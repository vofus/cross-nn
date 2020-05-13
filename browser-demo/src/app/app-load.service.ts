import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Injectable({
  providedIn: 'root'
})
export class AppLoadService {
  private readonly ICONS_REGISTRY = new Map<string, string>([
    ['edit', '/assets/icons/edit.svg'],
    ['save', '/assets/icons/save.svg']
  ]);

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) { }

  /**
   * Инициализировать приложение
   */
  public initApp() {
    this.registerIcons();
  }

  /**
   * Зарегистрировать иконки
   */
  private registerIcons() {
    try {
      for (const [name, url] of this.ICONS_REGISTRY) {
        this.iconRegistry.addSvgIcon(name, this.sanitizer.bypassSecurityTrustResourceUrl(url));
      }
    } catch (err) {
      console.error(err);
    }

  }
}
