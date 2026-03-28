import { ipcRenderer } from 'electron';
import { IPCChannel } from 'csdm/common/ipc-channel';

window.addEventListener('beforeunload', async () => {
  await ipcRenderer.invoke(IPCChannel.ReloadWindow);
});
