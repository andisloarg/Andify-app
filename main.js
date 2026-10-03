/*
 * Andify para Windows.
 *
 * Es una ventana propia, sin barra de direcciones ni pestanas. Por defecto
 * abre el andify.html que viene adentro del programa, asi que funciona sin
 * depender de ningun servidor web. Si preferis abrir la copia que tenes en
 * el NAS (para recibir las actualizaciones sin reinstalar), apreta
 * Ctrl + Shift + U y escribi su direccion.
 */
const { app, BrowserWindow, Menu, Tray, nativeImage, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const barra = require('./titlebar.js');
const macmenu = require('./macmenu.js');
const textosMenu = require('./menu-i18n.json');

// el nombre que se ve en los menus y en el Dock (si no, Mac usa el nombre del paquete, en minusculas)
app.setName('Andify');

// la musica tiene que poder arrancar sin un clic previo, y las teclas
// multimedia del teclado tienen que controlar la reproduccion
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('enable-features', 'HardwareMediaKeyHandling,MediaSessionService');

// identidad de la aplicacion en Windows: agrupa la ventana y el icono de la bandeja
// bajo "Andify" y hace que los avisos salgan con su nombre
app.setAppUserModelId('com.andify.desktop');

// El WiiM (y otros aparatos de la casa) usan un certificado propio que el navegador no reconoce,
// por eso en el navegador hay que tocar "Authorize the WiiM". Aca se aceptan solo los
// certificados de aparatos de la red local; cualquier otra direccion sigue protegida.
const RED_LOCAL = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  let host = '';
  try { host = new URL(url).hostname; } catch (e) {}
  if (RED_LOCAL.test(host)) { event.preventDefault(); callback(true); }
  else callback(false);
});

if (!app.requestSingleInstanceLock()) { app.quit(); }

const archivo = path.join(app.getPath('userData'), 'andify-window.json');

function leer() {
  try { return JSON.parse(fs.readFileSync(archivo, 'utf8')); } catch (e) { return {}; }
}
function guardar(extra) {
  try {
    fs.mkdirSync(path.dirname(archivo), { recursive: true });
    fs.writeFileSync(archivo, JSON.stringify(Object.assign(leer(), extra)));
  } catch (e) {}
}

