"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sp_application_base_1 = require("@microsoft/sp-application-base");
const LiveReloaderService_1 = require("../common/LiveReloaderService");
const LiveReloadBar_1 = tslib_1.__importDefault(require("../components/LiveReloadBar"));
const Logger_1 = require("../common/Logger");
const PnPSpFxLiveReloaderApplicationCustomizer_module_scss_1 = tslib_1.__importDefault(require("./PnPSpFxLiveReloaderApplicationCustomizer.module.scss"));
const sp_component_base_1 = require("@microsoft/sp-component-base");
// SPFx v1.21+ uses /temp/build/manifests.js, earlier versions use /temp/manifests.js
const LIVE_RELOAD_CONNECTION_V121 = "//localhost:4321/temp/build/manifests.js";
const LIVE_RELOAD_CONNECTION_LEGACY = "//localhost:4321/temp/manifests.js";
/** A Custom Action which can be run during execution of a Client Side Application */
class PnPSPFxLiveReloaderApplicationCustomizer extends sp_application_base_1.BaseApplicationCustomizer {
    _themeProvider;
    _themeVariant;
    _styles;
    _placeholder;
    _liveReloaderBar;
    async checkLiveReloadStatus() {
        const connectionResponse = await this._checkConnection();
        // LogDebug('INIT LIVE RELOADER STATE\n\t', lrs, connectionResponse);
        if (connectionResponse && connectionResponse.status === 200) {
            LiveReloaderService_1.lrs.state = { available: true, connected: LiveReloaderService_1.lrs.connected, debugConnected: false };
        }
        else {
            LiveReloaderService_1.lrs.state = { available: false, connected: false, debugConnected: false };
        }
        return Promise.resolve();
    }
    setCSSVariables(theming) {
        // request all key defined in theming
        const themingKeys = Object.keys(theming);
        if (!this._styles) {
            const styleElement = document.createElement('div');
            this._styles = styleElement.style;
        }
        // if we have the key
        if (themingKeys !== null) {
            // loop over it
            themingKeys.forEach(key => {
                // add CSS variable to style property of the web part
                this._styles.setProperty(`--${key}`, theming[key]);
            });
            if (this._styles) {
                Object.assign(this._styles);
            }
        }
    }
    async _checkConnection() {
        // LogDebug('Try to fetch live reload connection');
        // Try SPFx v1.21+ URL first, then fall back to legacy URL for older versions
        try {
            const liveReloadConnection = await fetch(LIVE_RELOAD_CONNECTION_V121);
            if (liveReloadConnection.ok) {
                return liveReloadConnection;
            }
        }
        catch {
            (0, Logger_1.LogDebug)('SPFx v1.21+ connection not available, trying legacy URL...');
        }
        // Fall back to legacy URL (SPFx < v1.21)
        try {
            const liveReloadConnection = await fetch(LIVE_RELOAD_CONNECTION_LEGACY);
            return liveReloadConnection;
        }
        catch {
            (0, Logger_1.LogDebug)('Connection not available');
            return null;
        }
    }
    _renderStatusBar() {
        if (!this._placeholder) {
            // Use placement from localStorage (via lrs.placement), default is 'bottom'
            const placeholderName = LiveReloaderService_1.lrs.placement === 'top' ? sp_application_base_1.PlaceholderName.Top : sp_application_base_1.PlaceholderName.Bottom;
            this._placeholder = this.context.placeholderProvider.tryCreateContent(placeholderName, { onDispose: this._onDispose });
            // The extension should not assume that the expected placeholder is available.
            if (!this._placeholder) {
                (0, Logger_1.LogDebug)(`The expected placeholder (${LiveReloaderService_1.lrs.placement}) was not found.`);
                return;
            }
            if (this._placeholder.domElement) {
                this._placeholder.domElement.setAttribute('style', this._styles.cssText);
                this._placeholder.domElement.classList.add(PnPSpFxLiveReloaderApplicationCustomizer_module_scss_1.default.pnpLiveReloader);
                this._liveReloaderBar = new LiveReloadBar_1.default(this._placeholder.domElement, this.context.manifest);
                this._liveReloaderBar.setState();
                this._placeholder.domElement.classList.add(PnPSpFxLiveReloaderApplicationCustomizer_module_scss_1.default.pnpLiveReloader);
            }
        }
    }
    initThemes() {
        // Consume the new ThemeProvider service
        this._themeProvider = this.context.serviceScope.consume(sp_component_base_1.ThemeProvider.serviceKey);
        // If it exists, get the theme variant
        this._themeVariant = this._themeProvider.tryGetTheme();
        // If there is a theme variant
        if (this._themeVariant) {
            // we set transfer semanticColors into CSS variables
            this.setCSSVariables(this._themeVariant.semanticColors);
            this.setCSSVariables(this._themeVariant.palette);
        }
    }
    async onInit() {
        // Init Themes
        this.initThemes();
        // Init Live Reloader State
        (0, Logger_1.LogDebug)("Current State :::", LiveReloaderService_1.lrs.state);
        try {
            await this.checkLiveReloadStatus();
            this.context.placeholderProvider.changedEvent.add(this, this._renderStatusBar);
        }
        catch (e) {
            (0, Logger_1.LogError)('Debug Log', e);
            throw new Error(e instanceof Error ? e.message : String(e));
        }
        this._themeProvider.themeChangedEvent.add(this, this.onThemeChanged);
        return Promise.resolve();
    }
    onThemeChanged(args) {
        if (!args) {
            return;
        }
        if (args.theme) {
            this.setCSSVariables(args.theme.semanticColors);
            this.setCSSVariables(args.theme.palette);
            if (this._placeholder) {
                this._placeholder.domElement.setAttribute('style', this._styles.cssText);
            }
        }
    }
    _onDispose() {
        console.log('[HelloWorldApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');
    }
}
exports.default = PnPSPFxLiveReloaderApplicationCustomizer;
//# sourceMappingURL=PnPSpFxLiveReloaderApplicationCustomizer.js.map