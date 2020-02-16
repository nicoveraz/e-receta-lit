const functions = require('firebase-functions');
const admin = require('firebase-admin');
const rp = require('request-promise');
var pgp = require('openpgp');
const puppeteer = require('puppeteer');
const crypto = require('crypto');


const opts = {
  memory: '2GB', 
  timeoutSeconds: 180
};

admin.initializeApp();

const firestoreRef = admin.firestore();

exports.validaMed = functions.https.onCall( async (data, context) => {
	if (!(context.auth && context.auth.token)) {
	  throw new functions.https.HttpsError(
	    'permission-denied'
	  );
	}
	if(data.uid != context.auth.uid){
		throw new functions.https.HttpsError(
		  'wrong-user'
		);
	}
	const buscaRut = await firestoreRef.collection('CUENTASMED').doc(data.rut).get()
	.then(r => {
		if(r.exists){
			throw new functions.https.HttpsError(
			 	'existing-user'
			);
		}
	});
  	const rut = data.rut.substring(0, data.rut.indexOf('-'));
	const dataString = functions.config().supersalud.key;
	const url = `https://api.superdesalud.gob.cl/prestadores/v1/prestadores/${rut}.json/?auth_key=${dataString}`;
	var options = {
		url: url,
		json: true
	};

  var res = await rp(options)
	.then(async resultado =>{
		if(resultado.prestador.codigoBusqueda == 'Médico Cirujano'){
			let cred = await admin.auth().getUser(context.auth.uid)
			.then(async r => {
				const claims = await r.customClaims;
				claims.medicoQx = (resultado.prestador.codigoBusqueda === 'Médico Cirujano');
				admin.auth().setCustomUserClaims(context.auth.uid, claims);
			});
			await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('CREDENCIALES').set({
				medico: resultado.prestador
			}, {merge: true});
			await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('LOGIN').set({
				medico: resultado.prestador.codigoBusqueda == 'Médico Cirujano',
				nombreMed: `${resultado.prestador.nombres} ${resultado.prestador.apellidoPaterno} ${resultado.prestador.apellidoMaterno}`
			}, {merge: true});
			let puK = await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('PUBKEY').set({
				rut: data.rut,
				nombreMed: `${resultado.prestador.nombres} ${resultado.prestador.apellidoPaterno} ${resultado.prestador.apellidoMaterno}`
			}, {merge: true});
			let rutMed = await firestoreRef.collection('CUENTASMED').doc(data.rut).set({
				rut: data.rut,
				email: context.auth.token.email,
				nombreEmail: context.auth.token.name,
				nombreMed: `${resultado.prestador.nombres} ${resultado.prestador.apellidoPaterno} ${resultado.prestador.apellidoMaterno}`
			}, {merge: true});
		}		
    	return resultado;
	});
  return res;
});


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

	const captcha = async (n) => {
		console.log(n);
		if(n === 1){
			throw new Error('CAPTCHA equivocado');
		}
		return firestoreRef.collection('MEDICOS').doc(datos.uid).collection('DATOS').doc('LOGIN').get()
			.then(async r => {
				if(r.data().txtCaptcha){
					return r.data().txtCaptcha;
				} else {
					await delay(1000);
					return captcha(n - 1);
				}
			})
			.catch(e => {
				return e;
			});
	};

	let txtCaptcha = await captcha(45);

	
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
	txtCaptcha = null;
	obj = {
	  status: (result === "Vigente" ? true : false),
	  message: result
	};

	await browser.close();

	return obj;
}