const ICONO_BANDEJA = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAIuElEQVR42u2bf4xVxRXHP2fuXdaQ3beyC9hKU0lMKGmboCUpMYhIW0mhKooUUxKxrCkkWtv+JSWpAUzb0DaxKVSx5UeioJYuAf9gNdI0QFIx/GpqLUiaaCit2AbiAvsiy7575/SPN3O5PN/b93sXu53kZt/e+96d8/3OOWfOnDkjNLGpqgAGEHcrFhGt4DeB/xew5X5TT5NmghaRqMjzVmAs0AmE7nYEfAh8JCKXi/wmbBYZ0mDgQRq0E/wW4MvAl4AvAp8G2oEORxSABS4A/cAHwN+APwOHgb8UeWfcTK2oBXyQJkJVZ6vqBlU9qfW3k+5dsx3JH+vzWgGeUdUVqnq0CIicuyJVjVXVlrhi9x3//cJ21PWRGXEifMduxFeo6nspQa0DEDdAA2L3Lpu6957rU4adBFU1qmrc51mqerBgpBsBuhwZvh1U1VmFcg2Xyq8ZRuDliFjTdJNIqfx4Ve1NCRLpyLUoRXyvqo5vCglu6kFVp6rqCdfhYD2SW2s1iiLN5XJqra2XCC/LCVWdmpa57jhAVQMRiVX188AfgU+5wCVsMMmI1BWWeJn+DXxVRE542WsmIAV+CnCgEeA9UFVlz55eBgYGuPeee2i9rrXRJMwWkb9XQsKQ3l5Vu1IBTd32HsexXr48qA8sXKQuvNXbZ87S833n1VrbCHOIUgFUV02zg5vbvd2/nvL09UkW5WXr7X1VAb2+o1O7OicooM8+uzHfSS7XCOfoX/K69wfpKDLdSjFjRCRS1dXAXCDXCJtXzYfvZ8+exZi8GURRhDGGc2fPNdKlhE7muaq62q0lTEUEpOx+BrCmGQ4vDEOsvbKWsdYShmGjZ+7Qyb5GVWc4TMGQBDg1UWczz6QcpVQ70nEcE0UR1tqSmlDuXgNWul7uZxwmLTQFU0T1LdANTAfiVHKi8p5FCIKAMAwxxjQDXKUtcBimA90OmylKgGPGqmobsNZ5aKnFxuM45uWXf8e6det4552TybRXbYvjOLmKaVIVmqDAWofNprUgzUbgkgxLgBsdc6ZaAmxs+fbDy1iy5FusWrWKGTNm8MYbBxNbr+ZdQRAkVx2aZByWG4ElDmNQjADvJB6tZfSttRhj+Ovbb7P9xRfJtF/P+M6J9PdfZP2v1lelBdZaRITe3le5b8F9LF36MMePH0dEatUErwWPOoxx2lOmPf9twDSXogpqUf++vj6M5EdrMDeIiHDx4sXEN1Si9mEYsm/ffu6++24nN+zft5/DRw5zww0Ta4kYA4dpGnCbiPzJYzYFIfGDPvlYs9cJgqtG2qtytUT29OwElK7OCXR1TuCf/zrNgQMHEBHiOK5FNOuwPZjGHKqquKAnBOa5B6bcKPlRKATXqCnOxjEiQhRFifYMDg6WlMWTP4Rm+PT8PFUNHWZJ5+ynATc7lky5UQ7DsKqRrSdyLLVa9NoVhiFhGJYzC+Ow3eywAohJgZ3hSS0ljL82b97C8u8sp+f3O5sVxFS8qty79w+sWL6Cp5/+JQMDA+XkiQuwmnT8Ob2cZw6CgJVP/JCf/+JngLBp8ybW/2cDjz/+XeI4brpGFDrK3bteYeED9yf3jx09xrbtL1TicKcXzpEAXyiVI/Cqlu3Psm37dq5rHUtX53iCoIWtW7YmZjFczYPbsmULCHR1TqC9rYNdu3Zz+h+nMcaUmi6lAGtsRERVdQwwqVySJJfLYZyXz+VyqL0iTJ2JjNp9hAq5XC7RistFHGURAiap6hgRSRIFbW67akgCRASusq9rYXdKq0mr+YftDnPiAMf5G6OktTnMCQEttaz6PsEtcJgxjPLmCciVmv//R1vsMCcE9AHZUURA1mFOCMiSL04Y0rUX87IjMf2V6ruCJbd/2O8H3LjF0CDwfjkCgjAgiqJUosIki5UR0eM4xhiTrEuiKCIMwkoIeF9EBv1iyHv/46UI8ImITCbD/Hnz+OhSlv7+fnLRIPcvzIeiw0mEH+VF31yEtZbz58/Tn73AHbPv4KbJn02SM0MQcDwZ09TDYy4ZWlLdVJUNv17PpM9M4siRI9z1tbv4/g++h6qW6rA5c5iLRh95pBsRYWdPD1OmTOFHTz5JGIaVLM6OpTNCPmg+lJojS9rb2LFjeeqptWXtcbjsv7t7Gd3dyyqVJSjAak1KLd4C3nXhoh1K/XyWNp2MGG6Hl/YDFcpiHbZ3HVYA9Yuh0G0fvVYuJeazQMaYchmYurQjb1aSONxScX4VsviU2Gs+A5ZeDHnqdlSSEiuXN0gLUm0m1/92/jfmY61y4cIFPuw7R0dmHDNnzqzH3/js1440ZuM6jd1mwZtOPaTWyLCtrQ2r+eRIS0sLqkpra2vFmaMgCLDWsmDBvfzmud9y6623MOfOr7D7lV1MnnxTrQTEDtNbwJtu6o8LVc6nyJfXuh2e3/u/rHPnfj3Z+wfRPXvyJUUDAwOqqrpt23YFtCMzTjsy4xTQn/z4p1dtjxerE6ijdsBjWZ7G6meBhCWnBS8Bq8mXtNpqzEFEGDNmDD09O9i48TlOnTrF4sWLmTPnzqrT4z79HQQBVi0otaq+3+M4A7zkMMYfI8A5w0BEsq4uYBNV7g94+81kMqxc+UQ1iYqS5gBgxNRT1eyz3KsdtqtKZgoptW4beasLFoJafIEvfIiiiNjl90dw1Rc4LFsdNltsOZxoQf6PWOCxFINarSb4XH0xtS9GSBNISsv9mMMkhVXmpoggsVOTQ+QrRHylRYMXMVcAG1PzdtdQzVe2rBGRQ6WqxUp5FesChbXAXpc+ahgJ7e3tWKvJVGmt0tbW1mjwLcBeEVnrvL6t1o4bXibny+Cy/Vm9feasZKr83JSpeubMByNSJjdihZLZbJbnn3+BgUuXeGjpQ0ycOHFECiVHpFS21EbnSJTKVipwU4qlc7nciBdLV0PC6C2XLyTBfR5dByYKZwf3eXQdmSlhEqPr0NQQJjG6js0NQcQn6uDkqD86+//D0002jWv++Px/AVfxd+RgPnm/AAAAAElFTkSuQmCC';

