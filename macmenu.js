/*
 * El menu de la barra superior de Mac. Reemplaza al menu generico (Servicios, etc.) por uno
 * con las cosas de Andify: escanear la biblioteca, ir a cada seccion, controlar la reproduccion.
 * Solo se usa en Mac: en Windows no hay menu.
 */
const { Menu } = require('electron');

function construir(h) {
  // h.ejecutar(codigo): corre una orden dentro de la pagina de Andify
  const orden = codigo => () => h.ejecutar(codigo);
  const accion = (nombre, arg) => orden(`typeof act==='function'&&act('${nombre}'${arg ? ",'" + arg + "'" : ''})`);
  const volumen = paso => orden(`(function(){var v=document.querySelector('[data-role=vol]');if(!v)return;
    v.value=Math.max(0,Math.min(100,+v.value+(${paso})));v.dispatchEvent(new Event('input',{bubbles:true}))})()`);

  return Menu.buildFromTemplate([
    {
      label: 'Andify',
      submenu: [
        { label: 'About Andify', role: 'about' },
        { type: 'separator' },
        { label: 'Settings…', accelerator: 'CommandOrControl+,', click: accion('tab', 'settings') },
        { type: 'separator' },
        { label: 'Hide Andify', role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit Andify', role: 'quit' }
      ]
    },
    {
      label: 'Library',
      submenu: [
        { id: 'scan', label: 'Scan for new files', accelerator: 'Shift+CommandOrControl+S', click: accion('scanlib') },
        { id: 'deep', label: 'Deep scan', click: accion('scandeep') },
        { type: 'separator' },
        { label: 'Clean refresh', accelerator: 'Shift+CommandOrControl+R', click: accion('cleanrefresh') },
        { label: 'Connect to Plex or choose a folder…', click: accion('setup') }
      ]
    },
    {
      label: 'Playback',
      submenu: [
        { label: 'Play / Pause', accelerator: 'Alt+CommandOrControl+P', click: orden("typeof toggle==='function'&&toggle()") },
        { label: 'Next', accelerator: 'Alt+CommandOrControl+Right', click: orden("typeof next==='function'&&next(false)") },
        { label: 'Previous', accelerator: 'Alt+CommandOrControl+Left', click: orden("typeof prev==='function'&&prev()") },
        { type: 'separator' },
        { label: 'Volume Up', accelerator: 'Alt+CommandOrControl+Up', click: volumen(5) },
        { label: 'Volume Down', accelerator: 'Alt+CommandOrControl+Down', click: volumen(-5) },
        { type: 'separator' },
        { label: 'Show Now Playing', click: orden("typeof openNp==='function'&&openNp()") },
        { label: 'Show Lyrics', accelerator: 'CommandOrControl+L', click: accion('lyrics') }
      ]
    },
    {
      label: 'Go',
      submenu: [
        { label: 'Home', accelerator: 'CommandOrControl+1', click: accion('tab', 'home') },
        { label: 'Search', accelerator: 'CommandOrControl+2', click: accion('tab', 'search') },
        { label: 'Playlists', accelerator: 'CommandOrControl+3', click: accion('tab', 'playlists') }
      ]
    },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CommandOrControl+R', click: () => h.recargar() },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    { role: 'windowMenu' },
    {
      label: 'Help',
      role: 'help',
      submenu: [{ label: 'Developer Tools', accelerator: 'Alt+CommandOrControl+I', click: () => h.consola() }]
    }
  ]);
}

// escanear la biblioteca solo tiene sentido con Plex: sin Plex esas opciones se apagan
async function estado(h) {
  const modo = await h.ejecutar("typeof mode!=='undefined'?mode:''");
  const m = Menu.getApplicationMenu();
  if (!m) return;
  for (const id of ['scan', 'deep']) {
    const it = m.getMenuItemById(id);
    if (it) it.enabled = modo === 'plex';
  }
}

module.exports = { construir, estado };
