/*
 * Mac: se firma la app "ad-hoc" (sin certificado de Apple) apenas se arma.
 * Sin esta firma, las Mac con chip Apple (M1, M2, M3...) dicen que la app esta danada.
 * Con ella, solo piden la confirmacion habitual de "desarrollador no identificado".
 */
const { execFileSync } = require('child_process');
const path = require('path');

exports.default = async function (context) {
  if (context.electronPlatformName !== 'darwin') return;
  const app = path.join(context.appOutDir, context.packager.appInfo.productFilename + '.app');
  try {
    execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
    console.log('Firma ad-hoc aplicada a ' + app);
  } catch (e) {
    console.warn('No se pudo aplicar la firma ad-hoc:', e.message);
  }
};
