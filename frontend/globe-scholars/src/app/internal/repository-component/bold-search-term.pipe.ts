import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'boldSearchTerm',
  standalone: true
})
export class BoldSearchTermPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, searchTerm: string): SafeHtml {
    if (!searchTerm || searchTerm.trim() === '') {
      return value;
    }
    const escaped = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const highlighted = value.replace(regex, '<mark>$1</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
