const { contextBridge, ipcRenderer } = require('electron');
// 'desktop' le avisa a Andify que corre como programa instalado; con 'titlebar' la pagina dibuja
// la barra de la ventana (Windows y Mac) y con 'toggleFullscreen' maneja la pantalla completa.
contextBridge.exposeInMainWorld('andify', {
  desktop: true,
  platform: process.platform,
  titlebar: process.platform === 'win32' || process.platform === 'darwin',
  saveUrl: url => ipcRenderer.send('andify-url', url),
  toggleFullscreen: () => ipcRenderer.send('andify-fs-toggle'),
  isFullscreen: () => ipcRenderer.invoke('andify-fs-get'),
  onFullscreen: cb => ipcRenderer.on('andify-fs', (_e, v) => cb(!!v)),
  setTitleColor: (color, light) => ipcRenderer.send('andify-title-color', color, !!light)
});
