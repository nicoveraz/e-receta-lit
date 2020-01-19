const functions = require('firebase-functions');
const admin = require('firebase-admin');
var rp = require('request-promise');
admin.initializeApp();

exports.validaMed = functions.https.onCall( async (data) => {
  const rut = data.rut;
	const dataString = functions.config().supersalud.key;
	const url = 'https://api.superdesalud.gob.cl/prestadores/v1/prestadores/' + rut + '.json' + '/?auth_key=' + dataString;
	var options = {
		url: url,
		json: true
	};
  var res = await rp(options)
	.then(resultado =>{
    return resultado;
	});
  return res;
});

const puppeteer = require('puppeteer');
const opts = {
  memory: '2GB', 
  timeoutSeconds: 60
};

async function run(datos){
  const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    });

  const page = await browser.newPage();

  await page.goto('https://portal.sidiv.registrocivil.cl/usuarios-portal/pages/DocumentRequestStatus.xhtml');

  // dom element selectors
  const USERNAME_SELECTOR = '#form\\:run';
  const SERIAL_SELECTOR = '#form\\:docNumber';
  const BUTTON_SELECTOR = '#volverTable > tbody > tr > td > a';
  const TYPE_SELECTOR = '#form\\:selectDocType';
  const RESULT_SELECTOR = '#tableResult > tbody > tr > td.setWidthOfSecondColumn';
  const ERROR_SELECTOR = '#zoneErreur';

  await page.click(USERNAME_SELECTOR);
  await page.type(USERNAME_SELECTOR, datos.rut);

  await page.click(SERIAL_SELECTOR);
  await page.type(SERIAL_SELECTOR, datos.serie);

  await page.click(TYPE_SELECTOR);
  await page.select(TYPE_SELECTOR, 'CEDULA');

  let obj = null;
  try {
      await page.click(BUTTON_SELECTOR);
      await page
      .waitFor(ERROR_SELECTOR, {visible: true, timeout:1000})
      .then(() => {

        obj = {
          status: false,
          message: 'Serial incompatible'
        };
      });
    }
    catch (e)
    {
      const navigationPromise = page.waitForNavigation();
      await page.click(BUTTON_SELECTOR); // Clicking the link will indirectly cause a navigation
      await navigationPromise; // The navigationPromise resolves after navigation has finished
      let result = await page.evaluate((sel) => {
        let element = document.querySelector(sel);
        return element? element.innerHTML: null;
      }, RESULT_SELECTOR);

      obj = {
        status: (result == "Vigente" ? true : false),
        message: result
      };
    }

  await browser.close();

  return obj;
}

exports.validaSerie = functions.runWith(opts).https.onCall( async (datos) => {
  let data = run(datos);
  return data;
});