import SyncManager from 'sync-manager';

declare global {
  interface Window {
    sync: SyncManager;
  }
}
