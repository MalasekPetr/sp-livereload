export interface ILiveReloaderState {
    available: boolean,
    connected: boolean,
    debugConnected: boolean,
    // v1.3 - HMR Interceptor properties
    paused: boolean,
    pendingCount: number,
    modernMode: boolean
}

export interface ILiveReloaderSession {
    connected: boolean,
    debugConnected: boolean,
    // v1.3 - HMR Interceptor properties
    paused: boolean
}