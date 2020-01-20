const functions = require('firebase-functions');
const admin = require('firebase-admin');
var rp = require('request-promise');
admin.initializeApp();

const firestoreRef = admin.firestore();

exports.validaMed = functions.https.onCall( async (data, context) => {
	if (!(context.auth && context.auth.token)) {
	  throw new functions.https.HttpsError(
	    'permission-denied'
	  );
	}
  	const rut = data.rut;
	const dataString = functions.config().supersalud.key;
	const url = `https://api.superdesalud.gob.cl/prestadores/v1/prestadores/${rut}.json/?auth_key=${dataString}`;
	var options = {
		url: url,
		json: true
	};
  var res = await rp(options)
	.then(async resultado =>{
		await firestoreRef.collection('MEDICOS').doc(data.uid).collection('DATOS').doc('CREDENCIALES').set({
			medico: resultado.prestador
		}, {merge: true});
		await firestoreRef.collection('MEDICOS').doc(data.uid).collection('DATOS').doc('LOGIN').set({
			medico: resultado.prestador.codigoBusqueda == 'Médico Cirujano',
			nombreMed: `${resultado.prestador.nombres} ${resultado.prestador.apellidoPaterno} ${resultado.prestador.apellidoMaterno}`
		}, {merge: true});
    	return resultado;
	});
  return res;
});

const puppeteer = require('puppeteer');
const opts = {
  memory: '2GB', 
  timeoutSeconds: 180
};

async function run(datos){
	const browser = await puppeteer.launch({
	    args: ['--no-sandbox']
	  });

	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(0);
	await page.goto('https://portal.sidiv.registrocivil.cl/usuarios-portal/pages/DocumentRequestStatus.xhtml');

	// dom element selectors
	const USERNAME_SELECTOR = '#form\\:run';
	const SERIAL_SELECTOR = '#form\\:docNumber';
	const BUTTON_SELECTOR = '#volverTable > tbody > tr > td > a';
	const TYPE_SELECTOR = '#form\\:selectDocType';
	const CAPT_SELECTOR = '#form\\:inputCaptcha';
	const RESULT_SELECTOR = '#tableResult > tbody > tr > td.setWidthOfSecondColumn';
	const ERROR_SELECTOR = '#zoneErreur';
	//selector captcha,guarda imagen  
	const [el] = await page.$x('//*[@id="form:captchaPanel"]/img');
	const imgCaptcha = await el.screenshot({encoding: 'base64'});
	await firestoreRef.collection('MEDICOS').doc(datos.uid).collection('DATOS').doc('LOGIN').set({
		captcha: imgCaptcha,
		rut: datos.rut,
		serie: datos.serie
	}, {merge: true});
	const delay = ms => new Promise(res => setTimeout(res, ms));
	await delay(25000);

	const txtCaptcha = await firestoreRef.collection('MEDICOS').doc(datos.uid).collection('DATOS').doc('LOGIN').get()
	.then(async r => {
		return await r.data().txtCaptcha;
	});
	
	await page.click(USERNAME_SELECTOR);
	await page.type(USERNAME_SELECTOR, datos.rut);

	await page.click(SERIAL_SELECTOR);
	await page.type(SERIAL_SELECTOR, datos.serie);

	await page.click(CAPT_SELECTOR);
	await page.type(CAPT_SELECTOR, txtCaptcha);

	await page.click(TYPE_SELECTOR);
	await page.select(TYPE_SELECTOR, 'CEDULA');

	let obj = null;

	const navigationPromise = page.waitForNavigation();
	await page.click(BUTTON_SELECTOR); // Clicking the link will indirectly cause a navigation
	await navigationPromise; // The navigationPromise resolves after navigation has finished
	let result = await page.evaluate((sel) => {
	  let element = document.querySelector(sel);
	  return element? element.innerHTML: null;
	}, RESULT_SELECTOR);
	try {
		if(result == "Vigente" || result == "No Vigente"){
			obj = {
			  status: (result == "Vigente" ? true : false),
			  message: result
			};
		} else {
			throw new Error('Datos erróneos o cédula bloqueada');
		}		
	} catch(e){
		obj = {
		  status: 'ERROR',
		  message: e.message
		};
	}
	

	await browser.close();

	return obj;
}

exports.validaSerie = functions.runWith(opts).https.onCall( async (datos, context) => {
	if (!(context.auth && context.auth.token)) {
	  throw new functions.https.HttpsError(
	    'permission-denied'
	  );
	}
	let data = await run(datos);
	let resFirest = await firestoreRef.collection('MEDICOS').doc(datos.uid).collection('DATOS').doc('LOGIN').set({
		txtCaptcha: firestoreRef.FieldValue.delete(),
		ciVigente: data.status
	}, {merge: true});
	let resFirestCred = await firestoreRef.collection('MEDICOS').doc(datos.uid).collection('DATOS').doc('CREDENCIALES').set({
		ciVigente: data.status
	}, {merge: true});
	return data;
});