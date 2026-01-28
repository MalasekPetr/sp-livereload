/* eslint-disable no-new */
import { IClientSideComponentManifest } from '@microsoft/sp-module-interfaces';
import { ILiveReloaderMessage } from '../common/ILiveReloaderMessage';
import { ILiveReloaderState } from '../common/ILiveReloaderState';
import { lrs } from '../common/LiveReloaderService';
import { LogDebug } from '../common/Logger';
import { AvailabilityState } from './AvailabilityState';
import { Branding } from './BrandingInfo';
import { Credits } from './Credits';
import { HooIconButton } from './HooIconButton';
import { HooToggle } from './HooToggle';
import { QuickActions } from './QuickActions';

export default class LiveReloadBar {

    _LIVE_RELOAD_IDENTIFIER = "PnP-Live-Reload";
    // SPFx 1.21+ uses webpack-dev-server on port 4321
    _LIVE_RELOADER_SOCKET = "wss://localhost:4321/ws";
    // Legacy LiveReload server (SPFx < 1.21) - kept for reference
    _LIVE_RELOADER_SOCKET_LEGACY = "wss://localhost:35729/livereload.js?snipver=1";

    _mainfest!: IClientSideComponentManifest;
    _connection!: WebSocket;
    // Track webpack build hash to detect actual changes
    _currentHash: string | undefined = undefined;
    _isFirstHash = true;

    _parentDom!: HTMLElement;
    _domContainer = new DocumentFragment();
    _stateAvailable!: HTMLOutputElement;
    _stateConnected!: HTMLOutputElement;
    _credits!: Credits;
    _branding!: Branding;
    _actionBar!: HTMLElement;
    _debugConnect!: HooIconButton;
    _debugDisconnect!: HooIconButton;
    _toggle!: HooToggle;
    _placementToggle!: HooToggle;
    _availability!: AvailabilityState;

    changeConnection = (event: Event): void => {
        // Toggle the connected state
        lrs.connected = !lrs.connected;
        // Sync UI with new state
        this.syncUI();
        this.connectLiveReload();
    }

    changePlacement = (event: Event): void => {
        // Toggle between 'top' and 'bottom' placement
        lrs.placement = lrs.placement === 'top' ? 'bottom' : 'top';
        // Note: lrs.placement setter triggers window.location.reload()
    }

    private connectLiveReload() {

        // create a new <script> element
        if (lrs.available) {


            if (!this._connection) {
                this._connection = new WebSocket(this._LIVE_RELOADER_SOCKET);
            }

            try {
                this._connection.addEventListener('open', (event) => {
                    LogDebug('Web Socket Event ::: OPEN', event)
                })
                this._connection.addEventListener('message', (event) => {
                    if (event.data) {
                        const msgCommand = JSON.parse(event.data) as ILiveReloaderMessage;

                        // Legacy LiveReload format (SPFx < 1.21)
                        // Only reload if connected
                        if (lrs.state.connected && msgCommand.command === 'reload') {
                            window.location.reload();
                        }

                        // Webpack-dev-server format (SPFx 1.21+)
                        // Always track hash to know current state
                        if (msgCommand.type === 'hash' && typeof msgCommand.data === 'string') {
                            const newHash = msgCommand.data;
                            LogDebug('Hash message received. Connected state:', lrs.state.connected);

                            if (this._isFirstHash) {
                                // Store initial hash, don't reload
                                this._currentHash = newHash;
                                this._isFirstHash = false;
                                LogDebug('Initial hash stored:', this._currentHash);
                            } else if (this._currentHash !== newHash) {
                                // Hash changed - update stored hash
                                LogDebug('Hash changed from', this._currentHash, 'to', newHash, '| Connected:', lrs.state.connected);
                                this._currentHash = newHash;

                                // Only reload if connected toggle is ON
                                if (lrs.state.connected) {
                                    LogDebug('Reloading page...');
                                    window.location.reload();
                                } else {
                                    LogDebug('Hash changed but not connected - skipping reload');
                                }
                            }
                        }
                        LogDebug('MESSAGE COMMAND ::::', msgCommand);
                    }
                    LogDebug('Web Socket Event ::: Message', event)
                })
            } catch {

                LogDebug('Failed to connect')

            }

        }

    }

