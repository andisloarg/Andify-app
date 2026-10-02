/*
 * La barra de titulo de la ventana (el nombre y los botones minimizar, maximizar y cerrar)
 * toma el color del fondo de la skin que estes usando: con "Ultra black" queda negra.
 *
 * Funciona en Windows. La barra de Windows se oculta y Andify dibuja la suya, con el mismo
 * fondo que la app; los botones los sigue dibujando Windows, con el mismo color.
 * Todo esto se inyecta desde el programa, asi sirve tanto con el Andify de adentro como con
 * una copia en tu NAS, y no cambia nada en la version web.
 */
const ALTO = 36;

const CSS = `
html[data-dt] body{padding-top:${ALTO}px!important;box-sizing:border-box!important}
html[data-dt] .app{height:calc(100dvh - ${ALTO}px)!important}
html[data-dt] #np,html[data-dt] #npm,html[data-dt] #setup,html[data-dt] #aifull,html[data-dt] .sheet{top:${ALTO}px!important}
#dtbar{position:fixed;top:0;left:0;right:0;height:${ALTO}px;z-index:2147483000;
  -webkit-app-region:drag;display:flex;align-items:center;gap:9px;padding:0 0 0 12px;
  font:600 12px/1 system-ui,'Segoe UI',sans-serif;letter-spacing:.02em;user-select:none;cursor:default}
#dtbar img{width:16px;height:16px;border-radius:4px;display:block}
`;

// crea la barra (si no existe) y devuelve el color de fondo de la app
const REFRESCAR = `(function(){
  var d=document,b=d.getElementById('dtbar');
  if(!b)return null;
  function fondo(){
    var c=getComputedStyle(d.body).backgroundColor;
    if(!c||c==='transparent'||/,\\s*0\\)$/.test(c))c=getComputedStyle(d.documentElement).backgroundColor;
    return c;
  }
  var c=fondo(),m=c.match(/[\\d.]+/g)||[0,0,0];
  var r=+m[0],g=+m[1],bl=+m[2],lum=(0.2126*r+0.7152*g+0.0722*bl)/255;
  b.style.background=c;
  b.style.color=lum>0.55?'rgba(20,18,26,.85)':'rgba(255,255,255,.86)';
  var h='#'+[r,g,bl].map(function(v){return Math.round(v).toString(16).padStart(2,'0')}).join('');
  return {c:h,light:lum>0.55};
})()`;

const iniciar = icono => `(function(){
  var d=document;
  d.documentElement.setAttribute('data-dt','1');
  if(!d.getElementById('dtbar')){
    var b=d.createElement('div');b.id='dtbar';
    b.innerHTML='<img alt="" src="data:image/png;base64,${icono}"><span>Andify</span>';
    d.body.appendChild(b);
  }
})()`;

module.exports = { ALTO, CSS, REFRESCAR, iniciar };
