"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickActions = void 0;
const domParser = new DOMParser();
class QuickActions {
    _container;
    constructor(parentElement) {
        const partialDoc = domParser.parseFromString(`
            <div class="pnp-lr-actions">
            
            </div>`, 'text/html');
        this._container = partialDoc.body.firstChild;
        parentElement.append(this._container);
    }
    get Container() {
        return this._container;
    }
    append(parentElement) {
        parentElement.append(this._container);
    }
}
exports.QuickActions = QuickActions;
//# sourceMappingURL=QuickActions.js.map