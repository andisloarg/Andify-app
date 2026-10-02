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

const ICONO_BANDEJA = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAWfmNhQlgAABZ+anVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNjMnBhAAAAFlhqdW1iAAAAR2p1bWRjMm1hABEAEIAAAKoAOJtxA3VybjpjMnBhOmM2MmYwODdjLTQzMzEtNGIxNC05MWQwLTkzY2ExMGE3ZjY1NwAAAAOTanVtYgAAAClqdW1kYzJhcwARABCAAACqADibcQNjMnBhLmFzc2VydGlvbnMAAAAAuGp1bWIAAABEanVtZGNib3IAEQAQgAAAqgA4m3ETYzJwYS5pbmdyZWRpZW50LnYzAAAAABhjMnNod/TkBeLVF5bZ8RGU7kIEywAAAGxjYm9yo2lkYzpmb3JtYXRpaW1hZ2UvcG5namluc3RhbmNlSUR4LHhtcDppaWQ6YTUyYmUzZDAtMDkzNC00NWI1LTkzMWEtYmNhMWRlODRmNjlhbHJlbGF0aW9uc2hpcGhwYXJlbnRPZgAAAeJqdW1iAAAAQWp1bWRjYm9yABEAEIAAAKoAOJtxE2MycGEuYWN0aW9ucy52MgAAAAAYYzJzaC7euE35UDPLoZqGYv+SuzsAAAGZY2JvcqJnYWN0aW9uc4KiZmFjdGlvbmtjMnBhLm9wZW5lZGpwYXJhbWV0ZXJzoWtpbmdyZWRpZW50c4GiY3VybHgtc2VsZiNqdW1iZj1jMnBhLmFzc2VydGlvbnMvYzJwYS5pbmdyZWRpZW50LnYzZGhhc2hYID747lmjFvurJ9N7sL57SPrw0LmyuNJrr/3yrx1l64zkpGZhY3Rpb254HWNvbS5hbnRocm9waWMuY2xhdWRlLnByb3ZpZGVkanBhcmFtZXRlcnOheB9jb20uYW50aHJvcGljLm9yaWdpbi1jb25maWRlbmNlZ3Vua25vd25rZGVzY3JpcHRpb254ZkNsYXVkZSBwcm92aWRlZCB0aGlzIGZpbGUgYXQgdGhlIHJlcXVlc3Qgb2YgYSB1c2VyIGFuZCBtYXkgaGF2ZSBjcmVhdGVkIG9yIG1vZGlmaWVkIHRoZSBmaWxlIGNvbnRlbnRzLm1zb2Z0d2FyZUFnZW50oWRuYW1lZkNsYXVkZXJhbGxBY3Rpb25zSW5jbHVkZWT1AAAAyGp1bWIAAABAanVtZGNib3IAEQAQgAAAqgA4m3ETYzJwYS5oYXNoLmRhdGEAAAAAGGMyc2gLIRyypu9lO3o2PtyGhKotAAAAgGNib3KlY2FsZ2ZzaGEyNTZjcGFkTQAAAAAAAAAAAAAAAABkaGFzaFgg+B21bYNpuZ4R6B5Q4cUTg2TJ73DT+nmvnHdnDhB1aHpkbmFtZW5qdW1iZiBtYW5pZmVzdGpleGNsdXNpb25zgaJlc3RhcnQYIWZsZW5ndGgZFooAAAI+anVtYgAAACdqdW1kYzJjbAARABCAAACqADibcQNjMnBhLmNsYWltLnYyAAAAAg9jYm9ypWNhbGdmc2hhMjU2aXNpZ25hdHVyZXhNc2VsZiNqdW1iZj0vYzJwYS91cm46YzJwYTpjNjJmMDg3Yy00MzMxLTRiMTQtOTFkMC05M2NhMTBhN2Y2NTcvYzJwYS5zaWduYXR1cmVqaW5zdGFuY2VJRHgseG1wOmlpZDpjMDhlZGQ5Ny03YTJkLTQxYzAtOWVkNS0zYjQ2ZDZkNDM4MTJyY3JlYXRlZF9hc3NlcnRpb25zg6JjdXJseC1zZWxmI2p1bWJmPWMycGEuYXNzZXJ0aW9ucy9jMnBhLmluZ3JlZGllbnQudjNkaGFzaFggPvjuWaMW+6sn03uwvntI+vDQubK40muv/fKvHWXrjOSiY3VybHgqc2VsZiNqdW1iZj1jMnBhLmFzc2VydGlvbnMvYzJwYS5hY3Rpb25zLnYyZGhhc2hYIOKgaCjzGPaibVL70eXPUR4MmVTcj6FGzhA3CsQmFqhHomN1cmx4KXNlbGYjanVtYmY9YzJwYS5hc3NlcnRpb25zL2MycGEuaGFzaC5kYXRhZGhhc2hYIBeBRpI8WZSUowHEZEmPwfoEBQo22bLFO0pHgLV3CY6tdGNsYWltX2dlbmVyYXRvcl9pbmZvo2RuYW1lb0FudGhyb3BpYyBGaWxlc2d2ZXJzaW9uZTEuMC4wa3NwZWNWZXJzaW9uZTIuNC4wAAAQOGp1bWIAAAAoanVtZGMyY3MAEQAQgAAAqgA4m3EDYzJwYS5zaWduYXR1cmUAAAAQCGNib3LShFkCEqIBJhghWQIKMIICBjCCAY2gAwIBAgIUQOWgCu7COdC+uIP6BkIFPWdVEwAwCgYIKoZIzj0EAwMwSTEXMBUGA1UEChMOQW50aHJvcGljLCBQQkMxLjAsBgNVBAMTJUFudGhyb3BpYyBDb250ZW50IENyZWRlbnRpYWxzIFJvb3QgQ0EwHhcNMjYwODA3MTg0MzU2WhcNMjgwODA2MTk0MzU2WjBEMRcwFQYDVQQKEw5BbnRocm9waWMsIFBCQzEpMCcGA1UEAxMgQW50aHJvcGljIENsYXVkZSBDb250ZW50IFNpZ25pbmcwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASYegpry1AYBRTVNL1CpTlbROnY3dey+UrsF9C3phYrATN3ZHf93Mo8RQN0KOUuOn19P4oWNFWe5n2/She9N7eTo1gwVjAOBgNVHQ8BAf8EBAMCB4AwFQYDVR0lBA4wDAYKKwYBBAGD6F4CATAMBgNVHRMBAf8EAjAAMB8GA1UdIwQYMBaAFM5R4gSBTmRbI/jjxM+aPpzB11zCMAoGCCqGSM49BAMDA2cAMGQCMDFzHRSeAXrSy1WOzkbhPZ6Km2wGTmZ/2gK18k8BQGXyqz88Rdrz6CTX9flAnYNVxgIwcF9c3fVhqmJKpi+UhasNUMko69cyX6STPfta3Q8EjyzDjzoyrol46FP6VFHhvUcJoWNwYWRZDZ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2WEBxiP1N6snCsdXYKXsH9ZDcMH/6kz/L9pn4TVGuFxWW66GFL7O2jEZT9cv074n2alUwe5N8TnkRGXiyOVPF4v86RclvlQAAC9tJREFUeJztm3mQVNUVxn/3vduvp7dZVbCQCAYihjCCMFFcURFwFCIhCTExMTFmUypJlYZCy1gxMSYEk5iKiLGymKQ0i4pISELEuFMyDqDC4AJuiJk4awvd0z3Tb8sfb+6jJ06v05OhKvmqKLrndd97znfPPfecc0+LcQ3Hu/wPQxtrAcYa/ydgrAUYa8ixmlgIMeS9646NK/qvEKBpGkIIhBA4joPjOFiW5SstEOhSR9M0NM0jxnFcHMcZddlGjQBPGQ3btkmlUgwMDOC6LoYRJBSqoqamGim96W3HIXEoQV+f9zmAYNAgFAohpfRJGw1UnAC12qlUilQqTTQa4YPTT2LOnFM4eWYjU6aewPhjx1NfX0cgEADAtm3ivXE6Ojp57dXX2bWrje2tO3npxZfp6uqmqipIJBJBCIFt2xWVV1QqDhBCoGkaiUQSy7KY0TidxUsu4sLmBcyc1Yiu6yWPuaftJR7++xYe2rCJHdufw3WhpqYa163c9qgIAVJK0ul+Un19nHXOGXz16i/RfNFCgsGg/xnbtnFdEALfH2TDdd3Bf95nsglzHId/PPI4d669i82bH8EwAkQiESzLGqnoIyNACIGu6/T09DJp0vtYdf21fPZzn/aVsywbTRPDKlwMvL3vIuVhMh7asImbb/oBu3e30dBQj+O4IzpByiZA0zRc1yXeG+fSy5az+oc3c8y4o33zVL6gUrBt299myWQfN914M3esvYtIJEIgECjbN5RFgK5rZDImlmXx/dXf5StXXQl4K569WqMB27b97XH/fQ/ytauvIZ1OE4mEsazSSSiZAF3X6O8fIBgM8su77+TC5gXYtl3xFc8H13WxbRspJa3P7uCySz9PxzudRGIR7BJJKIkATdMwTZNAIMADG37P3NNP9d+PBSzTQgYke/e+ypLmZXR0dBIOh0vaDkXnAkIIXNfFNE1+/du7xlx5ABmQWKbFBz4whT/c9ztCoRCmaZZkiUUToOs6vb1x1vzoFhYumj/myivIgMSyLGbOauQXv7qDvr4UQqswAVJKenp6+fRln+SLX74Cy7Iqorxt20NygnIhpWcJzRcv4ppvfp2e7l4/zC6Egj5ACIFpmhx1VANbWx6jvq4OFxdNO7IyaXX82rbNeWcvoq3tRcLhcMGIsaAWuq6RTCS58abraWioxx4840cqrGVZ3Hrrj7jhhm+RTqf9SLBcqH1vGAa3rP5O0adBXgtQQcdpc5vYvGUjuKDpI1NeneObNm1i8eLFAKxdewdXXfVVLMsq2nQLjX/5ZV/kvj+tp66uNu+pkFcbIQSWafK1b1yNpmk4Za5Qdv6vVrmnpxdN15FSp6enp6xx8+Eb16wgaBg4bplbQNM0UqkUjSd/iAULz8d13bKjPE3TkFIOOZ6klDi2Mxg9Hl51tT3KzfZ0XcdxHGbNOpmz551J8lAybyaan4C+FB9ZuhjDMLDt0gVSSrz88sus/sFq2tvbff+Rvd+zXwshkFIO5holTzlk3o8vX1YwLshJgG3bRGNRmi9e5AtWClzXRQhBf7qf5Z+4lFXXreILV1yZ9ztCCA4ePMiaNWvYtq0FIcqrFaoVnz//XMYfO45MJpNT/mEJ0DSNdDrNSSedyIwZ0wcHLc75Ze9zIQTpdJru7m6klLS3tw9v2u5hwa+9diUrV65k6SUfpaOjc8iYxW4LVXscf+w45jTNJtWXynly5SBA0N8/wJym2V5dr8gjRa26CpuVMFLKooOn/fv3I6UkmUwSj8d9ZVQqXCwJjuPgunDa3A9jWlZpFuB62jBzVuPh90VACME773QQj8eHMK7IKMacDcPAsix0XfdNWdd1+vr6OHDg7aJjEG8hYObMRgIBmfM0GJ4Ax8UIGrx/ygmDg+WfTK1Ky7YWpk//EHNmN7Fv3z7vWYFj6D1zZ5Glxu3q7OLceeczbdo0Nm78M0DBjE+t+PGTjycajeLkcOLDEuA4DqFQiHHjxw0ZLBeUoH/bvJne3m5ef+M1nn5665Bn5cAd/O4Lu3bRur2FVKqPB9c/6D0rYE1K5oaGBqqrY1g5tsF7CFCl51gsSl1d7ZDBCiEYDA6anlbRTFFKiRGoQghBKBQq6jtK5urqqB8NDqfHsHGn67oEAgEMwyhJ0OwToJJXXWo7lFMOl1JiGEZOeXJ6lJEmJ0cS8ukxrAWoo6fUSuvh8nd5ZfDC41JyJmrbTk7zh2EswHVddF3n0KEE8fi7/t+Kgbr/c12HTCZTkqD5YJompmUiBKRS6aK+o2ROJDw9dF0fVo+8kWBXZ9eQwXJBsXvG6aeja5LamnpOOWXW4LPy02dV2po27UQmT56M68K5580bMmcuKJl7e+McOpTIScDwW0ATDAxkeP21N5h7+qkFkxI1+AULLmDnczsJhUJMnTrFe1aiySrFvMjPC4QmTpzIU089QXv7v2hqmuPPmQ9K2bf2HyCRSBCLxYZ1oMNKJ/CEeOGF3YPvixPcdV0aG2cwdeqUIZNlK1UIqiiiav/gBT0TJkygqWlO0dtROfHdu9rIZMycvmNYC3Ach6BhsP3ZHUDxVSDlPNVrJYjjOEgpi3KqtbW1ftASi0a9+QdzAOWfioG6qNn2TAsyh/lDHgJC4RB79rzEK6/s48QTp/r3fcVMDIdXIBgMEgwGsSyLaDQ6/Bji8Lxr1vyQhoZ6FixYwITjJpR1z+i6XtG2tzdO67M7CEdyF0dzFuCklHR1drH5rw+XRICv06A1hCNh7r77V9xz7z2sWLEiryKO4zBx4nGsXXu7/7dyCrC27aDrGo8/9iQHDrxNfUN9zow25+iO41AVqmLD+o3YjlNWg4MS/syzzmTdunVMnz7d3wbZRGS/ViWxkXSCqCv5+/+03nOkedxGXgKi0QitrTt46omtI2pPUUXRbDNU1Vtd14eMq+oH5RCu5hJCsPeVfWx5+FFisWj5VWFvcwp+9tM7yhLGn2SwKJptzt4lprfS4SITnGKgijK3/+xOkslkwUJuwZshXdeJx9/lgQfv5cKLFg65ny9XQIB0Os11q64nHo9z220/oa6+zhNoBCG0ku3553Zx3jmLCAaDhYO4QgSoqPD9U07gya1bqApWIbTKxvqVgOuC49hous7Fi5by5BNPU11dXXDbFnSxjuMQiURo27WHb9/4PTS9+BphfoG9QMdrnhp51mnbXhnt9p+u45Etj1FTU1OUzyq6QcLbCnHu/eNvuGTpYr854UiAih5btrWy6IIlVFVVFU1q0QSoU0DXdTb9bT2z58yqyF3eSKH6kt588y0Wnn8x3d09BIPBogsnRUcZqkrU39/Pp5Zfzt69r/r38mMFbwF0urq6+eTHP0N7+zuEQlUlVY1KCrNs2yYcCdPR0cmS5mXs3PG836Hx364eKet74/U3WdK8jLbde6ipqcYyS/NPJceZtmUTiUbo6OhkcfMyNj70F//is9J9vMPhcPOkZOvTz3Dhgo/Q1vail0SZVnGpaxbKqlbYlk04HMY0TT61/HJuuP4mBgYGBqO60ensViU61VJ/249vZ0nzMjo7uwdXvnTlYQS/GFEOsbq6mltX/4T585p5ZMuj6Lrmd5GO9IhTY6hETNd1nm3ZzkWLlrJq5Q0EDIOqqqDXIFlmWFKxZulEIonrOFyybAlXr/gyp57W5D9XZvufjdLZNQP1v2qY1jQxJHRu272Hn6/7Jffe80cymYx/zo/U91SsXV4Je/DgQQzD4Kyzz2DZxy7hvPnzmDjxuLLG7Ozo4onHn+KB+zfw6D8eJ5FIUltb4/8QoxKoGAEKqkMjmUximhbjxx/DKbNncdrcD3PyzBlMmjyJo48+ilgsRkBKEN52SiSS9HT3sP/Nt9i1u42WZ1rZ3rqTt9/+J5qmEYtF0aVekSg0GxUnQEHXvSpOJmOSSqUwTYtAQBKNRqmujlFbV4uR/YuR+LscOpQgkUhgZkx0qRMOh/3bqdE6YUaNAH+CwXt9VTT1miNtbDs7dhBIqfv1AeVEVR1wNDHqcWx2dVchEJAYRuA9nwPlMEf/12IKYxLIH0n3jkdWv+sY4P8EjLUAY41/A6QVDfWqMSl7AAAAAElFTkSuQmCC';

