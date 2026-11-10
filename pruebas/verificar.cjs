// Requiere Playwright solo para las pruebas: npm install --no-save playwright
// Servidor iniciado: node servidor.cjs. Luego: node pruebas/verificar.cjs
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
    const page = await context.newPage();
    const errores = [];
    page.on('pageerror', error => errores.push(error.message));
    await page.goto('http://127.0.0.1:8080');
    await page.waitForFunction(() => [...document.querySelectorAll('.status')].every(el => el.textContent.startsWith('Listo')), { timeout: 120000 });
    assert.equal(await page.locator('img:visible').count(), 2);
    assert.equal(await page.locator('img').evaluateAll(imgs => imgs.every(img => img.naturalWidth > 0)), true);
    await page.screenshot({ path: path.join(__dirname, '../capturas/01-funcionamiento.png'), fullPage: true });
    const citaAntes = await page.locator('#cita-texto').textContent();
    const gatoAntes = await page.locator('#gato-imagen').getAttribute('src');
    // Error HTTP controlado y retardo para observar el estado de carga.
    await page.route('https://uselessfacts.jsph.pl/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 700));
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
    });
    await page.locator('#dato button').click();
    await page.waitForFunction(() => document.querySelector('#dato button').disabled);
    assert.equal(await page.locator('#dato .status').textContent(), 'Cargando…');
    assert.equal(await page.locator('#cita button').isEnabled(), true);
    await page.waitForSelector('#dato .status.error');
    assert.equal(await page.locator('#dato button').isEnabled(), true);
    assert.equal(await page.locator('#cita-texto').textContent(), citaAntes);
    assert.equal(await page.locator('#gato-imagen').getAttribute('src'), gatoAntes);
    await page.screenshot({ path: path.join(__dirname, '../capturas/02-error-controlado.png'), fullPage: true });
    await page.unroute('https://uselessfacts.jsph.pl/**');
    await page.locator('#dato button').click();
    await page.waitForFunction(() => document.querySelector('#dato .status').textContent.startsWith('Listo'), { timeout: 45000 });
    // Fallo de imagen manteniendo real el JSON de Dog CEO.
    await page.route('https://images.dog.ceo/**', route => route.abort());
    await page.locator('#perro button').click();
    await page.waitForSelector('#perro .status.error', { timeout: 45000 });
    assert.equal(await page.locator('#perro button').isEnabled(), true);
    assert.equal(await page.locator('#perro-imagen').isHidden(), true);
    await page.unroute('https://images.dog.ceo/**');
    await page.locator('#perro button').click();
    await page.waitForFunction(() => document.querySelector('#perro .status').textContent.startsWith('Listo'), { timeout: 45000 });
    // Red desconectada: mensaje y reintento con la misma página.
    await context.setOffline(true);
    await page.locator('#cita button').click();
    await page.waitForSelector('#cita .status.error');
    assert.equal(await page.locator('#cita button').isEnabled(), true);
    await context.setOffline(false);
    await page.locator('#cita button').click();
    await page.waitForFunction(() => document.querySelector('#cita .status').textContent.startsWith('Listo'), { timeout: 45000 });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: path.join(__dirname, '../capturas/03-vista-movil.png'), fullPage: true });
    assert.deepEqual(errores, []);
    console.log('OK: cuatro APIs reales, imágenes, carga, independencia, HTTP 503, reintento, imagen fallida, offline y vista móvil. Sin errores JavaScript.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
