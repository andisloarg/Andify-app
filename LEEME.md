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

## La barra de titulo

En Windows, la barra de arriba de la ventana (el nombre y los botones minimizar, maximizar y cerrar)
toma el color del fondo de la skin: con **Ultra black** queda negra, con las claras queda clara, y los
botones cambian a blanco o a oscuro para que se lean. Se actualiza sola al cambiar de skin.
Se arrastra desde ahi para mover la ventana y con doble clic se maximiza.

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
