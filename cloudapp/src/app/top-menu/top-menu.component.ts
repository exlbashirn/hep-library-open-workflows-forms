import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from '../app.service';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent {

  router: Router;
  title$: Observable<string>;

  @Input() disabled = false;

  constructor(router: Router, private appService: AppService) {
    this.router = router;
    this.title$ = this.appService.getTitle();
  }

}