/*
 * La barra de titulo de la ventana (el nombre y los botones minimizar, maximizar y cerrar)
 * toma el color del fondo de la skin que estes usando: con "Ultra black" queda negra.
 *
 * Funciona en Windows y en Mac. La barra del sistema se oculta y Andify dibuja la suya, con el mismo
 * fondo que la app. En Windows los botones los sigue dibujando Windows, con el mismo color; en Mac
 * los tres botones de colores quedan a la izquierda, y el titulo va en el centro.
 * Todo esto se inyecta desde el programa, asi sirve tanto con el Andify de adentro como con
 * una copia en tu NAS, y no cambia nada en la version web.
 */
const ALTO = process.platform === 'darwin' ? 32 : 36;

const CSS = `
html[data-dt] body{padding-top:${ALTO}px!important;box-sizing:border-box!important}
html[data-dt] .app{height:calc(var(--appvh,100vh) - ${ALTO}px)!important}
html[data-dt] #np,html[data-dt] #npm,html[data-dt] #setup,html[data-dt] #aifull,html[data-dt] .sheet{top:${ALTO}px!important}
#dtbar{position:fixed;top:0;left:0;right:0;height:${ALTO}px;z-index:2147483000;
  -webkit-app-region:drag;display:flex;align-items:center;gap:9px;padding:0 0 0 12px;
  font:600 12px/1 system-ui,'Segoe UI',sans-serif;letter-spacing:.02em;user-select:none;cursor:default}
#dtbar img{width:16px;height:16px;border-radius:50%;display:block}
/* Mac: el titulo va centrado y los tres botones de colores quedan a la izquierda */
html[data-dtmac] #dtbar{justify-content:center;padding:0 90px}
/* pantalla completa: la barra desaparece y la app ocupa todo */
html[data-dtfs] body{padding-top:0!important}
html[data-dtfs] .app{height:var(--appvh,100vh)!important}
html[data-dtfs] #np,html[data-dtfs] #npm,html[data-dtfs] #setup,html[data-dtfs] #aifull,html[data-dtfs] .sheet{top:0!important}
html[data-dtfs] #dtbar{display:none}
`;

// crea la barra (si no existe) y devuelve el color de fondo de la app
const REFRESCAR = `(function(){
  var d=document,b=d.getElementById('dtbar');
  if(!b)return null;
  var i=d.createElement('i');
  i.style.cssText='position:fixed;left:-9px;top:0;width:1px;height:1px;background:var(--bg);pointer-events:none';
  d.body.appendChild(i);var c=getComputedStyle(i).backgroundColor;i.remove();
  var m=(c.match(/[\\d.]+/g)||[]).map(Number),r=m[0],g=m[1],bl=m[2];
  if(m.length<3||(m.length>3&&m[3]===0)){r=23;g=19;bl=31}
  var lum=(0.2126*r+0.7152*g+0.0722*bl)/255;
  b.style.background='rgb('+r+','+g+','+bl+')';
  b.style.color=lum>0.55?'rgba(20,18,26,.85)':'rgba(255,255,255,.86)';
  var h='#'+[r,g,bl].map(function(v){return Math.round(v).toString(16).padStart(2,'0')}).join('');
  return {c:h,light:lum>0.55};
})()`;

const iniciar = (icono, mac) => `(function(){
  var d=document;
  d.documentElement.setAttribute('data-dt','1');
  ${mac ? "d.documentElement.setAttribute('data-dtmac','1');" : ''}
  if(!d.getElementById('dtbar')){
    var b=d.createElement('div');b.id='dtbar';
    b.innerHTML='<img alt="" src="data:image/png;base64,${icono}"><span>Andify</span>';
    d.body.appendChild(b);
  }
})()`;

const pantallaCompleta = si => `document.documentElement.${si ? "setAttribute('data-dtfs','1')" : "removeAttribute('data-dtfs')"}`;

module.exports = { ALTO, CSS, REFRESCAR, iniciar, pantallaCompleta };
