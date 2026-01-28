"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lrs = exports.LiveReloaderService = void 0;
const SESSION_STORAGE_KEY = "pnp-live-reloader";
const SESSION_DEBUG_CONNECTED = "spfx-debug";
const PLACEMENT_STORAGE_KEY = "pnp-live-reloader-placement";
// SPFx v1.21+ uses /temp/build/manifests.js
const DEBUG_QUERY_STRING = "?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js";
class LiveReloaderService {
    _available;
    _connected;
    _debugConnected;
    _placement;
    constructor() {
        const storageItem = sessionStorage.getItem(SESSION_STORAGE_KEY);
        const debugMode = sessionStorage.getItem(SESSION_DEBUG_CONNECTED);
        const placementItem = localStorage.getItem(PLACEMENT_STORAGE_KEY);
        if (storageItem === null) {
            console.debug(' No storage entity found ');
        }
        else {
            const sessionSettings = JSON.parse(storageItem);
            sessionSettings.available = false;
            this.state = sessionSettings;
        }
        if (debugMode !== null) {
            this._debugConnected = true;
        }
        else {
            this._debugConnected = false;
        }
        // Initialize placement from localStorage, default to 'bottom'
        if (placementItem === 'top' || placementItem === 'bottom') {
            this._placement = placementItem;
        }
        else {
            this._placement = 'bottom';
        }
    }
    _updateSessionState(state) {
        const sessionState = {
            connected: state.connected
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState));
        this._connected = state.connected;
    }
    get available() {
        if (this._available) {
            return this._available;
        }
        else {
            return false;
        }
    }
    set available(v) {
        this._available = v;
    }
    get connected() {
        if (this._connected) {
            return this._connected;
        }
        else {
            return false;
        }
    }
    set connected(v) {
        const state = this.state;
        state.connected = v;
        this._updateSessionState(state);
        this._connected = v;
    }
    set debugConnected(v) {
        this._debugConnected = v;
        if (!v) {
            const sessionDebugItem = sessionStorage.getItem(SESSION_DEBUG_CONNECTED);
            if (sessionDebugItem) {
                sessionStorage.removeItem(SESSION_DEBUG_CONNECTED);
            }
            const refreshUrl = location.protocol + '//' + location.host + location.pathname;
            window.location.href = refreshUrl;
        }
        else {
            const refreshUrl = location.protocol + '//' + location.host + location.pathname + DEBUG_QUERY_STRING;
            window.location.href = refreshUrl;
        }
    }
    get debugConnected() {
        return this._debugConnected;
    }
    get placement() {
        return this._placement;
    }
    set placement(v) {
        this._placement = v;
        localStorage.setItem(PLACEMENT_STORAGE_KEY, v);
        // Reload the page to apply the new placement
        window.location.reload();
    }
    get state() {
        return {
            available: this.available,
            connected: this.connected,
            debugConnected: this.debugConnected
        };
    }
    set state(state) {
        if (state.available) {
            this._available = state.available;
        }
        if (state.connected) {
            this._connected = state.connected;
        }
        if (state.debugConnected) {
            this._debugConnected = state.debugConnected;
        }
        this._updateSessionState(state);
    }
}
exports.LiveReloaderService = LiveReloaderService;
exports.lrs = new LiveReloaderService();
//# sourceMappingURL=LiveReloaderService.js.map