exports.validaSerie = functions.runWith(opts).https.onCall( async (datos, context) => {
	if (!(context.auth && context.auth.token)) {
	  throw new functions.https.HttpsError(
	    'permission-denied'
	  );
	}
	const intentos = await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('LOGIN').get()
	.then(async d =>{
		if(d.data()){
			if(d.data().intento >= 3){
				return await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('LOGIN').update({
					captcha: admin.firestore.FieldValue.delete(),
					rut: admin.firestore.FieldValue.delete(),
					serie: admin.firestore.FieldValue.delete(),
					txtCaptcha: admin.firestore.FieldValue.delete(),
					intento: admin.firestore.FieldValue.increment(1)
				}).then(() => {
					return 'Error: demasiados intentos';
				});
			} else {
				let data = await run(datos);
				if(data.message){					
					let cred = await admin.auth().getUser(context.auth.uid)
					.then(async r => {
						const claims = await r.customClaims;
						claims.ciVigente = (data.message === 'Vigente');
						admin.auth().setCustomUserClaims(context.auth.uid, claims);
					}).then(async () => {
						let resFirest = await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('LOGIN').set({
							ciVigente: data.status,
							txtCaptcha: admin.firestore.FieldValue.delete()
						}, {merge: true});
						let resFirestCred = await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('CREDENCIALES').set({
							ciVigente: data.status
						}, {merge: true});
					});				
				} else {
					await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('LOGIN').update({
						captcha: admin.firestore.FieldValue.delete(),
						rut: admin.firestore.FieldValue.delete(),
						serie: admin.firestore.FieldValue.delete(),
						txtCaptcha: admin.firestore.FieldValue.delete(),
						intento: admin.firestore.FieldValue.increment(1)
					});
					return 'Error al validar Cédula';
				}
				
				return data;
			}
		} else {
			let data = await run(datos);
			if(data.message){
				let cred = await admin.auth().getUser(context.auth.uid)
				.then(async r => {
					const claims = await r.customClaims;
					claims.ciVigente = (data.message === 'Vigente');
					admin.auth().setCustomUserClaims(context.auth.uid, claims);
				}).then(async () => {
					let resFirest = await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('LOGIN').set({
						ciVigente: data.status,
						txtCaptcha: admin.firestore.FieldValue.delete()
					}, {merge: true});
					let resFirestCred = await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('CREDENCIALES').set({
						ciVigente: data.status
					}, {merge: true});
				});				
			} else {
				await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('LOGIN').update({
					captcha: admin.firestore.FieldValue.delete(),
					rut: admin.firestore.FieldValue.delete(),
					serie: admin.firestore.FieldValue.delete(),
					txtCaptcha: admin.firestore.FieldValue.delete(),
					intento: admin.firestore.FieldValue.increment(1)
				});
				return 'Error al validar Cédula';
			}
			
			return data;
		}
	});
	return intentos;
});

exports.creaFirma = functions.https.onCall(async (datos, context) => {
	if (!(context.auth && context.auth.token)) {
	  throw new functions.https.HttpsError(
	    'permission-denied'
	  );
	}
	if(datos.user != context.auth.uid){
		throw new functions.https.HttpsError(
		  'wrong-user'
		);
	}
	return await admin.auth().getUser(context.auth.uid).then(async (userRecord) => {
		console.log(userRecord.customClaims);
		if(!!userRecord.customClaims.medicoQx && !!userRecord.customClaims.ciVigente){
			const optionsKey = {
	            userIds: [{ id: context.auth.uid }],
	            curve: "curve25519",
	            passphrase: datos.passphrase
	        };

	        let privkey = null;
	        let pubkey = null;
	        let revocationCertificate = null;

	        return pgp.generateKey(optionsKey).then(async (key) => {
	          privkey = key.privateKeyArmored;
	          pubkey = key.publicKeyArmored;
	          revocationCertificate = key.revocationCertificate;
	        })
	        .then(async () => {
	        	let prK = await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('CREDENCIALES').set({
	        		fechaClave: admin.firestore.FieldValue.serverTimestamp(),
	        		clavePrivada: privkey,
	        		clavePublica: pubkey
	        	}, {merge: true});
	        	let puK = await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('PUBKEY').set({
	        		fechaClave: admin.firestore.FieldValue.serverTimestamp(),
	        		clavePublica: true
	        	}, {merge: true});
	        	return 'CLAVES OK';
	        })
	        .catch(function(e){
	          console.log(e);
	          return e;
	        });
		} else {
			return 'CREDENCIALES INCOMPLETAS';
		}
	});
});

async function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1>>>16, 2246822507) ^ Math.imul(h2 ^ h2>>>13, 3266489909);
    h2 = Math.imul(h2 ^ h2>>>16, 2246822507) ^ Math.imul(h1 ^ h1>>>13, 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
}

async function registraReceta(u, rp, rut, id){
	let recetas = await firestoreRef.collection('MEDICOS').doc(u).collection('RECETAS');
	const idPte = await cyrb53(rut);
	return recetas.add({
		u: u,
		rp: rp,
		idPte: idPte,
		id: id
	});
}

