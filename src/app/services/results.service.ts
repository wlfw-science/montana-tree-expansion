import { Injectable } from '@angular/core';

export class Result {
  type: string
  data: any
  constructor(type: string, data: any) {
    this.type = type;
    this.data = data;
  }
}

export interface ResultsHash {
  [id: string]: Result
}

@Injectable({
  providedIn: 'root'
})
export class ResultsService {

  public results: ResultsHash = {}

  constructor() { }

  public set(id: string, value: Result) {
    this.results[id] = value;
  }

  public clear(id: string) {
    try {
      delete this.results['id'];
    } catch (e) {
    }
  }


}
