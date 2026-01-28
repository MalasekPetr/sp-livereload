export interface ILiveReloaderMessage{
    // Legacy LiveReload format (SPFx < 1.21)
    command?: "reload" | "alert";
    liveCSS?: boolean;
    liveImg?: boolean;
    path?: string;
    reloadMissingCSS?: boolean;
    // Webpack-dev-server format (SPFx 1.21+)
    type?: "hot" | "liveReload" | "hash" | "ok" | "still-ok" | "reconnect";
    data?: string | number;
}