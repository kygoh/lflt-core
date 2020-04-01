import { Injectable } from '@angular/core';
import { LeafletServiceModule } from './leaflet-service.module';
import { Observable, Subject } from 'rxjs';

export interface EventPayload {
  [key: string]: any;
}

export interface EventInterface {
  type: string;
  payload?: EventPayload;
}

@Injectable({
  providedIn: LeafletServiceModule
})
export class MapFacade {
  private eventSubject: Subject<EventInterface> = new Subject<EventInterface>();

  constructor() {
  }

  get event$(): Observable<EventInterface> {
    return this.eventSubject.asObservable();
  }

  broadcast(event: EventInterface): void {
    this.eventSubject.next(event);
  }

}
