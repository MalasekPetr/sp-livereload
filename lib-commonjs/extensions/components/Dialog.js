"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dialog = void 0;
const HooIconButton_1 = require("./HooIconButton");
const DLG_ATTR_STATE = 'open';
class Dialog extends HTMLDialogElement {
    _header;
    _content;
    _closeButton;
    _firstFocusableElement;
    _lastFocusableElement;
    constructor(title, id) {
        super();
        this.id = id;
        this.classList.add('dlg');
        this.addEventListener('keydown', this.keyboardHandler);
        this._closeButton = new HooIconButton_1.HooIconButton('icon-dismiss-filled', {
            ariaLabel: 'Close Dialog',
        });
        this._closeButton.addEventListener('click', this.changeState);
        this.innerHTML = `<div class='dlg-inner'>
                    <header class='dlg-header'><h2>${title}</h2></header>
                    <div class="dlg-content"></div>
                        </div>`;
        this._content = this.querySelector('.dlg-content');
        this._header = this.querySelector('.dlg-header');
        this._header.append(this._closeButton.Button);
    }
    changeState = (event) => {
        if (this.hasAttribute(DLG_ATTR_STATE)) {
            this.close();
        }
        else {
            this.show();
        }
    };
    keyboardHandler(event) {
        if (event.keyCode === 9) {
            //Rotate Focus
            if (event.shiftKey && document.activeElement === this._firstFocusableElement) {
                event.preventDefault();
                this._lastFocusableElement.focus();
            }
            else if (!event.shiftKey && document.activeElement === this._lastFocusableElement) {
                event.preventDefault();
                this._firstFocusableElement.focus();
            }
        }
    }
    appendContent(content) {
        const childNodes = Array.from(content);
        childNodes.forEach(item => this._content.appendChild(item));
    }
    get content() {
        return this;
    }
}
exports.Dialog = Dialog;
customElements.define('pnp-lrdialog', Dialog, { extends: 'dialog' });
//# sourceMappingURL=Dialog.js.map