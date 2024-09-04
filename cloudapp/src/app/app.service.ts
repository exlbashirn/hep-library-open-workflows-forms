
import { Injectable } from '@angular/core';
import { AlertService, CloudAppConfigService, CloudAppEventsService, CloudAppRestService, InitService } from '@exlibris/exl-cloudapp-angular-lib';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { concatMap, map, take, tap } from 'rxjs/operators';

export interface N8nFormItem {
    id: number,
    name: string,
    description: string,
    path: string,
    createdDate: number,
    createdBy: string,
    modifiedDate: number,
    modifiedBy: string,
    formWorkflow: N8nFormTriggeredWorkflow
}

export interface N8nFormTriggeredWorkflow {
    id: string;
    name: string;
    formPath: string;
    formTitle: string;
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

    private almaUrl: Promise<string>;
    private n8nUrl: Promise<string>;
    private formTriggeredWorkflows: Promise<N8nFormTriggeredWorkflow[]>;

    constructor(private initService: InitService,
        private configService: CloudAppConfigService,
        private eventsService: CloudAppEventsService,
        private alertService: AlertService,
        private restService: CloudAppRestService) {
        this.almaUrl = this.eventsService.getInitData().pipe(take(1),
            map(data => data.urls.alma)).toPromise();
        this.n8nUrl = this.restService.call('/almaws/v1/conf/mapping-tables/WorkflowAutomationToolConfig')
            .pipe(map((data: any) => data.row.find(r => r.column0 === '02_wat_url').column2))
            .toPromise();
        this.formTriggeredWorkflows = this.restService.call<N8nFormTriggeredWorkflow[]>
            ('/library-open-workflows/workflows/form-triggered').toPromise();
    }

    getAlmaUrl() {
        return from(this.almaUrl);
    }

    getN8nInstanceUrl() {
        return from(this.n8nUrl);
    }

    getFormTriggersFromInstance() {
        return from(this.formTriggeredWorkflows);
    }

    getCurrentUserId() {
        return this.eventsService.getInitData().pipe(take(1),
            map(data => data.user.primaryId));
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