    constructor(parentElement: HTMLElement, manifest: IClientSideComponentManifest) {

        this._parentDom = parentElement;
        this._mainfest = manifest;
        this.updateUI(lrs.state);
        this.connectLiveReload();

    }

    logo(): Node {
        const logo = document.createElement('h2');
        logo.textContent = "PnP Live Reloader";
        logo.classList.add('pnp-lr-logo');

        return logo;
    }

    private showBrandingInformation = (event: MouseEvent) =>{

         if(!this._branding.Info.hasAttribute('open')){
            this._branding.Info.show();
         } else {
            this._branding.Info.close();
         }
    }

    updateUI(state: ILiveReloaderState) {

        const section: HTMLElement = document.createElement('section') as HTMLElement;
        Object.assign(section, {
            classList: 'pnp-lr-base'
        })
        this._domContainer.appendChild(section);

        section.append(this.logo());
        const actionBar = new QuickActions(section);

        const brandingInfo = new HooIconButton('icon-paint-bucket-filled', { ariaLabel: 'Show Branding and Design Information' }, actionBar.Container);
        brandingInfo.addEventListener('click', this.showBrandingInformation);

        this._branding = new Branding();
        this._parentDom.prepend(this._branding.Info);

        if (lrs.debugConnected) {
            this._debugConnect = new HooIconButton('icon-plug-connected-filled', { ariaLabel: 'Enter Debug Mode' }, actionBar.Container);
            this._debugConnect.addEventListener('click', evt => {
                lrs.debugConnected = false;
            });
        }
        if (!lrs.debugConnected) {
            this._debugDisconnect = new HooIconButton('icon-plug-disconnected-filled', { ariaLabel: 'Exit Debug Mode' }, actionBar.Container);
            this._debugDisconnect.addEventListener('click', evt => {
                lrs.debugConnected = true;
            });
        }

        section.append(actionBar.Container);

        this._availability = new AvailabilityState(lrs, section);

        this._toggle = new HooToggle({ labelInactive: "Disconnected", labelActive: "Connected" }, section, { tabIndex: -1 });
        this._toggle.addEventListener('click', this.changeConnection);
        this._toggle.enabled = lrs.connected;

        this._placementToggle = new HooToggle({ labelInactive: "Footer", labelActive: "Header" }, section, { tabIndex: -1 });
        this._placementToggle.addEventListener('click', this.changePlacement);
        this._placementToggle.checked = lrs.placement === 'top';
        // Set hover tooltip to show opposite action
        this._placementToggle._inputToggle.title = lrs.placement === 'top' ? 'Toggle to Footer' : 'Toggle to Header';


        const lrActionCredit = document.createElement('div');
        lrActionCredit.classList.add('pnp-lr-actions');
        section.append(lrActionCredit);

        const creditsButton = new HooIconButton('icon-info-filled', { ariaLabel: 'Show / Hide Credits' }, lrActionCredit);

        this._credits = new Credits(this._mainfest);
        this._parentDom.prepend(this._credits.credits);

        creditsButton.addEventListener('click', () => {

            console.debug(this._credits.credits, this._credits.credits.hasAttribute('open'));

            if (this._credits.credits.hasAttribute('open')) {
            
                this._credits.credits.close();
            
            } else {
            
                this._credits.credits.show();
            
            }

        })


        this.syncUI();

        this._parentDom.append(this._domContainer);


    }

    get UI(): HTMLElement {

        if (!this._domContainer) {
            throw Error("LiveReloarderBar cannot be found");
        }

        return this._domContainer.firstChild as HTMLElement;

    }

    syncUI() {
        // Sync UI elements with current state (don't modify state here)
        if (lrs.available !== undefined) {
            this._toggle.enabled = lrs.available;
            this._availability.available = lrs.available;
        }

        // Sync toggle with current connected state
        this._toggle.checked = lrs.connected;
    }

}