exports.creaReceta = functions.https.onCall(async (datos, context) => {
	if (!(context.auth && context.auth.token)) {
	  throw new functions.https.HttpsError(
	    'permission-denied'
	  );
	}
	if(datos.user != context.auth.uid){
		throw new functions.https.HttpsError(
		  'wrong-user'
		);
	}
	const data = datos;
	return await admin.auth().getUser(context.auth.uid).then(async (userRecord) => {
		if(!!userRecord.customClaims.medicoQx && !!userRecord.customClaims.ciVigente){
			let qrFirmado, qrData;

			const pass = data.pass;
			const receta = data.receta; 

			if(!receta.nombrePte || !receta.rutPte || !receta.rpPte){
				return 'DATOS INCOMPLETOS';
			}

			let firma = await firestoreRef.collection('MEDICOS').doc(context.auth.uid).collection('DATOS').doc('CREDENCIALES').get()
			.then(async r => {
				return await r.data().clavePrivada;
			});

			let apkey = await firestoreRef.collection('APP').doc('CRED').get()
			.then(async r => {
				const pubK = await r.data().clavePublica;
				const pubKR = await pgp.key.readArmored(pubK);
				return pubKR.keys;
			}).catch(e => console.log('ERROR apkey: ', e));

			let privKeyObj = (await pgp.key.readArmored(firma)).keys[0];
			await privKeyObj.decrypt(pass);

			const idReceta = await crypto.randomBytes(20).toString('hex');

			const optionsSign = {
			    message: pgp.cleartext.fromText(JSON.stringify({i: idReceta, u: context.auth.uid, n: receta.nombrePte, e: receta.edadPte, d: receta.direccionPte, r: receta.rutPte, f: new Date().toLocaleDateString(), rp: receta.rpPte})),
			    privateKeys: [privKeyObj]
			};			

			let mjeFirmado = await pgp.sign(optionsSign).then(async signed => {
			    return await signed.data;	    
			}).catch(e => {
				console.log(e);
				return e;
			});
			const options = {
			    message: pgp.message.fromText(`${context.auth.uid}${mjeFirmado}`),
			    publicKeys: apkey
			};
			return pgp.encrypt(options).then(async ciphertext => {
			    qrData = await ciphertext.data; 
			    registraReceta(context.auth.uid, receta.rpPte, receta.rutPte, idReceta);
			    return {qr: qrData, id: idReceta};
			});
		} else {
			return 'CREDENCIALES INCOMPLETAS';
		}
	});
});

exports.procesaQR = functions.https.onCall(async (datos, context) => {
	if (!(context.auth && context.auth.token)) {
	  throw new functions.https.HttpsError(
	    'permission-denied'
	  );
	}
	if(datos.user != context.auth.uid){
		throw new functions.https.HttpsError(
		  'wrong-user'
		);
	}
	return await admin.auth().getUser(context.auth.uid).then(async (userRecord) => {
		if(!!userRecord.customClaims.medicoQx || !!userRecord.customClaims.farmacia){
			const msg = datos.qr.text;
			//const firma = functions.config().priv.key;
			let firma = await firestoreRef.collection('APP').doc('CRED').get()
			.then(async r => {
				return await r.data().clavePrivada;
			});

			let pPh = await firestoreRef.collection('APP').doc('CRED').get()
			.then(async r => {
				return await r.data().passPhrase;
			});

			let prKObj = (await pgp.key.readArmored(firma)).keys[0];
			await prKObj.decrypt(pPh);

			const options = { 
				message: (await pgp.message.readArmored(msg)), 
				privateKeys: [prKObj]
			};

			let id, mjeFirmado, pubKR, pubKM, valid;

			await pgp.decrypt(options)
			.then( async plaintext => {
			    let data = await plaintext.data;
			    id = await data.split('-----', 1).toString().replace(/\n/g, '');
			    mjeFirmado = await data.substring(data.indexOf('-----')).toString();
			}).catch(e => console.log(e));

			pubKM = await firestoreRef.collection('MEDICOS').doc(id).collection('DATOS').doc('CREDENCIALES').get()
			.then(async r => {
				if(r.exists){
					return await r.data().clavePublica;
				} else {
					throw 'ERROR: no hay datos';
				}
			}).catch(e => console.log('ERROR pubK: ', e));

			const optionsVerificaFirma = {
			    message: (await pgp.cleartext.readArmored(mjeFirmado)),
			    publicKeys: (await pgp.key.readArmored(pubKM)).keys
			};

			return pgp.verify(optionsVerificaFirma)
			.then(async (verified) => {
				valid = verified.signatures[0].valid; // true
				const data = await JSON.parse(verified.data);
				const i = data.i;
				if (valid) {
					let rp = await firestoreRef.collection('RECETAS').doc(i).set({
						scan: admin.firestore.FieldValue.arrayUnion({
							escaneadaPor: context.auth.uid,
							nombre: context.auth.token.name || null,
							email: context.auth.token.email || null,
							fecha: new Date(),
							idReceta: i
						})
					}, {merge: true});
					let vendida = await firestoreRef.collection('RECETAS').doc(i).get()
					.then(r => {
						return r.data().vendida;
					});
					if(vendida){
						return 'vendida';
					} else {
						return verified.data;
					}
				} else {
					return 'no verificado';
				}
			}).catch(e => console.log(e));
		} else {
			throw new functions.https.HttpsError(
			  'wrong-credentials'
			);
		}
	});	
});

