import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
var NgxJsonViewerComponent = /** @class */ (function () {
    function NgxJsonViewerComponent() {
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
    NgxJsonViewerComponent.prototype.ngOnChanges = function () {
        var _this = this;
        if (this.cleanOnChange) {
            this.segments = [];
        }
        if (typeof this.json === 'object') {
            Object.keys(this.json).forEach(function (key) {
                _this.segments.push(_this.parseKeyValue(key, _this.json[key]));
            });
        }
        else {
            this.segments.push(this.parseKeyValue("(" + typeof this.json + ")", this.json));
        }
    };
    /**
     * @param {?} segment
     * @return {?}
     */
    NgxJsonViewerComponent.prototype.isExpandable = function (segment) {
        return segment.type === 'object' || segment.type === 'array';
    };
    /**
     * @param {?} segment
     * @return {?}
     */
    NgxJsonViewerComponent.prototype.toggle = function (segment) {
        if (this.isExpandable(segment)) {
            segment.expanded = !segment.expanded;
        }
    };
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    NgxJsonViewerComponent.prototype.parseKeyValue = function (key, value) {
        var /** @type {?} */ segment = {
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
    };
    return NgxJsonViewerComponent;
}());
NgxJsonViewerComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-json-viewer',
                template: "\n    <section class=\"ngx-json-viewer\">\n      <section\n        *ngFor=\"let segment of segments\"\n        [ngClass]=\"['segment', 'segment-type-' + segment.type]\">\n        <section\n          (click)=\"toggle(segment)\"\n          [ngClass]=\"{\n            'segment-main': true,\n            'expandable': isExpandable(segment),\n            'expanded': segment.expanded\n          }\">\n          <div *ngIf=\"isExpandable(segment)\" class=\"toggler\"></div>\n          <span class=\"segment-key\">{{ segment.key }}</span>\n          <span class=\"segment-separator\">: </span>\n          <span *ngIf=\"!segment.expanded || !isExpandable(segment)\" class=\"segment-value\">{{ segment.description }}</span>\n        </section>\n        <section *ngIf=\"segment.expanded && isExpandable(segment)\" class=\"children\">\n          <ngx-json-viewer [json]=\"segment.value\" [expanded]=\"expanded\"></ngx-json-viewer>\n        </section>\n      </section>\n    </section>\n  ",
                styles: ["\n    @charset \"UTF-8\";\n    .ngx-json-viewer {\n      font-family: monospace;\n      font-size: 1em;\n      width: 100%;\n      height: 100%;\n      overflow: hidden;\n      position: relative; }\n      .ngx-json-viewer .segment {\n        padding: 2px;\n        margin: 1px 1px 1px 12px; }\n        .ngx-json-viewer .segment .segment-main {\n          word-wrap: break-word; }\n          .ngx-json-viewer .segment .segment-main .toggler {\n            position: absolute;\n            margin-left: -14px;\n            margin-top: 3px;\n            font-size: .8em;\n            line-height: 1.2em;\n            vertical-align: middle;\n            color: #787878; }\n            .ngx-json-viewer .segment .segment-main .toggler::after {\n              display: inline-block;\n              content: \"\u25BA\";\n              -webkit-transition: -webkit-transform 0.1s ease-in;\n              transition: -webkit-transform 0.1s ease-in;\n              transition: transform 0.1s ease-in;\n              transition: transform 0.1s ease-in, -webkit-transform 0.1s ease-in; }\n          .ngx-json-viewer .segment .segment-main .segment-key {\n            color: #4E187C; }\n          .ngx-json-viewer .segment .segment-main .segment-separator {\n            color: #999; }\n          .ngx-json-viewer .segment .segment-main .segment-value {\n            color: #000; }\n        .ngx-json-viewer .segment .children {\n          margin-left: 12px; }\n      .ngx-json-viewer .segment-type-string > .segment-main > .segment-value {\n        color: #FF6B6B; }\n      .ngx-json-viewer .segment-type-number > .segment-main > .segment-value {\n        color: #009688; }\n      .ngx-json-viewer .segment-type-boolean > .segment-main > .segment-value {\n        color: #b938a4; }\n      .ngx-json-viewer .segment-type-date > .segment-main > .segment-value {\n        color: #05668D; }\n      .ngx-json-viewer .segment-type-array > .segment-main > .segment-value {\n        color: #999; }\n      .ngx-json-viewer .segment-type-object > .segment-main > .segment-value {\n        color: #999; }\n      .ngx-json-viewer .segment-type-function > .segment-main > .segment-value {\n        color: #999; }\n      .ngx-json-viewer .segment-type-null > .segment-main > .segment-value {\n        color: #fff; }\n      .ngx-json-viewer .segment-type-undefined > .segment-main > .segment-value {\n        color: #fff; }\n      .ngx-json-viewer .segment-type-null > .segment-main > .segment-value {\n        background-color: red; }\n      .ngx-json-viewer .segment-type-undefined > .segment-main > .segment-key {\n        color: #999; }\n      .ngx-json-viewer .segment-type-undefined > .segment-main > .segment-value {\n        background-color: #999; }\n      .ngx-json-viewer .segment-type-object > .segment-main,\n      .ngx-json-viewer .segment-type-array > .segment-main {\n        white-space: nowrap; }\n      .ngx-json-viewer .expanded > .toggler::after {\n        -webkit-transform: rotate(90deg);\n                transform: rotate(90deg); }\n      .ngx-json-viewer .expandable,\n      .ngx-json-viewer .expandable > .toggler {\n        cursor: pointer; }\n  "]
            },] },
];
/**
 * @nocollapse
 */
NgxJsonViewerComponent.ctorParameters = function () { return []; };
NgxJsonViewerComponent.propDecorators = {
    'json': [{ type: Input },],
    'expanded': [{ type: Input },],
    'cleanOnChange': [{ type: Input },],
};
var NgxJsonViewerModule = /** @class */ (function () {
    function NgxJsonViewerModule() {
    }
    return NgxJsonViewerModule;
}());
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
NgxJsonViewerModule.ctorParameters = function () { return []; };
/**
 * Generated bundle index. Do not edit.
 */
export { NgxJsonViewerModule, NgxJsonViewerComponent };
//# sourceMappingURL=ngx-json-viewer.es5.js.map