function log(m) {
  try {
    const f = path.join(app.getPath('userData'), 'andify-log.txt');
    try { if (fs.statSync(f).size > 60000) fs.unlinkSync(f); } catch (e) {}
    fs.appendFileSync(f, new Date().toISOString() + '  ' + m + '\n');
  } catch (e) {}
}

let ventana = null;
// los menus salen en el idioma que elegiste dentro de Andify (la app avisa cual es)
let idioma = 'en';
const T = s => (idioma !== 'en' && textosMenu[idioma] && textosMenu[idioma][s]) || s;
let colorBarra = '';
const MAC = process.platform === 'darwin';
const CON_BARRA = process.platform === 'win32' || MAC;   // barra de titulo propia, con el color de la skin
let bandeja = null;      // el icono junto al reloj; se guarda en una variable para que no lo borre el sistema
let saliendo = false;    // true cuando se eligio cerrar de verdad

function mostrar() {
  if (!ventana) return;
  if (ventana.isMinimized()) ventana.restore();
  ventana.show();
  ventana.focus();
}

// cerrar la ventana la manda a la bandeja y la musica sigue (en Linux queda apagado de fabrica,
// porque algunos escritorios no muestran la bandeja y no habria como volver a abrirla)
function enBandeja() {
  const v = leer().bandeja;
  return v === undefined ? process.platform !== 'linux' : !!v;
}

async function js(codigo) {
  try { return await ventana.webContents.executeJavaScript(codigo, true); } catch (e) { return null; }
}

// la barra de titulo copia el color de fondo de la skin: se revisa cada tanto y se actualiza solo si cambio
async function refrescarBarra() {
  if (!CON_BARRA || !ventana || ventana.isDestroyed() || !ventana.isVisible()) return;
  const r = await js(barra.REFRESCAR);
  if (!r || !r.c || r.c === colorBarra) return;
  colorBarra = r.c;
  const simbolo = r.light ? '#14121a' : '#ffffff';
  if (ventana.setTitleBarOverlay && !MAC) { try { ventana.setTitleBarOverlay({ color: r.c, symbolColor: simbolo, height: barra.ALTO }); } catch (e) {} }
  try { ventana.setBackgroundColor(r.c); } catch (e) {}
  guardar({ tb: r.c, ts: simbolo });
}

function menuBandeja() {
  return Menu.buildFromTemplate([
    { label: T('Open Andify'), click: mostrar },
    { type: 'separator' },
    { label: T('Play / Pause'), click: () => js("typeof toggle==='function'&&toggle()") },
    { label: T('Next'), click: () => js("typeof next==='function'&&next(false)") },
    { label: T('Previous'), click: () => js("typeof prev==='function'&&prev()") },
    { type: 'separator' },
    { label: T('Closing the window keeps Andify in the tray'), type: 'checkbox', checked: enBandeja(),
      click: i => guardar({ bandeja: i.checked }) },
    { type: 'separator' },
    { label: T('Quit Andify'), click: () => { saliendo = true; app.quit(); } }
  ]);
}

