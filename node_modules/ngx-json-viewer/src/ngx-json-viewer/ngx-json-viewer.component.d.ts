import { OnChanges } from '@angular/core';
export interface Segment {
    key: string;
    value: any;
    type: undefined | string;
    description: string;
    expanded: boolean;
}
export declare class NgxJsonViewerComponent implements OnChanges {
    json: any;
    expanded: boolean;
    /**
     * @deprecated It will be always true and deleted in version 3.0.0
     */
    cleanOnChange: boolean;
    segments: Segment[];
    ngOnChanges(): void;
    isExpandable(segment: Segment): boolean;
    toggle(segment: Segment): void;
    private parseKeyValue(key, value);
}
