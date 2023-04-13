import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {

  transform(value: string | number, ...args: unknown[]): string {
    return `<a target="_child" href="${value}">${value}</a>`;
  }

}
