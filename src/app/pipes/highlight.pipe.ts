import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  transform(value: string, term: string): any {
    let result = value;
    (value.match(new RegExp(term, 'gi')) || []).forEach(
      (match) => {result = result.replace(match, `<b>${match}</b>`)}
    );
    return result;
  }
}