exports.vendeProd = functions.https.onCall(async (data, context) => {
	if (!(context.auth && context.auth.token)) {
	  throw new functions.https.HttpsError(
	    'permission-denied'
	  );
	}
	if(data.user != context.auth.uid){
		throw new functions.https.HttpsError(
		  'wrong-user'
		);
	}
	return await admin.auth().getUser(context.auth.uid).then(async (userRecord) => {
		if(!!userRecord.customClaims.medicoQx || !!userRecord.customClaims.farmacia){
			const id = await data.idReceta;
			let rp = await firestoreRef.collection('RECETAS').doc(id);
			rp.get().then(d => {
				if(!!d.data().anulada){
					throw new functions.https.HttpsError(
					  'Receta anulada, no puede ser vendida'
					);
				} else if(!!d.data().vendida) {
					throw new functions.https.HttpsError(
					  'Receta ya vendida'
					);
				} else {
					rp.set({
						vendida: true,
						idReceta: data.idReceta,
						vendidoPor: context.auth.uid,
						nombreVendedor: context.auth.token.name || null,
						emailVendedor: context.auth.token.email || null,
						fecha: new Date()
					}, {merge: true});
				}
			});			
		} else {
			throw new functions.https.HttpsError(
			  'wrong-credentials'
			);
		}		
	});	
});

exports.anulaProd = functions.https.onCall(async (data, context) => {
	if (!(context.auth && context.auth.token)) {
	  throw new functions.https.HttpsError(
	    'permission-denied'
	  );
	}
	if(data.user != context.auth.uid){
		throw new functions.https.HttpsError(
		  'wrong-user'
		);
	}
	if (context.auth.uid != data.u) {
	  throw new functions.https.HttpsError(
	    'Sólo médico que emite receta puede anularla'
	  );
	}
	return await admin.auth().getUser(context.auth.uid).then(async (userRecord) => {
		if(!!userRecord.customClaims.medicoQx || !!userRecord.customClaims.farmacia){
			const id = await data.idReceta;
			let rp = await firestoreRef.collection('RECETAS').doc(id);
			rp.get().then(d => {
				if(!!d.data().vendida){
					throw new functions.https.HttpsError(
					  'Receta ya vendida, no se puede anular'
					);
				} else if(!!d.data().anulada){
					throw new functions.https.HttpsError(
					  'Receta ya anulada'
					);
				} else {
					rp.set({
						anulada: true,
						idReceta: data.idReceta,
						anuladaPor: context.auth.uid,
						nombreAnula: context.auth.token.name || null,
						emailAnula: context.auth.token.email || null,
						motivo: data.motivo,
						fecha: new Date()
					}, {merge: true});
				}
			});			
		} else {
			throw new functions.https.HttpsError(
			  'wrong-credentials'
			);
		}
	});
});

// FUNCIONES PARA USO DE CLAVEUNICA

exports.claveUnica = functions.https.onCall(async (data, context) => {
	
	const redirectUri = encodeURIComponent('https://test.e-receta.cl');
	const clientId = '058258f80513405496e7cd88e2559579'; //debería is a functions config()
	const clientSecret = '2a24f7ec0b554fa483da0b7f960ae2ff'; //debería is a functions config()
	const state = crypto.randomBytes(48).toString('hex');

	const options = {
		method: 'GET',
		url: `https://accounts.claveunica.gob.cl/openid/authorize/?client_id?=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid run name&state=${state}`
	};

	const res = await rp(options)
	.then(r => {
		console.log(r);
		return r;
	});
	return res;
});

// var request = require('request');

// var headers = {
//     'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
// };

// var dataString = 'client_id=CLIENT_ID& client_secret=CLIENT_SECRET& redirect_uri=URI_REDIRECT_ENCODEADA& grant_type=authorization_code& code=CODE& state=STATE';

// var options = {
//     url: 'https://accounts.claveunica.gob.cl/openid/token/',
//     method: 'POST',
//     headers: headers,
//     body: dataString
// };

// function callback(error, response, body) {
//     if (!error && response.statusCode == 200) {
//         console.log(body);
//     }
// }

// request(options, callback);
