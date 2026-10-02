const { contextBridge, ipcRenderer } = require('electron');
// 'desktop' le avisa a Andify que corre como programa instalado:
// ahi recuerda la carpeta de musica local entre una sesion y otra
contextBridge.exposeInMainWorld('andify', {
  desktop: true,
  saveUrl: url => ipcRenderer.send('andify-url', url)
});
