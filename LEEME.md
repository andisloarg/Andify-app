# Andify de escritorio: como armar los instaladores

Esta carpeta le pide a GitHub que arme, en la nube, los instaladores de Andify para
**Windows y Mac** (y Linux, si lo pedis). No hace falta instalar nada en tu PC.

El instalador trae adentro tu `andify.html`, asi que funciona sin servidor web.
Antes de armarlo, el script `prepare.js` le saca lo que es solo de tu red (direcciones
de ejemplo de tu NAS y la direccion por defecto del creador de playlists), asi lo podes
regalar sin datos personales. Tu `andify.html` queda intacto.

## Que hay en la carpeta

| Archivo | Para que sirve |
|---|---|
| `andify.html` | Tu Andify. Cuando cambie, reemplazalo por el nuevo. |
| `prepare.js` | Hace la copia limpia que va adentro del instalador. |
| `main.js` | La ventana del programa. |
| `preload.js` | Le avisa a Andify que corre como programa instalado. |
| `package.json` | Las instrucciones de armado. |
| `build/icon.ico`, `icon.png` | El icono. |
| `.github/workflows/build-exe.yml` | La receta de GitHub. |
| `PARA-AMIGOS.md` | La guia para darle a quien lo use. |

## Paso a paso

1. En github.com: **New repository**, nombre `andify-pc`, **Private**, **Create repository**.
2. **uploading an existing file** y arrastra el *contenido* de esta carpeta (no la carpeta entera).
   **Commit changes**.
3. Revisa que aparezca la carpeta `.github`. Si no, **Add file → Create new file**, nombre
   `.github/workflows/build-exe.yml`, y pega el contenido de ese archivo. **Commit**.
4. Pestana **Actions**. Al subir los archivos se arman **Windows** y **Mac** a la vez (de 5 a 12 minutos).
   Linux es opcional: **Build Andify installers → Run workflow**, marca **Armar tambien Linux**.
5. Con el tilde verde, entra a la ejecucion. Abajo, en **Artifacts**, estan **andify-windows** y
   **andify-mac** (y **andify-linux** si lo pediste). Cada una es un zip con el instalador.
6. Le das a tus amigos el que corresponda a su sistema, junto con `PARA-AMIGOS.md`.

Si un sistema falla, los otros igual se arman. Si te falla alguno, copia el mensaje de error.

## Para actualizar

Reemplaza `andify.html` en el repositorio por el nuevo. La compilacion arranca sola.

## La bandeja del sistema

Andify deja un icono junto al reloj (abajo a la derecha en Windows; arriba en la barra de menu en
Mac). Clic derecho sobre el icono:

- **Open Andify**, **Play / Pause**, **Next**, **Previous**.
- **Closing the window keeps Andify in the tray**: si esta tildado, la **X** de la ventana la manda
  a la bandeja y la musica sigue. Destildalo si preferis que la X cierre el programa.
- **Quit Andify**: cierra de verdad.

Un clic en el icono muestra u oculta la ventana, y al pasar el mouse por encima se ve el tema que suena.
En Linux la X cierra el programa de fabrica, porque algunos escritorios no muestran la bandeja.
En Windows el icono puede quedar escondido en la flecha **^**: arrastralo a la barra para dejarlo fijo.

## Pantalla completa

Hay un boton de pantalla completa arriba a la derecha: en la barra de la ventana (Windows y Mac), en la
pantalla de reproduccion y, en el navegador, como una pastilla discreta en la esquina. En pantalla completa la barra se
esconde y aparece una pastilla para volver cuando movés el mouse. Tambien funcionan **F11** y **Esc**.
Se puede quitar en **Ajustes → Buttons and badges → Full screen button** (por dispositivo).

## La barra de titulo

La barra de arriba de la ventana la dibuja la propia pagina y toma el color del fondo de la skin: con **Ultra black** queda negra, con las
claras queda clara. Se actualiza sola al cambiar de skin. Se arrastra desde ahi para mover la ventana y con
doble clic se maximiza.

- **Windows**: el nombre queda a la izquierda y los botones minimizar, maximizar y cerrar a la derecha, en el
  mismo color, y cambian a blanco o a oscuro para que se lean.
- **Mac**: los tres botones de colores quedan a la izquierda y el nombre en el centro. En pantalla completa
  la barra se esconde.

## Idioma

Andify habla 15 idiomas: ingles, espanol, portugues, frances, aleman, italiano, neerlandes, polaco, ruso,
turco, chino, japones, coreano, hindi y esloveno. Se elige en **Ajustes → Language**; por defecto usa el idioma
del sistema. Se guarda en cada dispositivo (un telefono puede estar en esloveno y la compu en espanol).
En el programa de escritorio tambien cambian el menu del icono de la bandeja y el menu de Mac.
Los titulos de tu musica, los artistas y las letras nunca se traducen.

## Ajustes: compartidos o solo en este dispositivo

