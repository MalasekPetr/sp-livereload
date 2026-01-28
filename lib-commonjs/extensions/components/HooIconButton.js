"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HooIconButton = void 0;
const IconService_1 = require("../common/IconService");
const domParser = new DOMParser();
class HooIconButton {
    _iconButton;
    constructor(iconName, props, parentElement) {
        const doc = domParser.parseFromString(`
            <button class="hoo-buttonicon">
            </button>
            `, 'text/html');
        this._iconButton = doc.querySelector('.hoo-buttonicon');
        if (props?.ariaLabel) {
            this._iconButton.ariaLabel = props.ariaLabel;
        }
        const currentIcon = IconService_1.Icons.getSVG(iconName);
        if (currentIcon) {
            if (props && props.ariaLabel) {
                this._iconButton.append(currentIcon);
            }
            else {
                this._iconButton.append(currentIcon);
            }
        }
        parentElement?.append(this._iconButton);
    }
    get Button() {
        return this._iconButton;
    }
    addEventListener(type, listener, options) {
        this._iconButton.addEventListener(type, listener, options);
    }
}
exports.HooIconButton = HooIconButton;
//# sourceMappingURL=HooIconButton.js.map