import { html, css, LitElement } from 'lit-element';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-number-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-password-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-area.js';
import '@vaadin/vaadin-button/theme/lumo/vaadin-button.js';
import 'webcomponent-qr-code';
import { IconButton } from '@material/mwc-icon-button/mwc-icon-button.js';

import { okLogo } from './ok-logo.js';
import { firebase } from './firebase.js';


export class PageOne extends LitElement {
  static get styles() {
    return css`
      :host {
        --page-one-text-color: #000;

        padding: 25px;
        color: var(--page-one-text-color);
      }
      #eReceta {
        background-color: white;
        padding: 24px;
        height: auto;
        overflow: auto;
        border-radius: 4px;
        display: block;
      }
      p {
        font-weight: 300;
        font-size: 50%;
        margin-top: -24px;
        max-width: 640px;
      }
      vaadin-number-field, vaadin-text-field{
        width: 240px;
        max-width: 70vw;
      }
      .texto-ancho {
        width: 486px;
      }
      .texto-captcha {
        width: 276px;
      }
      .receta {
        width: 640px;
        max-width: 95vw;
      }
      .qr {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 600px;
      }
      @media(max-width: 700px){
        #receta{
          margin: 0 auto;
        }
      }
      .texto {
        width: calc(640px - 130px);
        max-width: 70vw;
      }
      .dato {
        width: 120px;
      }
      .rp {
        width: 640px;
        min-height: 260px;
        max-width: 95vw;
      }
      .imagen {
        width:204px;
        height:57px;
        vertical-align: bottom;
        margin-bottom: 5px;
        display: inline-block;
        background-color: rgba(0,0,0,.035);
      }
      .imagen > img {
        width:204px;
        height:57px;
      }
      svg{
        height: 24px;
        width: 24px;
        display: inline-block;
        vertical-align: bottom;
      }
      .flotaIzq {
        display: inline-block;
        width: calc(640px - 130px);
        max-width: 70vw; 
      }
      qr-code{
        margin: 25px auto;
      }
      mwc-icon-button {
        background: #f52419;
        color: white;
        border-radius: 50%;
      }
      mwc-icon-button[disabled] {
        background: #f52419;
        --mdc-theme-text-disabled-on-light: white;
        opacity: .4;
      }
    `;
  }

  static get properties() {
    return {
      _medValido: {
        type: Boolean
      },
      _firma: {
        type: Boolean
      },
      _rutDoc: {
        type: String
      },
      _rutValido: {
        type: Boolean
      },
      _numSerie: {
        type: String
      },
      _serieValida: {
        type: Boolean
      },
      _captcha: {
        type: String
      },
      _txtCaptcha: {
        type: String
      },
      _user: {
        type: Object
      },
      _generaClave: {
        type: Boolean
      },
      _nombreMed: {
        type: String
      },
      _captEnviado: {
        type: Boolean
      },
      _passphrase: {
        type: String
      },
      _key: {
        type: Boolean
      },
      _receta: {
        type: Object
      },
      _fraseClave: {
        type: String
      },
      _qr: {
        type: String
      }
    };
  }

  constructor() {
    super();
    this._medValido = '';
    this._serieValida = '';
    this._firma = false;
    this._rutDoc = '';
    this._rutValido = false;
    this._numSerie = '';
    this._captcha = '';
    this._txtCaptcha = '';
    this._generaClave = false;
    this._nombreMed = '';
    this._captEnviado = false;
    this._passphrase = '';
    this._key = '';
    this._fraseClave = '';
    this._receta = {};
    this._qr = '';
  }

