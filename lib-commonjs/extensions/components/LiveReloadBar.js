"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LiveReloaderService_1 = require("../common/LiveReloaderService");
const Logger_1 = require("../common/Logger");
const AvailabilityState_1 = require("./AvailabilityState");
const BrandingInfo_1 = require("./BrandingInfo");
const Credits_1 = require("./Credits");
const HooIconButton_1 = require("./HooIconButton");
const HooToggle_1 = require("./HooToggle");
const QuickActions_1 = require("./QuickActions");
class LiveReloadBar {
    _LIVE_RELOAD_IDENTIFIER = "PnP-Live-Reload";
    _LIVE_RELOADER_SOCKET = "https://localhost:35729/livereload.js?snipver=1";
    _LIVE_RELOADER_SOCKET_ALERT = "https://localhost:35729/changed";
    _mainfest;
    _connection;
    _parentDom;
    _domContainer = new DocumentFragment();
    _stateAvailable;
    _stateConnected;
    _credits;
    _branding;
    _actionBar;
    _debugConnect;
    _debugDisconnect;
    _toggle;
    _placementToggle;
    _availability;
    changeConnection = (event) => {
        // lrs.connected = !lrs.connected
        this.setState();
        this.connectLiveReload();
    };
    changePlacement = (event) => {
        // Toggle between 'top' and 'bottom' placement
        LiveReloaderService_1.lrs.placement = LiveReloaderService_1.lrs.placement === 'top' ? 'bottom' : 'top';
        // Note: lrs.placement setter triggers window.location.reload()
    };
    connectLiveReload() {
        // create a new <script> element
        if (LiveReloaderService_1.lrs.available) {
            if (!this._connection) {
                this._connection = new WebSocket(this._LIVE_RELOADER_SOCKET);
            }
            try {
                this._connection.addEventListener('open', (event) => {
                    (0, Logger_1.LogDebug)('Web Socket Event ::: OPEN', event);
                });
                this._connection.addEventListener('message', (event) => {
                    if (event.data) {
                        const msgCommand = JSON.parse(event.data);
                        if (LiveReloaderService_1.lrs.state.connected && msgCommand.command && msgCommand.command === 'reload') {
                            window.location.reload();
                        }
                        (0, Logger_1.LogDebug)('MESSAGE COMMAND ::::', msgCommand);
                    }
                    (0, Logger_1.LogDebug)('Web Socket Event ::: Message', event);
                });
            }
            catch (error) {
                (0, Logger_1.LogDebug)('Failed to connect');
            }
        }
    }
    constructor(parentElement, manifest) {
        this._parentDom = parentElement;
        this._mainfest = manifest;
        this.updateUI(LiveReloaderService_1.lrs.state);
        this.connectLiveReload();
    }
    logo() {
        const logo = document.createElement('h2');
        logo.textContent = "PnP Live Reloader";
        logo.classList.add('pnp-lr-logo');
        return logo;
    }
    showBrandingInformation = (event) => {
        if (!this._branding.Info.hasAttribute('open')) {
            this._branding.Info.show();
        }
        else {
            this._branding.Info.close();
        }
    };
    updateUI(state) {
        const section = document.createElement('section');
        Object.assign(section, {
            classList: 'pnp-lr-base'
        });
        this._domContainer.appendChild(section);
        section.append(this.logo());
        const actionBar = new QuickActions_1.QuickActions(section);
        const brandingInfo = new HooIconButton_1.HooIconButton('icon-paint-bucket-filled', { ariaLabel: 'Show Branding and Design Information' }, actionBar.Container);
        brandingInfo.addEventListener('click', this.showBrandingInformation);
        this._branding = new BrandingInfo_1.Branding();
        this._parentDom.prepend(this._branding.Info);
        if (LiveReloaderService_1.lrs.debugConnected) {
            this._debugConnect = new HooIconButton_1.HooIconButton('icon-plug-connected-filled', { ariaLabel: 'Enter Debug Mode' }, actionBar.Container);
            this._debugConnect.addEventListener('click', evt => {
                LiveReloaderService_1.lrs.debugConnected = false;
            });
        }
        if (!LiveReloaderService_1.lrs.debugConnected) {
            this._debugDisconnect = new HooIconButton_1.HooIconButton('icon-plug-disconnected-filled', { ariaLabel: 'Exit Debug Mode' }, actionBar.Container);
            this._debugDisconnect.addEventListener('click', evt => {
                LiveReloaderService_1.lrs.debugConnected = true;
            });
        }
        section.append(actionBar.Container);
        this._availability = new AvailabilityState_1.AvailabilityState(LiveReloaderService_1.lrs, section);
        this._toggle = new HooToggle_1.HooToggle({ labelInactive: "Disconnected", labelActive: "Connected" }, section, { tabIndex: -1 });
        this._toggle.addEventListener('click', this.changeConnection);
        this._toggle.enabled = LiveReloaderService_1.lrs.connected;
        this._placementToggle = new HooToggle_1.HooToggle({ labelInactive: "Footer", labelActive: "Header" }, section, { tabIndex: -1 });
        this._placementToggle.addEventListener('click', this.changePlacement);
        this._placementToggle.checked = LiveReloaderService_1.lrs.placement === 'top';
        // Set hover tooltip to show opposite action
        this._placementToggle._inputToggle.title = LiveReloaderService_1.lrs.placement === 'top' ? 'Toggle to Footer' : 'Toggle to Header';
        const lrActionCredit = document.createElement('div');
        lrActionCredit.classList.add('pnp-lr-actions');
        section.append(lrActionCredit);
        const creditsButton = new HooIconButton_1.HooIconButton('icon-info-filled', { ariaLabel: 'Show / Hide Credits' }, lrActionCredit);
        this._credits = new Credits_1.Credits(this._mainfest);
        this._parentDom.prepend(this._credits.credits);
        creditsButton.addEventListener('click', () => {
            console.debug(this._credits.credits, this._credits.credits.hasAttribute('open'));
            if (this._credits.credits.hasAttribute('open')) {
                this._credits.credits.close();
            }
            else {
                this._credits.credits.show();
            }
        });
        this.setState();
        this._parentDom.append(this._domContainer);
    }
    get UI() {
        if (!this._domContainer) {
            throw Error("LiveReloarderBar cannot be found");
        }
        return this._domContainer.firstChild;
    }
    setState() {
        if (LiveReloaderService_1.lrs.available !== undefined) {
            this._toggle.enabled = LiveReloaderService_1.lrs.available;
            this._availability.available = LiveReloaderService_1.lrs.available;
        }
        if (LiveReloaderService_1.lrs.connected !== undefined) {
            LiveReloaderService_1.lrs.connected = !LiveReloaderService_1.lrs.connected;
            this._toggle.checked = LiveReloaderService_1.lrs.connected;
        }
    }
}
exports.default = LiveReloadBar;
//# sourceMappingURL=LiveReloadBar.js.map