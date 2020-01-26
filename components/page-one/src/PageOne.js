import { html, css, LitElement } from 'lit-element';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-number-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-password-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-area.js';
import '@vaadin/vaadin-button/theme/lumo/vaadin-button.js';
import '@vaadin/vaadin-form-layout/vaadin-form-layout.js';
import 'dile-spinner/dile-spinner-modal.js';
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
        box-sizing: border-box;
      }
      vaadin-form-layout {
        max-width: 780px;
      }
      p {
        font-weight: 300;
        font-size: 50%;
        margin-top: -24px;
        width: 640px;
        max-width: calc(100vw - 48px);
      }
      .texto-captcha {
        width: calc(100% - 98px);
      }
      @media(max-width: 820px){
        :host {
          padding: 0;
        }
      }
      @media(max-width: 700px){
        #eReceta{
          max-width: 100vw;
          border-radius: 0;
        }
        #receta {
          margin: 0 auto;
        }
        vaadin-form-layout {
          max-width: 100vw;
        }
      }
      .dato {
        width: 120px;
      }
      .rp {
        min-height: 260px;
      }
      .imagen {
        width:204px;
        height:57px;
        position: relative;
        vertical-align: bottom; 
        display: inline-flex;
        bottom: -12px;
        background-color: rgba(0,0,0,.035);
      }
      svg{
        height: 24px;
        width: 24px;
        display: inline-block;
        vertical-align: bottom;
      }
      qr-code{
        margin: 50px auto;
      }

      .receta {
        width: 640px;
        max-width: 95vw;
        height: 600px;
        margin-top: 48px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      mwc-icon-button{
        background: #f52419;
        color: white;
        border-radius: 50%;
      }
      mwc-icon-button[disabled] {
        background: #f52419;
        --mdc-theme-text-disabled-on-light: white;
        opacity: .4;
      }
      dile-spinner-modal {
        --dile-spinner-color: white;
        --dile-spinner-modal-background-color: rgba(0,0,0,.5);
        --dile-spinner-modal-box-color: transparent;
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
      _email: {
        type: String
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
      },
      _spinner: {
        type: Boolean
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
    this._spinner = false;
    this._fraseClave = '';
    this._receta = {};
    this._qr = '';
  }

  render() {
    return html`
    <div id="eReceta">
      <mwc-icon-button ?disabled=${!this._user} icon="close" style="float: right" @click="${() => this._salir()}" aria-label="Salir"></mwc-icon-button>
      <vaadin-form-layout class="form" style="margin-top: 48px;">  
        <h5 colspan="2">Paso 1: Validar cuenta de correo electrónico ${this._user? okLogo : ''}</h5>
        <p colspan="2">(Puede ser cualquiera, con fines de prueba por ahora sólo Gmail. Único paso necesario por ahora para acceder al lector QR)</p>
        <div>
          <vaadin-button theme="primary" @click="${() => this._signIn()}" ?disabled=${this._user}>Ingresar con Google</vaadin-button>   
          ${this._email? html`
              <p style="margin-top: 10px;">Ingresó con el correo ${this._email}</p>
            `:html``}       
        </div>
      </vaadin-form-layout>
      <vaadin-form-layout class="form">
        <h5 colspan="2" style="color: ${this._user? 'black':'rgba(0,0,0,.3)'}">Paso 2: Validar Médico ${this._generaClave? okLogo : ''}</h5>
        <p colspan="2" style="color: ${this._user? 'black':'rgba(0,0,0,.3)'}">(Sólo una vez: ingresar RUT y número de serie, con ello se obtiene registro Superintendencia de Salud, para validar el RUT es necesario completar, antes de 20 segundos, el texto del CAPTCHA)</p>
        <vaadin-text-field clear-button-visible id="rutDoc" error-message="Rut inválido" label="RUT" ?disabled=${!this._user || this._generaClave || this._captEnviado} .value="${this._rutDoc}" @input="${(e) => {e.target.value = `${e.target.value === '-'? e.target.value.replace('-', '') : e.target.value.split('').pop() != '-'? e.target.value.replace('-','').slice(0, -1) + '-' + e.target.value.slice(-1): e.target.value.replace('-','')}`; this._rutDoc = e.target.value; this._validaRut(e.target.value)}}"></vaadin-text-field>      
        <div>
          <vaadin-text-field class="texto-captcha" label="Nº de Serie o Documento (sin puntos)" .value="${this._numSerie}" ?disabled=${!this._rutValido  || this._generaClave || this._captEnviado} @input="${e => this._numSerie = e.target.value}"></vaadin-text-field>      
          <vaadin-button ?disabled="${!this._rutDoc || !this._numSerie || this._generaClave || this._captEnviado}" @click="${(e) => this._validaMed(this._user, this._rutDoc, this._numSerie)}" theme="primary">Validar</vaadin-button><br>            
        </div>
        <div class="imagen">
          <img ?hidden=${!this._captcha} src="data:image/png;base64,${this._captcha}">
        </div>
        <div>
          <vaadin-text-field label="Texto CAPTCHA (minúsculas)" ?invalid="${(this._captcha && !this._txtCaptcha)}" error-message="Ingresar CAPTCHA (antes de 20 seg)" class="texto-captcha" .value="${this._txtCaptcha}" @input="${e => this._txtCaptcha = e.target.value}" ?disabled=${!this._captcha}></vaadin-text-field>       
          <vaadin-button theme="primary" ?disabled=${!this._captcha} @click="${() => {this._enviaCaptcha(this._txtCaptcha); this._captEnviado = true; this._spinner = true;}}">Enviar</vaadin-button>            
        </div>
        <vaadin-text-field label="Estado Cédula Identidad" readonly .value="${(this._serieValida === true)? 'Cédula de Identidad Vigente': (this._serieValida === false)? 'No Vigente' : (this._serieValida === 'ERROR')? 'Error' : 'Pendiente'}" ?disabled=${!this._user}></vaadin-text-field>       
        <vaadin-text-field label="Registro Superintendencia" .value="${(this._medValido === true)? 'Médico Cirujano': (this._medValido === true)? 'No Registrado' : 'Pendiente'}" readonly ?disabled=${!this._user}></vaadin-text-field><br>      
        <vaadin-text-field colspan="2" label="Nombre" .value="${this._nombreMed}" readonly ?disabled=${!this._user}></vaadin-text-field>       
      </vaadin-form-layout>
      <vaadin-form-layout class="form">
        <h5 colspan="2" style="color: ${this._generaClave? 'black':'rgba(0,0,0,.3)'}">Paso 3: Llave Pública y Privada ${this._key? okLogo : ''}</h5>
        <p colspan="2" style="color: ${this._user? 'black':'rgba(0,0,0,.3)'}">(Sólo una vez. No guardamos copia de ella, por eso no puede olvidarla)</p>
        <div colspan="2">
          <vaadin-password-field style="width: 378px" label="Frase Clave (No puede olvidarla. No use la misma de su email)" ?disabled=${!this._generaClave || this._key} .value="${this._passphrase}" @input="${e => this._passphrase = e.target.value}"></vaadin-password-field>      
          <vaadin-button theme="primary" @click="${(e) => this._fxGeneraFirma(this._medValido, this._serieValida, this._user, this._passphrase)}" ?disabled="${!this._passphrase || this._key}">Generar Firma</vaadin-button>
        </div>
      </vaadin-form-layout>
      <vaadin-form-layout class="form">
        <h5 colspan="2" style="min-width: 300px; color: ${this._key? 'black':'rgba(0,0,0,.3)'}">Paso 4: Receta</h5>            
        <vaadin-text-field required error-message="Requerido" colspan="2" label="Nombre" ?disabled=${!this._key} id="nombrePte" @input="${e => this._receta.nombrePte = e.target.value}"></vaadin-text-field>      
        <vaadin-number-field label="Edad" ?disabled=${!this._key} id="edadPte" @input="${e => this._receta.edadPte = e.target.value}"></vaadin-number-field>      
        <vaadin-text-field required label="RUT" error-message="Rut inválido" ?disabled=${!this._key} id="rutPte" @input="${e => {e.target.value = `${e.target.value === '-'? e.target.value.replace('-', '') : e.target.value.split('').pop() != '-'? e.target.value.replace('-','').slice(0, -1) + '-' + e.target.value.slice(-1): e.target.value.replace('-','')}`; this._receta.rutPte = e.target.value; this._validaRutPte(e.target.value)}}"></vaadin-text-field>
        <vaadin-text-field colspan="2" label="Dirección" ?disabled=${!this._key} id="direccionPte" @input="${e => this._receta.direccionPte = e.target.value}"></vaadin-text-field>      
        <div class="flotaIzq" style="margin-right: 8px;"></div><vaadin-text-field class="dato" label="Fecha" readonly ?disabled=${!this._key} value="${new Date().toLocaleDateString()}"></vaadin-text-field>
        <vaadin-text-area required error-message="Requerido" colspan="2" class="rp" label="Rp." ?disabled="${(!this._key)}" id="rpPte" @input="${e => this._receta.rpPte = e.target.value}"></vaadin-text-area> 
        <vaadin-password-field required label="Frase Clave" id="fraseClave" ?disabled=${!this._key} @input="${e => this._fraseClave = e.target.value}"></vaadin-password-field>      
        <vaadin-button ?disabled="${(!this._fraseClave || !this._key || !this._receta.nombrePte || !this._receta.rutPte || !this._receta.rpPte)}" theme="primary" @click="${() => {this._creaReceta(this._receta, this._fraseClave);}}">Crear Receta</vaadin-button> 
        <div style="margin-right: 1px;"></div><vaadin-button ?disabled="${!this._key}" theme="primary error" @click="${() => this._borraReceta()}">Borrar Receta</vaadin-button>          
      </vaadin-form-layout>
      <h5 style="color: ${this._qr? 'black':'rgba(0,0,0,.3)'}">Resultado: QR Receta ${this._qr? okLogo : ''}</h5>
      ${navigator.canShare? html`
          <mwc-icon-button icon="share" ?disabled="${!this._qr}" style="position: absolute; right: 24px; background: rgba(0,0,0,.75); color: white; border-radius: 50%;" @click="${() => this._compartePNG()}" aria-label="Compartir QR"></mwc-icon-button>
          <mwc-icon-button icon="print" ?disabled="${!this._qr}" style="position: absolute; right: 24px; margin-top: 80px; background: rgba(0,0,0,.75); color: white; border-radius: 50%;" @click="${() => this._printPNG(this._receta)}" aria-label="Imprimir QR"></mwc-icon-button>
        `:html`
          <mwc-icon-button icon="print" ?disabled="${!this._qr}" style="float: right; background: rgba(0,0,0,.75); color: white; border-radius: 50%;" @click="${() => this._printPNG(this._receta)}" aria-label="Imprimir QR"></mwc-icon-button>
        `} 
      <br>
      <div class="receta">       
        <qr-code id="qrCode" format="png" modulesize="3" ?hidden="${!this._qr}" .data="${this._qr}"></qr-code>   
      </div>
    <div>
    <dile-spinner-modal ?active="${this._spinner}"></dile-spinner-modal>
    `;
  }
  firstUpdated(){
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this._user = user.uid;
        this._email = user.email;
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
    this.shadowRoot.querySelectorAll('.form')
      .forEach(e => {
        e.responsiveSteps = [
        {minWidth: 0, columns: 1, labelsPosition: 'top'},
        {minWidth: '12em', columns: 1},
        {minWidth: '24em', columns: 2}
      ];
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
  _compartePNG(){
    const img = this.shadowRoot.querySelector('#qrCode').shadowRoot.querySelector('img');
    fetch(img.src)
      .then(r => r.blob())
      .then(b => {
        let file = new File([b], 'QR-Receta.png', b); 
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: 'QR de e-receta',
            text: `
              Nombre: ${this._receta.nombrePte}
              Fecha: ${new Date().toLocaleDateString()}
              Rp. ${this._receta.rpPte}
              Médico: ${this._nombreMed}
            `          
          })
          .then(() => {
            console.log('Share was successful.');
            file = null;
          })
          .catch((error) => console.log('Sharing failed', error));
        } else {
          alert('Su dispositivo no permire compartir archivos desde navegador web');
          console.log(`Your system doesn't support sharing files.`);
        }
      });
  }

  async _printPNG(r){
    let pdf = new jsPDF();
    let imgElem = await this.shadowRoot.querySelector('#qrCode').shadowRoot.querySelector('img');
    let imgSrc = imgElem.src;

    let width = pdf.internal.pageSize.getWidth();
    let height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgSrc, 'PNG', 50, 140, (width - 100), (width - 100));
    pdf.setFontSize(12);
    pdf.text('DATOS REFERENCIALES, RECETA EN CÓDIGO QR', 50, 32, 'left');
    pdf.setFontSize(11);
    pdf.text(`Nombre: ${r.nombrePte}`, 50, 42, 'left');
    pdf.text(`RUT: ${r.rutPte}`, 50, 50, 'left');
    pdf.text(`Rp:`, 50, 58, 'left');
    pdf.text(`${r.rpPte}`, 50, 66, 'left');
    pdf.setFontSize(9);
    pdf.text(`Médico: ${this._nombreMed}`, 50, 116, 'left');
    pdf.text(`RUT: ${this._rutDoc}`, 50, 124, 'left');
    pdf.setProperties({
        title: `Receta ${r.nombrePte}`,
        creator: 'creado con e-receta.cl'
    }); 
    if (navigator.share) {
      pdf.output('dataurlnewwindow', `Receta ${r.nombrePte}`);
    } else {
      let iframe = document.createElement('iframe');
      iframe.id = "iprint";
      iframe.src = pdf.output('bloburl');
      iframe.setAttribute('style', 'display: none;');
      document.body.appendChild(iframe);
      iframe.onload = function() {
          iframe.focus();
          iframe.contentWindow.print();
      };
    }   
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
    this._spinner = true;
    validaMed({uid: this._user, rut: r})
    .then(res => {
      this._spinner = false;
      this._medValido = (res.data.prestador.codigoBusqueda == "Médico Cirujano");
    })
    .then(res => {
      validaRutSerie({uid: u, rut: r, serie: s})
      .then(d => {
        this._spinner = false;
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
    this._spinner = true;
    creaFirma({user: u, passphrase: p})
    .then(async r => {
      console.log(r);
      this._spinner = false;
      this._passphrase = null;
    }).catch(e => {
      this._spinner = false;
      alert(e);
    });
  }
  _creaReceta(r, p){
    const datos = {receta: r, pass: p, user: this._user};
    const creaReceta = firebase.functions().httpsCallable('creaReceta');
    this._spinner = true;
    creaReceta(datos)
    .then(async r => {
      this._qr = r.data;
      if(r.data == 'DATOS INCOMPLETOS'){
        alert('Error: Datos de receta incompletos');
      }
      if(r.data == 'CREDENCIALES INCOMPLETAS'){
        alert('Error: No cuenta con permisos actualizados');
      }
      this.shadowRoot.querySelector('#fraseClave').value = '';
      this._fraseClave = '';
      this._spinner = false;
    }).catch(e => {
      console.log(e);
      this._spinner = false;
      alert('Error: No se pudo generar receta');
    });
  }
  _signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    this._spinner = true;
    firebase.auth().signInWithPopup(provider).then(r => {
      this._spinner = false;
    }).catch(e => {
      this._spinner = false;
      alert(e);
    });
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
