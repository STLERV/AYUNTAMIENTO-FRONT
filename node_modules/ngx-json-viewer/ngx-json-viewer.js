import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

class NgxJsonViewerComponent {
    constructor() {
        this.expanded = true;
        /**
         * @deprecated It will be always true and deleted in version 3.0.0
         */
        this.cleanOnChange = true;
        this.segments = [];
    }
    /**
     * @return {?}
     */
    ngOnChanges() {
        if (this.cleanOnChange) {
            this.segments = [];
        }
        if (typeof this.json === 'object') {
            Object.keys(this.json).forEach(key => {
                this.segments.push(this.parseKeyValue(key, this.json[key]));
            });
        }
        else {
            this.segments.push(this.parseKeyValue(`(${typeof this.json})`, this.json));
        }
    }
    /**
     * @param {?} segment
     * @return {?}
     */
    isExpandable(segment) {
        return segment.type === 'object' || segment.type === 'array';
    }
    /**
     * @param {?} segment
     * @return {?}
     */
    toggle(segment) {
        if (this.isExpandable(segment)) {
            segment.expanded = !segment.expanded;
        }
    }
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    parseKeyValue(key, value) {
        const /** @type {?} */ segment = {
            key: key,
            value: value,
            type: undefined,
            description: '' + value,
            expanded: this.expanded
        };
        switch (typeof segment.value) {
            case 'number': {
                segment.type = 'number';
                break;
            }
            case 'boolean': {
                segment.type = 'boolean';
                break;
            }
            case 'function': {
                segment.type = 'function';
                break;
            }
            case 'string': {
                segment.type = 'string';
                segment.description = '"' + segment.value + '"';
                break;
            }
            case 'undefined': {
                segment.type = 'undefined';
                segment.description = 'undefined';
                break;
            }
            case 'object': {
                // yea, null is object
                if (segment.value === null) {
                    segment.type = 'null';
                    segment.description = 'null';
                }
                else if (Array.isArray(segment.value)) {
                    segment.type = 'array';
                    segment.description = 'Array[' + segment.value.length + '] ' + JSON.stringify(segment.value);
                }
                else if (segment.value instanceof Date) {
                    segment.type = 'date';
                }
                else {
                    segment.type = 'object';
                    segment.description = 'Object ' + JSON.stringify(segment.value);
                }
                break;
            }
        }
        return segment;
    }
}
NgxJsonViewerComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-json-viewer',
                template: `
    <section class="ngx-json-viewer">
      <section
        *ngFor="let segment of segments"
        [ngClass]="['segment', 'segment-type-' + segment.type]">
        <section
          (click)="toggle(segment)"
          [ngClass]="{
            'segment-main': true,
            'expandable': isExpandable(segment),
            'expanded': segment.expanded
          }">
          <div *ngIf="isExpandable(segment)" class="toggler"></div>
          <span class="segment-key">{{ segment.key }}</span>
          <span class="segment-separator">: </span>
          <span *ngIf="!segment.expanded || !isExpandable(segment)" class="segment-value">{{ segment.description }}</span>
        </section>
        <section *ngIf="segment.expanded && isExpandable(segment)" class="children">
          <ngx-json-viewer [json]="segment.value" [expanded]="expanded"></ngx-json-viewer>
        </section>
      </section>
    </section>
  `,
                styles: [`
    @charset "UTF-8";
    .ngx-json-viewer {
      font-family: monospace;
      font-size: 1em;
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative; }
      .ngx-json-viewer .segment {
        padding: 2px;
        margin: 1px 1px 1px 12px; }
        .ngx-json-viewer .segment .segment-main {
          word-wrap: break-word; }
          .ngx-json-viewer .segment .segment-main .toggler {
            position: absolute;
            margin-left: -14px;
            margin-top: 3px;
            font-size: .8em;
            line-height: 1.2em;
            vertical-align: middle;
            color: #787878; }
            .ngx-json-viewer .segment .segment-main .toggler::after {
              display: inline-block;
              content: "►";
              -webkit-transition: -webkit-transform 0.1s ease-in;
              transition: -webkit-transform 0.1s ease-in;
              transition: transform 0.1s ease-in;
              transition: transform 0.1s ease-in, -webkit-transform 0.1s ease-in; }
          .ngx-json-viewer .segment .segment-main .segment-key {
            color: #4E187C; }
          .ngx-json-viewer .segment .segment-main .segment-separator {
            color: #999; }
          .ngx-json-viewer .segment .segment-main .segment-value {
            color: #000; }
        .ngx-json-viewer .segment .children {
          margin-left: 12px; }
      .ngx-json-viewer .segment-type-string > .segment-main > .segment-value {
        color: #FF6B6B; }
      .ngx-json-viewer .segment-type-number > .segment-main > .segment-value {
        color: #009688; }
      .ngx-json-viewer .segment-type-boolean > .segment-main > .segment-value {
        color: #b938a4; }
      .ngx-json-viewer .segment-type-date > .segment-main > .segment-value {
        color: #05668D; }
      .ngx-json-viewer .segment-type-array > .segment-main > .segment-value {
        color: #999; }
      .ngx-json-viewer .segment-type-object > .segment-main > .segment-value {
        color: #999; }
      .ngx-json-viewer .segment-type-function > .segment-main > .segment-value {
        color: #999; }
      .ngx-json-viewer .segment-type-null > .segment-main > .segment-value {
        color: #fff; }
      .ngx-json-viewer .segment-type-undefined > .segment-main > .segment-value {
        color: #fff; }
      .ngx-json-viewer .segment-type-null > .segment-main > .segment-value {
        background-color: red; }
      .ngx-json-viewer .segment-type-undefined > .segment-main > .segment-key {
        color: #999; }
      .ngx-json-viewer .segment-type-undefined > .segment-main > .segment-value {
        background-color: #999; }
      .ngx-json-viewer .segment-type-object > .segment-main,
      .ngx-json-viewer .segment-type-array > .segment-main {
        white-space: nowrap; }
      .ngx-json-viewer .expanded > .toggler::after {
        -webkit-transform: rotate(90deg);
                transform: rotate(90deg); }
      .ngx-json-viewer .expandable,
      .ngx-json-viewer .expandable > .toggler {
        cursor: pointer; }
  `]
            },] },
];
/**
 * @nocollapse
 */
NgxJsonViewerComponent.ctorParameters = () => [];
NgxJsonViewerComponent.propDecorators = {
    'json': [{ type: Input },],
    'expanded': [{ type: Input },],
    'cleanOnChange': [{ type: Input },],
};

class NgxJsonViewerModule {
}
NgxJsonViewerModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule
                ],
                declarations: [
                    NgxJsonViewerComponent
                ],
                exports: [
                    NgxJsonViewerComponent
                ]
            },] },
];
/**
 * @nocollapse
 */
NgxJsonViewerModule.ctorParameters = () => [];

/**
 * Generated bundle index. Do not edit.
 */

export { NgxJsonViewerModule, NgxJsonViewerComponent };
//# sourceMappingURL=ngx-json-viewer.js.map