function log(m) {
  try {
    const f = path.join(app.getPath('userData'), 'andify-log.txt');
    try { if (fs.statSync(f).size > 60000) fs.unlinkSync(f); } catch (e) {}
    fs.appendFileSync(f, new Date().toISOString() + '  ' + m + '\n');
  } catch (e) {}
}

let ventana = null;
let colorBarra = '';
const CON_BARRA = process.platform === 'win32';   // la barra propia es solo para Windows
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
  try { ventana.setTitleBarOverlay({ color: r.c, symbolColor: simbolo, height: barra.ALTO }); } catch (e) {}
  try { ventana.setBackgroundColor(r.c); } catch (e) {}
  guardar({ tb: r.c, ts: simbolo });
}

function crearBandeja() {
  // El icono se busca en varios lugares, del mas seguro al menos seguro. Los archivos de
  // "recursos" quedan fuera del paquete comprimido, que es donde Windows los lee sin problemas.
  // Si ninguno sirve, el icono sale de los datos que viajan dentro de este archivo.
  const rec = process.resourcesPath || '';
  const cand = [];
  if (process.platform === 'win32') {
    cand.push(['recursos icon.ico', path.join(rec, 'icon.ico')]);
    cand.push(['build icon.ico', path.join(__dirname, 'build', 'icon.ico')]);
  }
  cand.push(['recursos tray.png', path.join(rec, 'tray.png')]);
  cand.push(['build tray.png', path.join(__dirname, 'build', 'tray.png')]);
  cand.push(['build icon.png', path.join(__dirname, 'build', 'icon.png')]);
  let img = null, fuente = '', esIco = false;
  for (const [nombre, f] of cand) {
    try {
      if (!fs.existsSync(f)) { log('icono: no existe ' + nombre); continue; }
      const im = nativeImage.createFromPath(f);
      if (!im.isEmpty()) { img = im; fuente = nombre; esIco = /\.ico$/i.test(f); break; }
      log('icono: vacio ' + nombre);
    } catch (e) { log('icono: error en ' + nombre + ': ' + e.message); }
  }
  if (!img) { img = nativeImage.createFromDataURL('data:image/png;base64,' + ICONO_BANDEJA); fuente = 'datos embebidos'; esIco = false; }
  if (!esIco) img = img.resize(process.platform === 'darwin' ? { width: 18, height: 18 } : { width: 32, height: 32 });
  try { const t = img.getSize(); log('icono de la bandeja: ' + fuente + ' (' + t.width + 'x' + t.height + ')'); } catch (e) {}
  bandeja = new Tray(img);
  bandeja.setToolTip('Andify ' + app.getVersion());
  bandeja.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Andify', click: mostrar },
    { type: 'separator' },
    { label: 'Play / Pause', click: () => js("typeof toggle==='function'&&toggle()") },
    { label: 'Next', click: () => js("typeof next==='function'&&next(false)") },
    { label: 'Previous', click: () => js("typeof prev==='function'&&prev()") },
    { type: 'separator' },
    { label: 'Closing the window keeps Andify in the tray', type: 'checkbox', checked: enBandeja(),
      click: i => guardar({ bandeja: i.checked }) },
    { type: 'separator' },
    { label: 'Quit Andify', click: () => { saliendo = true; app.quit(); } }
  ]));
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
    ...(CON_BARRA ? {
      titleBarStyle: 'hidden',
      titleBarOverlay: { color: est.tb || '#17131f', symbolColor: est.ts || '#ffffff', height: barra.ALTO }
    } : {}),
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
      await js(barra.iniciar(ICONO_BANDEJA));
      colorBarra = '';
      await refrescarBarra();
    });
    setInterval(refrescarBarra, 1500);
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

app.on('second-instance', mostrar);
app.on('activate', mostrar);   // Mac: un clic en el Dock vuelve a abrir la ventana
app.on('before-quit', () => { saliendo = true; });

app.whenReady().then(() => {
  log('Andify ' + app.getVersion() + ' arrancando en ' + process.platform);
  if (process.platform === 'darwin') {
    // en Mac los atajos de copiar y pegar y Cmd+Q salen de este menu
    Menu.setApplicationMenu(Menu.buildFromTemplate([{ role: 'appMenu' }, { role: 'editMenu' }, { role: 'windowMenu' }]));
  } else {
    Menu.setApplicationMenu(null);
  }
  crear();
  try { crearBandeja(); } catch (e) { bandeja = null; log('bandeja: error ' + e.message); }
});

app.on('window-all-closed', () => app.quit());