  render() {
    return html`
    <div id="eReceta">
      <mwc-icon-button ?disabled=${!this._user} icon="close" style="float: right" @click="${() => this._salir()}" aria-label="Salir"></mwc-icon-button>
      <h5>Paso 1: Validar cuenta de correo electrónico ${this._user? okLogo : ''}</h5>
      <p>(Puede ser cualquiera, con fines de prueba por ahora sólo Gmail. Único paso necesario por ahora para acceder al lector QR)</p>
      <vaadin-button theme="primary" @click="${() => this._signIn()}" ?disabled=${this._user}>Ingresar con Google</vaadin-button>
      <h5 style="color: ${this._user? 'black':'rgba(0,0,0,.3)'}">Paso 2: Validar Médico ${this._generaClave? okLogo : ''}</h5>
      <p>(Sólo una vez: ingresar RUT y número de serie, con ello se obtiene registro Superintendencia de Salud, para validar el RUT es necesario completar, antes de 20 segundos, el texto del CAPTCHA)</p>
      <vaadin-text-field clear-button-visible id="rutDoc" error-message="Rut inválido" label="RUT" ?disabled=${!this._user || this._generaClave || this._captEnviado} .value="${this._rutDoc}" @input="${(e) => {e.target.value = `${e.target.value === '-'? e.target.value.replace('-', '') : e.target.value.split('').pop() != '-'? e.target.value.replace('-','').slice(0, -1) + '-' + e.target.value.slice(-1): e.target.value.replace('-','')}`; this._rutDoc = e.target.value; this._validaRut(e.target.value)}}"></vaadin-text-field>      
      <vaadin-text-field label="Nº de Serie o Documento (sin puntos)" .value="${this._numSerie}" ?disabled=${!this._rutValido  || this._generaClave || this._captEnviado} @input="${e => this._numSerie = e.target.value}"></vaadin-text-field>      
      <vaadin-button ?disabled="${!this._rutDoc || !this._numSerie || this._generaClave || this._captEnviado}" @click="${(e) => this._validaMed(this._user, this._rutDoc, this._numSerie)}" theme="primary">Validar</vaadin-button><br>   
      <div>
        <div class="imagen">
          <img ?hidden=${!this._captcha} src="data:image/png;base64,${this._captcha}">
        </div>
        <vaadin-text-field label="Texto Captcha" class="texto-captcha" .value="${this._txtCaptcha}" @input="${e => this._txtCaptcha = e.target.value}" ?disabled=${!this._captcha}></vaadin-text-field>       
        <vaadin-button theme="primary" ?disabled=${!this._captcha} @click="${() => {this._enviaCaptcha(this._txtCaptcha); this._captEnviado = true}}">Enviar</vaadin-button>            
      </div>
      <vaadin-text-field label="Estado Cédula Identidad" readonly .value="${(this._serieValida === true)? 'Cédula de Identidad Vigente': (this._serieValida === false)? 'No Vigente' : (this._serieValida === 'ERROR')? 'Error' : 'Pendiente'}" ?disabled=${!this._user}></vaadin-text-field>       
      <vaadin-text-field label="Registro Superintendencia" .value="${(this._medValido === true)? 'Médico Cirujano': (this._medValido === true)? 'No Registrado' : 'Pendiente'}" readonly ?disabled=${!this._user}></vaadin-text-field><br>      
      <vaadin-text-field label="Nombre"  class="texto-ancho" .value="${this._nombreMed}" readonly ?disabled=${!this._user}></vaadin-text-field>       
      <h5 style="color: ${this._generaClave? 'black':'rgba(0,0,0,.3)'}">Paso 3: Llave Pública y Privada ${this._key? okLogo : ''}</h5>
      <p>(Sólo una vez. No guardamos copia de ella, por eso no puede olvidarla)</p>
      <vaadin-password-field class="texto-ancho" label="Frase Clave (No puede olvidarla. No use la misma de su email)" ?disabled=${!this._generaClave || this._key} .value="${this._passphrase}" @input="${e => this._passphrase = e.target.value}"></vaadin-password-field>      
      <vaadin-button theme="primary" @click="${(e) => this._fxGeneraFirma(this._medValido, this._serieValida, this._user, this._passphrase)}" ?disabled="${!this._passphrase || this._key}">Generar Firma</vaadin-button>
      <h5 style="color: ${this._key? 'black':'rgba(0,0,0,.3)'}">Paso 4: Receta</h5>            
      <div class="receta">
        <vaadin-text-field class="texto" label="Nombre" ?disabled=${!this._key} id="nombrePte" @input="${e => this._receta.nombrePte = e.target.value}"></vaadin-text-field>      
        <vaadin-number-field class="dato" label="Edad" ?disabled=${!this._key} id="edadPte" @input="${e => this._receta.edadPte = e.target.value}"></vaadin-number-field>      
        <vaadin-text-field class="texto" label="Dirección" ?disabled=${!this._key} id="direccionPte" @input="${e => this._receta.direccionPte = e.target.value}"></vaadin-text-field>      
        <vaadin-text-field class="dato" label="RUT" error-message="Rut inválido" ?disabled=${!this._key} id="rutPte" @input="${e => {e.target.value = `${e.target.value === '-'? e.target.value.replace('-', '') : e.target.value.split('').pop() != '-'? e.target.value.replace('-','').slice(0, -1) + '-' + e.target.value.slice(-1): e.target.value.replace('-','')}`; this._receta.rutPte = e.target.value; this._validaRutPte(e.target.value)}}"></vaadin-text-field>      
        <div class="flotaIzq" style="margin-right: 8px;"></div><vaadin-text-field class="dato" label="Fecha" readonly ?disabled=${!this._key} value="${new Date().toLocaleDateString()}"></vaadin-text-field>
        <vaadin-text-area class="rp" label="Rp." ?disabled=${!this._key} id="rpPte" @input="${e => this._receta.rpPte = e.target.value}"></vaadin-text-area> 
        <vaadin-password-field class="texto" label="Frase Clave" id="fraseClave" ?disabled=${!this._key} @input="${e => this._fraseClave = e.target.value}"></vaadin-password-field>      
        <vaadin-button ?disabled="${!this._fraseClave}" theme="primary" @click="${() => {this._creaReceta(this._receta, this._fraseClave);}}">Crear Receta</vaadin-button> 
        <div class="flotaIzq" style="margin-right: 1px;"></div><vaadin-button ?disabled="${!this._key}" theme="primary error" @click="${() => this._borraReceta()}">Borrar Receta</vaadin-button>          
      </div>
      <h5 style="color: ${this._qr? 'black':'rgba(0,0,0,.3)'}">Resultado: QR Receta ${this._qr? okLogo : ''}</h5> 
      <div class="receta qr">
        <qr-code format="svg" ?hidden="${!this._qr}" .data="${this._qr}"></qr-code>          
      </div>
    <div>
    `;
  }
  firstUpdated(){
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this._user = user.uid;
        const ref = firebase.firestore().collection('MEDICOS').doc(this._user).collection('DATOS').doc('LOGIN').onSnapshot(async r => {
          const data = await r.data();
          this._rutDoc = data.rut? data.rut : '';
          this._medValido = data.medico? data.medico : '';
          this._serieValida = data.ciVigente? data.ciVigente : '';
          this._numSerie = data.serie? data.serie : '';
          this._captcha = data.captcha? data.captcha : ''; 
          this._nombreMed = data.nombreMed? data.nombreMed : '';         
        });
        const refKey = firebase.firestore().collection('MEDICOS').doc(this._user).collection('DATOS').doc('PUBKEY').onSnapshot(async r => {
          if(r.exists){
            const data = await r.data();
            this._key = !!data.clavePublica;
          }         
        });

      }
    });
  }
  updated(changedProps){
    if(this._medValido && this._serieValida){
      this._generaClave = true;
    }   
  }
  _borraReceta(){
    this.shadowRoot.querySelector('#nombrePte').value = '';
    this.shadowRoot.querySelector('#rutPte').value = '';
    this.shadowRoot.querySelector('#direccionPte').value = '';
    this.shadowRoot.querySelector('#edadPte').value = '';
    this.shadowRoot.querySelector('#rpPte').value = '';
    this.shadowRoot.querySelector('#fraseClave').value = '';
    this._fraseClave = '';
    this._qr = null;
  }
  _enviaCaptcha(t){
    const ref = firebase.firestore().collection('MEDICOS').doc(this._user).collection('DATOS').doc('LOGIN');
    ref.set({
      txtCaptcha: t, 
      captcha: firebase.firestore.FieldValue.delete()
    },{merge: true})
    .then(r => {
      this._txtCaptcha = '';
      this._captcha = null;
    });
  }
  _validaRut(e){
      this.shadowRoot.querySelector('#rutDoc').checkValidity = () => {     
        if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(e)){
            this.rutValido = false;
            return false;
        }
        var tmp = e.split('-');
        var digv = tmp[1];
        var T = tmp[0];
        if (digv == 'K') digv = 'k';
        var M = 0,
            S = 1;
        for (; T; T = Math.floor(T / 10))
            S = (S + T % 10 * (9 - M++ % 6)) % 11;
        var dv = S ? S - 1 : 'k';
        if(dv == digv){
          this._rutValido = true;
          return true;
        }else{
          this._rutValido = false;
          return false;
        }
      };
    }
  _validaRutPte(e){
      this.shadowRoot.querySelector('#rutPte').checkValidity = () => {     
        if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(e)){
            this.rutValido = false;
            return false;
        }
        var tmp = e.split('-');
        var digv = tmp[1];
        var T = tmp[0];
        if (digv == 'K') digv = 'k';
        var M = 0,
            S = 1;
        for (; T; T = Math.floor(T / 10))
            S = (S + T % 10 * (9 - M++ % 6)) % 11;
        var dv = S ? S - 1 : 'k';
        if(dv == digv){
          this._rutValido = true;
          return true;
        }else{
          this._rutValido = false;
          return false;
        }
      };
    }
  _validaMed(u, r, s){
    if(!u || !r || !s){
      alert('Datos incompletos!');
      return;
    }
    const validaMed = firebase.functions().httpsCallable('validaMed');
    const validaRutSerie = firebase.functions().httpsCallable('validaSerie');
    const rut = r.substring(0, r.indexOf('-'));
    validaMed({uid: this._user, rut: rut})
    .then(res => {
      this._medValido = (res.data.prestador.codigoBusqueda == "Médico Cirujano");
      validaRutSerie({uid: u, rut: r, serie: s})
      .then(d => {
        this._serieValida = (d.data.message == 'Vigente');
      });
    })
    .catch(function(error) {
      console.log(error);
    });
  }
  _fxGeneraFirma(m, s, u, p){
    if(!m || !s || !u || !p){
      throw new Error('Datos incompletos');
    }
    const creaFirma = firebase.functions().httpsCallable('creaFirma');
    creaFirma({user: u, passphrase: p})
    .then(async r => {
      console.log(r);
    });
  }
  _creaReceta(r, p){
    const datos = {receta: r, pass: p, user: this._user};
    const creaReceta = firebase.functions().httpsCallable('creaReceta');
    creaReceta(datos)
    .then(async r => {
      this._qr = r.data;
      console.log(r);
      this.shadowRoot.querySelector('#fraseClave').value = '';
      this._fraseClave = '';
    }).catch(e => {
      console.log(e);
      alert('Error, no se pudo generar receta');
    });
  }
  _signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  }
  _salir(){
    firebase.auth().signOut()
    .then(r =>{
      this._user = '';
      this._rutDoc = '';
      this._medValido = '';
      this._serieValida = '';
      this._numSerie = '';
      this._captcha = '';
      this._nombreMed = '';
      this._generaClave = '';
      this._captEnviado = '';
      this._key = '';
      this._fraseClave = '';
      this._receta = {};
      this._qr = '';
    })
    .catch(e => console.log(e));
    
  }
}
