"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityState = void 0;
class AvailabilityState {
    _state;
    _container;
    _indicator;
    _label;
    constructor(state, parentDom) {
        this._state = state;
        this.createIndicator(parentDom);
    }
    createIndicator(parentDom) {
        const domParser = new DOMParser();
        const doc = domParser.parseFromString(`
            <div class='status'>
                <div class='status-indicator'>
                </div>
                <label class="status-label"></label>
            </div>
            `, "text/html");
        this._container = doc.body.firstChild;
        this._indicator = doc.querySelector('.status-indicator');
        this._label = doc.querySelector('.status-label');
        this._label.textContent = this._state.available ? 'Available' : 'Not Available';
        if (this._state) {
            if (this._state.available) {
                this._indicator.classList.add('ready');
            }
            else {
                this._indicator.classList.remove('ready');
            }
        }
        parentDom.append(this._container);
    }
    get available() {
        return this._state.available;
    }
    set available(v) {
        this._state.available = v;
    }
    setState(state) {
        this._state = state;
    }
}
exports.AvailabilityState = AvailabilityState;
//# sourceMappingURL=AvailabilityState.js.map