# Andify — guía rápida / Quick start

## Español

**Instalar**
- Windows: abrí `Andify-Setup-1.0.0.exe`. Si Windows avisa "editor desconocido", tocá
  **Más información → Ejecutar de todas formas**. Es normal: el programa no está firmado.
- Mac: abrí el `.dmg` que corresponde a tu Mac (`arm64` si tiene chip Apple M1/M2/M3; `x64` si es Intel) y arrastrá
  Andify a Aplicaciones. La primera vez, clic derecho sobre el programa → **Abrir** → **Abrir**. Si dice "está dañado",
  abrí la Terminal y pegá: `xattr -dr com.apple.quarantine /Applications/Andify.app`
- Linux: dale permiso de ejecución al `.AppImage` y abrilo.

**Si tenés música en Plex**
1. Tocá **Sign in with Plex**. Te muestra un código.
2. Entrá a **plex.tv/link** en tu teléfono o navegador y escribí el código.
3. Elegí tu servidor y tu biblioteca de música. Listo.

Hace falta tener un servidor de Plex con una biblioteca de música (propia o compartida con vos).

**Si tenés música en la computadora**
1. Tocá **Choose folder** y elegí la carpeta donde está tu música.
2. Cada subcarpeta aparece como un disco. Si hay una imagen `cover.jpg` o `folder.jpg`, se usa
   como tapa; si no, Andify usa la tapa que viene dentro de los archivos.
3. La próxima vez que abras Andify, tu carpeta se abre sola o aparece un botón con su nombre.

Formatos: MP3, FLAC, M4A, AAC, OGG, OPUS y WAV.

Sin Plex, Andify solo muestra lo que funciona con tu carpeta: no aparecen Sonic AI, las mezclas, las playlists
de Plex ni los botones de transmitir.

**Bandeja:** Andify deja un icono junto al reloj. Si cerrás la ventana con la X, la música sigue sonando.
Para cerrarlo de verdad, clic derecho sobre el icono → **Quit Andify**.

**Atajos:** F11 pantalla completa · Ctrl+R recargar · Ctrl+Shift+U cambiar dónde abre Andify.

## English

**Install**
- Windows: run `Andify-Setup-1.0.0.exe`. If Windows warns about an unknown publisher, click
  **More info → Run anyway**. That is expected: the app is not code-signed.
- Mac: open the `.dmg` that matches your Mac (`arm64` for Apple chips M1/M2/M3; `x64` for Intel) and drag Andify to
  Applications. The first time, right-click the app → **Open** → **Open**. If it says "damaged", open Terminal and
  paste: `xattr -dr com.apple.quarantine /Applications/Andify.app`
- Linux: make the `.AppImage` executable and run it.

**If your music is on Plex**
1. Click **Sign in with Plex**. It shows a code.
2. Go to **plex.tv/link** on your phone or browser and type the code.
3. Pick your server and your music library. Done.

You need a Plex server with a music library (yours, or one shared with you).

**If your music is on this computer**
1. Click **Choose folder** and pick the folder with your music.
2. Each subfolder becomes an album. A `cover.jpg` or `folder.jpg` is used as the cover; if there
   is none, Andify uses the artwork stored inside the files.
3. Next time you open Andify, your folder opens by itself or a button with its name appears.

Formats: MP3, FLAC, M4A, AAC, OGG, OPUS and WAV.

**Shortcuts:** F11 fullscreen · Ctrl+R reload · Ctrl+Shift+U change where Andify opens.

Without Plex, Andify shows only what works with your folder: Sonic AI, the mixes, Plex playlists and the cast buttons do not appear.

**Tray:** Andify leaves an icon next to the clock. If you close the window with the X, the music keeps playing.
To really close it, right-click the icon → **Quit Andify**.