Por defecto los ajustes (skin, orden de las secciones, wallpaper, etc.) se guardan en tu NAS y todos tus
dispositivos los comparten. En **Ajustes → Settings sync** cada dispositivo puede elegir **This device only**:
deja de enviar y de recibir ajustes y conserva los suyos. Al volver a **Shared with my devices** pregunta
cual manda: los del NAS (OK) o los de este dispositivo (Cancelar).

## El menu de Mac

En Mac el menu de arriba tiene las cosas de Andify (no el menu generico con "Servicios"):

| Menu | Que tiene |
|---|---|
| **Andify** | About, Settings… (⌘,), Hide, Quit |
| **Library** | Scan for new files (⇧⌘S), Deep scan, Clean refresh (⇧⌘R), Connect to Plex or choose a folder… |
| **Playback** | Play / Pause (⌥⌘P), Next (⌥⌘→), Previous (⌥⌘←), Volume Up y Down (⌥⌘↑ ↓), Show Now Playing, Show Lyrics (⌘L) |
| **Go** | Home (⌘1), Search (⌘2), Playlists (⌘3) |
| **Edit, View, Window, Help** | Copiar y pegar, zoom y pantalla completa, ventana, consola de errores |

Scan for new files y Deep scan se apagan solos cuando no hay Plex conectado.
El nombre en los menus es **Andify** (antes salia en minusculas).

## Iconos

- **Windows y Linux**: `build/icon.ico` y `build/icon.png`: un circulo blanco con las barras negras y el fondo transparente.
  El icono de la bandeja (`build/tray.png`) es el mismo.
- **Mac**: `build/icon-mac.png`, un cuadrado redondeado blanco con las barras negras, con el margen
  transparente que usan los iconos de Mac para verse del mismo tamano que los demas del Dock.
- **Barra de menu de Mac**: `build/trayTemplate.png` y `trayTemplate@2x.png`, solo las barras sobre
  transparente. El sistema las pinta de blanco o negro segun el modo claro u oscuro.

## Nombres de las carpetas (importante)

- La carpeta de los iconos se llama **`build`**, sin punto.
- Solo la carpeta de la receta lleva punto: **`.github`**, y adentro `workflows`, y adentro `build-exe.yml`.

Si te equivocas con el nombre (por ejemplo `.build`), el script `prepare.js` copia o vuelve a crear los
iconos solo, asi que la compilacion no falla por eso. Igual conviene dejar los nombres correctos.

## Si el icono de la bandeja sale vacio

1. Fijate el numero de version del instalador: tiene que ser **Andify-Setup-1.0.1** o mayor. Si dice 1.0.0,
   es una version vieja: baja el instalador nuevo de Artifacts.
2. Para actualizar el repositorio subi **todo** el contenido de la carpeta, no solo `main.js`: hace falta
   `package.json` (que copia los iconos fuera del paquete) y la carpeta `build` completa.
3. Si igual sale vacio, abri `%APPDATA%\Andify\andify-log.txt` (pega esa ruta en la barra del Explorador)
   y copiame lo que dice. Ahi queda anotado de donde salio el icono y si algun archivo no se pudo leer.
4. Windows a veces recuerda un icono vacio de una instalacion anterior: desinstala Andify, reinicia el
   Explorador de Windows (Administrador de tareas → Explorador de Windows → Reiniciar) y volve a instalar.

## Atajos dentro del programa

F11 pantalla completa · Ctrl+R recargar · Ctrl+Shift+R recargar sin cache ·
Ctrl+Shift+U elegir donde abre Andify (el de adentro o una copia en un servidor) ·
Ctrl+Shift+I consola de errores.

## Avisos que van a ver tus amigos

- **Windows**: "editor desconocido". Se resuelve con *Mas informacion → Ejecutar de todas formas*.
  Se evitaria con un certificado de firma de codigo, que es de pago.
- **Mac**: el programa no esta firmado por Apple (eso requiere una cuenta de desarrollador de pago).
  La primera vez: arrastra Andify a Aplicaciones, clic derecho sobre el → **Abrir** → **Abrir**.
  Si dice "esta danado" o no abre: **Ajustes del Sistema → Privacidad y seguridad → Abrir de todos modos**,
  o en la Terminal: `xattr -dr com.apple.quarantine /Applications/Andify.app`.
  Hay dos instaladores en el zip: `arm64` para Mac con chip Apple (M1, M2, M3...) y `x64` para Mac con Intel.

## Cuota gratuita de GitHub

En un repositorio privado la cuenta gratis da 2.000 minutos al mes, y Mac cuenta **10 veces**: cada
compilacion completa (Windows + Mac) gasta unos 70 a 100. Sube todos los archivos juntos en **un solo**
commit para que se arme una sola vez. Si te quedas corto, podes ejecutar solo lo que necesites desde
Actions o hacer el repositorio publico (ahi es gratis, pero el andify.html tendria tus direcciones de red).
