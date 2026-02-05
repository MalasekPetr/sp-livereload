export interface ILiveReloaderMessage{
    // Legacy LiveReload format (SPFx < 1.21)
    command: "reload" | "alert" | undefined;
    liveCSS: boolean;
    liveImg: boolean;
    path: string;
    reloadMissingCSS: boolean;
    // Webpack-dev-server format (SPFx 1.21+)
    type?: "hash" | "hot" | "ok" | "invalid" | "still-ok" | "errors" | "warnings";
    data?: string;
}