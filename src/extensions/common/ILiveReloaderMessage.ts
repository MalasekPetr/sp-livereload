export interface ILiveReloaderMessage{
    // Legacy LiveReload format (SPFx < 1.21)
    command?: "reload" | "alert";
    liveCSS?: boolean;
    liveImg?: boolean;
    path?: string;
    reloadMissingCSS?: boolean;
    // Webpack-dev-server format (SPFx 1.21+)
    type?: "hash" | "hot" | "ok" | "invalid" | "still-ok" | "errors" | "warnings" | "liveReload" | "reconnect";
    data?: string | number;
}
