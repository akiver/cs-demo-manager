import { ipcRenderer } from 'electron';
import { IPCChannel } from 'csdm/common/ipc-channel';

window.addEventListener('beforeunload', () => {
  ipcRenderer.invoke(IPCChannel.ReloadWindow);
});
