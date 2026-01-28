"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HooToggle = void 0;
const Logger_1 = require("../common/Logger");
class HooToggle {
    _ID;
    _component;
    _inputToggle;
    _inputLabel;
    _inputStateActive;
    _inputStateInactive;
    constructor(labels, appendTo, props) {
        if (!appendTo) {
            throw new Error("I don't know where to append it to the DOM");
        }
        const domParser = new DOMParser();
        this._generateID();
        const domControls = domParser.parseFromString(`<div class="hoo-toggle">
            <input type="checkbox" class="hoo-toggle-cb" name="toggleName" id="toggle-44">
            <label for= "toggle-44" class="hoo-toggle-label"> 
                <output class= "hoo-toggle-slider"></output>
                <output class="hoo-toggle-checked">On</output><output class= "hoo-toggle-unchecked">Off</output>
            </label>
        </div>`, "text/html");
        const input = domControls.querySelector('.hoo-toggle-cb');
        if (input && props?.tabIndex) {
            input.tabIndex = props.tabIndex;
        }
        if (input) {
            this._inputToggle = input;
            this._inputToggle.id = this._ID;
        }
        (0, Logger_1.LogDebug)(input);
        const toggleLabel = domControls.querySelector('.hoo-toggle-label');
        if (toggleLabel) {
            this._inputLabel = toggleLabel;
            this._inputLabel.setAttribute('for', this._ID);
        }
        (0, Logger_1.LogDebug)(toggleLabel);
        const lblInactive = domControls.querySelector('.hoo-toggle-unchecked');
        if (lblInactive) {
            this._inputStateInactive = lblInactive;
            this._inputStateInactive.textContent = labels.labelInactive;
        }
        (0, Logger_1.LogDebug)(lblInactive);
        const lblActive = domControls.querySelector('.hoo-toggle-checked');
        if (lblInactive) {
            this._inputStateActive = lblActive;
            this._inputStateActive.textContent = labels.labelActive;
        }
        (0, Logger_1.LogDebug)(lblActive);
        (0, Logger_1.LogDebug)(domControls);
        appendTo.append(domControls.body.firstChild);
    }
    _generateID() {
        this._ID = 'hoo-toggle-' + Math.floor(Math.random() * 10000);
    }
    get enabled() {
        return !this._inputToggle.disabled;
    }
    set enabled(value) {
        this._inputToggle.disabled = !value;
    }
    get checked() {
        return this._inputToggle.checked;
    }
    set checked(value) {
        this._inputToggle.checked = value;
    }
    addEventListener(type, listener, options) {
        this._inputToggle.addEventListener(type, listener, options);
    }
}
exports.HooToggle = HooToggle;
//# sourceMappingURL=HooToggle.js.map