function crearBandeja() {
  // El icono se busca en varios lugares, del mas seguro al menos seguro. Los archivos de
  // "recursos" quedan fuera del paquete comprimido, que es donde Windows los lee sin problemas.
  // Si ninguno sirve, el icono sale de los datos que viajan dentro de este archivo.
  const rec = process.resourcesPath || '';
  const cand = [];
  if (process.platform === 'darwin') {
    cand.push(['recursos trayTemplate.png', path.join(rec, 'trayTemplate.png')]);
    cand.push(['build trayTemplate.png', path.join(__dirname, 'build', 'trayTemplate.png')]);
  }
  if (process.platform === 'win32') {
    cand.push(['recursos icon.ico', path.join(rec, 'icon.ico')]);
    cand.push(['build icon.ico', path.join(__dirname, 'build', 'icon.ico')]);
  }
  cand.push(['recursos tray.png', path.join(rec, 'tray.png')]);
  cand.push(['build tray.png', path.join(__dirname, 'build', 'tray.png')]);
  cand.push(['build icon.png', path.join(__dirname, 'build', 'icon.png')]);
  let img = null, fuente = '', esIco = false, plantilla = false;
  for (const [nombre, f] of cand) {
    try {
      if (!fs.existsSync(f)) { log('icono: no existe ' + nombre); continue; }
      const im = nativeImage.createFromPath(f);
      if (!im.isEmpty()) { img = im; fuente = nombre; esIco = /\.ico$/i.test(f); plantilla = /trayTemplate/.test(f); break; }
      log('icono: vacio ' + nombre);
    } catch (e) { log('icono: error en ' + nombre + ': ' + e.message); }
  }
  if (!img) { img = nativeImage.createFromDataURL('data:image/png;base64,' + ICONO_BANDEJA); fuente = 'datos embebidos'; esIco = false; }
  if (plantilla) img.setTemplateImage(true);
  if (!esIco && !plantilla) img = img.resize(process.platform === 'darwin' ? { width: 18, height: 18 } : { width: 32, height: 32 });
  try { const t = img.getSize(); log('icono de la bandeja: ' + fuente + ' (' + t.width + 'x' + t.height + ')'); } catch (e) {}
  bandeja = new Tray(img);
  bandeja.setToolTip('Andify ' + app.getVersion());
  bandeja.setContextMenu(menuBandeja());
  // un clic muestra u oculta la ventana; doble clic la abre
  bandeja.on('click', () => { if (ventana.isVisible() && ventana.isFocused()) ventana.hide(); else mostrar(); });
  bandeja.on('double-click', mostrar);
  // el icono muestra el tema que esta sonando
  setInterval(async () => {
    const t = await js("(typeof queue!=='undefined'&&queue[qi])?(queue[qi].title+' - '+(queue[qi].artist||'')):''");
    bandeja.setToolTip(t ? ('Andify - ' + t).slice(0, 120) : 'Andify ' + app.getVersion());
  }, 4000);
}

function avisoBandeja() {
  if (leer().avisado) return;
  guardar({ avisado: true });
  if (bandeja && process.platform === 'win32' && bandeja.displayBalloon) {
    bandeja.displayBalloon({
      iconType: 'info', title: 'Andify',
      content: 'Andify keeps playing from the tray. Right-click its icon to quit.'
    });
  }
}

function cargar(win) {
  const url = (leer().url || '').trim();
  if (url) win.loadURL(url);
  else win.loadFile(path.join(__dirname, 'build', 'andify.html'));
}

