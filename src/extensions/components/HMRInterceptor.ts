import { LogDebug } from '../common/Logger';

/**
 * Stores the last known HMR state for a specific webpackHotUpdate function
 * When disconnected, we replay this old state to get "Nothing changed" from HMR
 */
interface HMRState {
    chunkId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    moreModules: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    runtime: any;
}

/**
 * HMRInterceptor provides control over webpack Hot Module Replacement updates.
 *
 * It intercepts `webpackHotUpdate*` global functions to enable:
 * - Pausing/resuming HMR updates
 * - When paused: replays old state so HMR says "Nothing changed"
 * - When resumed: lets new updates flow through normally
 *
 * This allows developers to pause live reloading while debugging,
 * then reconnect to receive all accumulated changes in the next update.
 */
export class HMRInterceptor {
    private _enabled = true;
    private _interceptedFunctions: Map<string, Function> = new Map();
    // Store the last known state per function - replay this when disconnected
    private _lastKnownState: Map<string, HMRState> = new Map();
    // Count how many updates were blocked while disconnected
    private _blockedCount = 0;
    private _onPendingChange?: (count: number) => void;
    // Re-entrancy guard to prevent infinite loops when replaying state
    private _isReplaying = false;

    /**
     * Clone the moreModules object to avoid reference issues
     * moreModules is typically an object with module IDs as keys and factory functions as values
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _cloneModules(moreModules: any): any {
        if (!moreModules || typeof moreModules !== 'object') {
            return moreModules;
        }
        // Create a shallow copy - the factory functions themselves don't need deep cloning
        // We just need to prevent the same object reference from being reused
        return { ...moreModules };
    }

    /**
     * Install the HMR interceptor by wrapping all webpackHotUpdate* functions
     * Uses Object.defineProperty to prevent webpack from replacing our wrapper
     * @param onPendingChange Callback when pending update count changes
     */
    install(onPendingChange?: (count: number) => void): void {
        this._onPendingChange = onPendingChange;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;

        const hotUpdateKeys = Object.keys(win).filter(k => k.startsWith('webpackHotUpdate'));

        hotUpdateKeys.forEach(key => {
            if (typeof win[key] === 'function' && !this._interceptedFunctions.has(key)) {
                const original = win[key];
                this._interceptedFunctions.set(key, original);

                // Create wrapper that intercepts calls
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const wrapper = (chunkId: string, moreModules: any, runtime: any) => {
                    // Re-entrancy guard - if we're already replaying, just pass through
                    if (this._isReplaying) {
                        const currentOriginal = this._interceptedFunctions.get(key) || original;
                        return currentOriginal(chunkId, moreModules, runtime);
                    }

                    // Get latest original in case webpack updated it
                    const currentOriginal = this._interceptedFunctions.get(key) || original;

                    if (this._enabled) {
                        // Connected mode: let HMR work normally
                        // Store a deep copy of the state to avoid reference issues
                        this._lastKnownState.set(key, {
                            chunkId: String(chunkId),
                            moreModules: this._cloneModules(moreModules),
                            runtime: runtime // runtime is typically a simple value or undefined
                        });
                        return currentOriginal(chunkId, moreModules, runtime);
                    } else {
                        // Disconnected mode: pass empty moreModules so HMR says "Nothing changed"
                        this._blockedCount++;
                        this._onPendingChange?.(this._blockedCount);
                        LogDebug('HMR Interceptor: Blocked update #' + this._blockedCount);
                        return currentOriginal(chunkId, {}, runtime);
                    }
                };

                // Use defineProperty to make it harder to replace
                try {
                    Object.defineProperty(win, key, {
                        get: () => wrapper,
                        set: (newFn) => {
                            // If webpack tries to replace, update our original reference
                            if (typeof newFn === 'function' && newFn !== wrapper) {
                                LogDebug('HMR Interceptor: Detected replacement attempt for', key);
                                this._interceptedFunctions.set(key, newFn);
                            }
                        },
                        configurable: true
                    });
                } catch {
                    // Fallback to simple assignment if defineProperty fails
                    win[key] = wrapper;
                }
            }
        });

        if (this._interceptedFunctions.size > 0) {
            LogDebug('HMR Interceptor: Installed, intercepted', this._interceptedFunctions.size, 'function(s)');
        }
    }

    /**
     * Re-scan for new webpackHotUpdate* functions that may have been added
     * after initial install (e.g., when new chunks are loaded)
     */
    rescan(): void {
        this.install(this._onPendingChange);
    }

    /**
     * Enable HMR updates - let HMR work normally
     * Resets blocked count since next update will include all changes
     */
    enable(): void {
        this._enabled = true;
        this._blockedCount = 0;
        this._onPendingChange?.(0);
        LogDebug('HMR Interceptor: Connected - HMR enabled');
    }

    /**
     * Disable HMR - updates will be blocked (old state replayed)
     */
    pause(): void {
        this._enabled = false;
        LogDebug('HMR Interceptor: Disconnected - updates will be blocked');
    }

    /**
     * Reset blocked count (e.g., when user acknowledges pending updates)
     */
    clearPending(): void {
        const count = this._blockedCount;
        this._blockedCount = 0;
        this._onPendingChange?.(0);
        LogDebug('HMR Interceptor: Cleared', count, 'pending update(s)');
    }

    /**
     * Get the number of blocked updates while disconnected
     */
    get pendingCount(): number {
        return this._blockedCount;
    }

    /**
     * Check if HMR is currently paused
     */
    get isPaused(): boolean {
        return !this._enabled;
    }

    /**
     * Check if interceptor is active (has intercepted functions)
     */
    get isActive(): boolean {
        return this._interceptedFunctions.size > 0;
    }

    /**
     * Get list of intercepted function names
     */
    get interceptedFunctions(): string[] {
        return Array.from(this._interceptedFunctions.keys());
    }

    /**
     * Restore original functions and cleanup
     */
    uninstall(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;

        this._interceptedFunctions.forEach((original, key) => {
            // Delete the property first to remove our getter/setter
            try {
                delete win[key];
            } catch {
                // Ignore if delete fails
            }
            // Restore the original function
            win[key] = original;
            LogDebug('HMR Interceptor: Restored', key);
        });

        this._interceptedFunctions.clear();
        this._lastKnownState.clear();
        this._blockedCount = 0;
        this._onPendingChange?.(0);
        LogDebug('HMR Interceptor: Uninstalled');
    }
}
