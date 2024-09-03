
import { Injectable } from '@angular/core';
import { AlertService, CloudAppConfigService, CloudAppEventsService, InitService } from '@exlibris/exl-cloudapp-angular-lib';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { concatMap, map, take, tap } from 'rxjs/operators';

export interface N8nFormItem {
    id: number,
    name: string,
    description: string,
    url: string,
    createdDate: number,
    createdBy: string,
    modifiedDate: number,
    modifiedBy: string
}

interface ConfigMetadata {
    modifiedDate: number;
}

@Injectable({
    providedIn: 'root'
})
export class AppService {

    private title = new BehaviorSubject<string>('Demo n8n forms');
    private title$ = this.title.asObservable();

    private forms: N8nFormItem[];
    private metadata: ConfigMetadata;

    constructor(private initService: InitService,
        private configService: CloudAppConfigService,
        private eventsService: CloudAppEventsService,
        private alertService: AlertService) { }

    getCurrentUserId() {
        return this.eventsService.getInitData().pipe(take(1), map(data => data.user.primaryId));
    }

    setTitle(title: string) {
        this.title.next(title);
    }

    getTitle(): Observable<string> {
        return this.title$;
    }

    confirmNoRemoteChanges() {
        return this.configService.get().pipe(
            tap(conf => {
                const metadata: ConfigMetadata = conf?.meta;
                if (metadata?.modifiedDate !== this.metadata?.modifiedDate) {
                    this.alertService.error('Could not save changes! Configuration may have changed remotely. Please reload this app.');
                    throw new Error('Configuration changed remotely');
                }
            }));
    }

    saveForms(forms: N8nFormItem[]) {
        return this.confirmNoRemoteChanges().pipe(
            concatMap(() => this.configService.set({ forms, meta: { modifiedDate: Date.now() } })),
            concatMap(() => this.loadForms())
        );
    }

    getForms() {
        if (!this.forms) {
            return this.loadForms();
        }
        return of(cloneDeep(this.forms));
    }

    loadForms() {
        return this.configService.get().pipe(
            tap(conf => {
                this.forms = conf['forms'] ?? [];
                this.metadata = conf['meta'];
            }),
            map(conf => cloneDeep(conf['forms']))
        );
    }

}