function crear() {
  const est = leer();
  ventana = new BrowserWindow({
    width: est.w || 1280, height: est.h || 860, minWidth: 900, minHeight: 600,
    backgroundColor: est.tb || '#17131f',
    autoHideMenuBar: true,
    title: 'Andify',
    ...(CON_BARRA ? (MAC ? {
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: 14, y: Math.round((barra.ALTO - 12) / 2) }
    } : {
      titleBarStyle: 'hidden',
      titleBarOverlay: { color: est.tb || '#17131f', symbolColor: est.ts || '#ffffff', height: barra.ALTO }
    }) : {}),
    icon: fs.existsSync(path.join(process.resourcesPath || '', 'icon.ico')) ? path.join(process.resourcesPath, 'icon.ico') : path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      // la pagina es tuya y habla con tu servidor y con tu NAS: sin esto el
      // navegador interno bloquea esas conexiones por venir de un archivo local
      webSecurity: false
    }
  });
  ventana.setMenuBarVisibility(false);
  if (est.max) ventana.maximize();
  cargar(ventana);

  if (CON_BARRA) {
    ventana.webContents.on('did-finish-load', async () => {
      try { await ventana.webContents.insertCSS(barra.CSS); } catch (e) {}
      await js(barra.iniciar(ICONO_BANDEJA, MAC));
      colorBarra = '';
      await refrescarBarra();
    });
    setInterval(refrescarBarra, 1500);
    // Mac: en pantalla completa la barra de titulo se esconde
    ventana.on('enter-full-screen', () => js(barra.pantallaCompleta(true)));
    ventana.on('leave-full-screen', () => js(barra.pantallaCompleta(false)));
  }

  ventana.on('close', e => {
    const b = ventana.getNormalBounds();
    guardar({ w: b.width, h: b.height, max: ventana.isMaximized() });
    if (!saliendo && bandeja && enBandeja()) {
      e.preventDefault();
      ventana.hide();
      avisoBandeja();
    }
  });
  ventana.on('session-end', () => { saliendo = true; });

  // los enlaces a otros sitios se abren en tu navegador, no dentro de Andify
  ventana.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  ventana.webContents.on('will-navigate', (e, url) => {
    if (!/^file:|^http:\/\/(localhost|127\.|192\.168\.|10\.|172\.)/.test(url) && url !== ventana.webContents.getURL()) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  // atajos: F11 pantalla completa, Ctrl+R recargar, Ctrl+Shift+U direccion, Ctrl+Shift+I consola
  ventana.webContents.on('before-input-event', (e, i) => {
    if (i.type !== 'keyDown') return;
    const ctrl = i.control || i.meta;
    if (i.key === 'F11') { ventana.setFullScreen(!ventana.isFullScreen()); e.preventDefault(); }
    else if (ctrl && !i.shift && i.key.toLowerCase() === 'r') { ventana.reload(); e.preventDefault(); }
    else if (ctrl && i.shift && i.key.toLowerCase() === 'r') { ventana.webContents.reloadIgnoringCache(); e.preventDefault(); }
    else if (ctrl && i.shift && i.key.toLowerCase() === 'i') { ventana.webContents.toggleDevTools(); e.preventDefault(); }
    else if (ctrl && i.shift && i.key.toLowerCase() === 'u') { e.preventDefault(); cambiarDireccion(); }
  });
}

async function cambiarDireccion() {
  const aux = new BrowserWindow({
    width: 540, height: 280, resizable: false, minimizable: false, parent: ventana, modal: true,
    title: 'Andify', backgroundColor: '#17131f',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  aux.setMenuBarVisibility(false);
  const actual = (leer().url || '').replace(/"/g, '&quot;');
  const html = `<html><head><meta charset="utf-8"><style>
    body{font:14px/1.5 system-ui,Segoe UI,sans-serif;background:#17131f;color:#f0eaf7;margin:0;padding:22px}
    h1{font-size:17px;margin:0 0 6px} p{margin:0 0 12px;color:#a097b3}
    input{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:10px;border:1px solid #2a2333;background:#1f1a28;color:#f0eaf7;font-size:14px}
    button{margin-top:14px;padding:9px 18px;border:0;border-radius:999px;background:#e5a00d;color:#1b1304;font-weight:700;font-size:14px;cursor:pointer}
  </style></head><body>
    <h1>Where should Andify open?</h1>
    <p>Leave it empty to use the Andify that is inside this program. Or write the address of your copy on the NAS, for example http://192.168.1.20:6664/andify.html</p>
    <input id="u" value="${actual}" placeholder="(empty = built-in Andify)">
    <button id="ok">Save</button>
    <script>
      const i=document.getElementById('u');i.focus();
      const enviar=()=>window.andify.saveUrl(i.value.trim());
      document.getElementById('ok').onclick=enviar;
      i.addEventListener('keydown',e=>{if(e.key==='Enter')enviar()});
    </script></body></html>`;
  aux.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  const nueva = await new Promise(res => {
    ipcMain.once('andify-url', (_e, u) => { res(u); aux.close(); });
    aux.on('closed', () => res(null));
  });
  if (nueva === null) return;
  let u = nueva;
  if (u && !/^https?:\/\//.test(u)) u = 'http://' + u;
  guardar({ url: u });
  cargar(ventana);
}

// cada tanto se pregunta en que idioma esta Andify; si cambio, se rearman los menus
async function vigilarIdioma() {
  const L = await js("typeof i18nLang==='function'?i18nLang():'en'");
  if (typeof L !== 'string' || L === idioma) return;
  idioma = L;
  if (bandeja) { try { bandeja.setContextMenu(menuBandeja()); } catch (e) {} }
  if (MAC && global.__menuMac) { try { global.__menuMac.reconstruir(); } catch (e) {} }
}

app.on('second-instance', mostrar);
app.on('activate', mostrar);   // Mac: un clic en el Dock vuelve a abrir la ventana
app.on('before-quit', () => { saliendo = true; });

app.whenReady().then(() => {
  log('Andify ' + app.getVersion() + ' arrancando en ' + process.platform);
  if (process.platform === 'darwin') {
    // en Mac el menu trae copiar y pegar, Cmd+Q y las funciones de Andify
    const h = {
      T,
      ejecutar: js,
      recargar: () => { if (ventana) ventana.reload(); },
      consola: () => { if (ventana) ventana.webContents.toggleDevTools(); }
    };
    Menu.setApplicationMenu(macmenu.construir(h));
    setInterval(() => macmenu.estado(h), 3000);
    h.reconstruir = () => Menu.setApplicationMenu(macmenu.construir(h));
    global.__menuMac = h;
  } else {
    Menu.setApplicationMenu(null);
  }
  crear();
  try { crearBandeja(); } catch (e) { bandeja = null; log('bandeja: error ' + e.message); }
  setInterval(vigilarIdioma, 2000);
});

app.on('window-all-closed', () => app.quit());
