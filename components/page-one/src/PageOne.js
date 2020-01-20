import { html, css, LitElement } from 'lit-element';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-number-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-password-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-area.js';
import '@vaadin/vaadin-button/theme/lumo/vaadin-button.js';
import { okLogo } from './ok-logo.js';
import { exitLogo } from './exit-logo.js';
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
        border-radius: 4px;
        display: block;
      }
      p {
        font-weight: 300;
        font-size: 50%;
        margin-top: -24px;
      }
      vaadin-number-field, vaadin-text-field{
        width: 240px;
        max-width: 70vw;
      }
      .texto-ancho {
        width: 486px;
      }
      .texto-captcha {
        width: 351px;
      }
      #receta {
        width: 640px;
        max-width: 95vw;
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
        height: 36px;
        width: 129px;
        vertical-align: bottom;
        margin-bottom: 5px;
        display: inline-block;
        background-color: rgba(0,0,0,.035);
      }
      .imagen > img {
        width:129px;
        height:36px;
      }
      svg{
        height: 24px;
        width: 24px;
        display: inline-block;
        vertical-align: bottom;
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
    this._numSerie = 'A021426944';
    this._captcha = '';
    this._txtCaptcha = '';
    this._generaClave = false;
    this._nombreMed = '';
    this._captEnviado = false;
  }

  render() {
    return html`
    <div id="eReceta">
      <vaadin-button theme="icon primary error" ?disabled=${!this._user} style="float: right" @click="${() => this._salir()}"><icon slot="suffix">${exitLogo}</icon></vaadin-button>
      <h5>Paso 1: Validar cuenta de correo electrónico ${this._user? okLogo : ''}</h5>
      <p>(Puede ser cualquiera, con fines de prueba por ahora sólo Gmail)</p>
      <vaadin-button theme="primary" @click="${() => this._signIn()}" ?disabled=${this._user}>Ingresar con Google</vaadin-button>
      <h5 style="color: ${this._user? 'black':'rgba(0,0,0,.3)'}">Paso 2: Validar Médico ${this._generaClave? okLogo : ''}</h5>
      <p>(Sólo una vez: ingresar RUT y número de serie, con ello se obtiene registro Superintendencia de Salud)</p>
      <vaadin-text-field clear-button-visible id="rutDoc" error-message="Rut inválido" label="RUT" ?disabled=${!this._user || this._generaClave || this._captEnviado} .value="${this._rutDoc}" @input="${(e) => {e.target.value = `${e.target.value === '-'? e.target.value.replace('-', '') : e.target.value.split('').pop() != '-'? e.target.value.replace('-','').slice(0, -1) + '-' + e.target.value.slice(-1): e.target.value.replace('-','')}`; this._rutDoc = e.target.value; console.log(this._rutDoc); this._validaRut(e.target.value)}}"></vaadin-text-field>      
      <vaadin-text-field label="Nº de Serie o Documento (sin puntos)" .value="${this._numSerie}" ?disabled=${!this._rutValido  || this._generaClave || this._captEnviado} @input="${e => this._numSerie = e.target.value}"></vaadin-text-field>      
      <vaadin-button ?disabled="${!this._rutDoc || !this._numSerie || this._generaClave || this._captEnviado}" @click="${(e) => this._validaMed(this._rutDoc)}" theme="primary">Validar</vaadin-button><br>   
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
      <h5 style="color: ${this._generaClave? 'black':'rgba(0,0,0,.3)'}">Paso 3: Llave Pública y Privada</h5>
      <p>(Sólo una vez)</p>
      <vaadin-password-field class="texto-ancho" label="Frase Clave (No puede olvidarla. No use la misma de su email)" ?disabled=${!this._generaClave}></vaadin-password-field>      
      <vaadin-button theme="primary" ?disabled=${!this._generaClave}>Generar Firma</vaadin-button>
      <h5 style="color: ${this._firma? 'black':'rgba(0,0,0,.3)'}">Paso 4: Receta</h5>      
      <div id="receta">
        <vaadin-text-field class="texto" label="Nombre" ?disabled=${!this._firma}></vaadin-text-field>      
        <vaadin-number-field class="dato" label="Edad" ?disabled=${!this._firma}></vaadin-number-field>      
        <vaadin-text-field class="texto" label="Dirección" ?disabled=${!this._firma}></vaadin-text-field>      
        <vaadin-text-field class="dato" label="Fecha" readonly ?disabled=${!this._firma} value="${new Date().toLocaleDateString()}"></vaadin-text-field>
        <vaadin-text-area class="rp" label="Rp." ?disabled=${!this._firma}></vaadin-text-area> 
        <vaadin-password-field class="texto" label="Frase Clave" ?disabled=${!this._firma}></vaadin-password-field>      
        <vaadin-button disabled theme="primary">Crear Receta</vaadin-button>    
      </div>   
    <div>
    `;
  }
  firstUpdated(){
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this._user = user.uid;
        const ref = firebase.firestore().collection('MEDICOS').doc(this._user).collection('DATOS').doc('LOGIN').onSnapshot(r => {
          this._rutDoc = r.data().rut? r.data().rut : '';
          this._medValido = r.data().medico? r.data().medico : '';
          this._serieValida = r.data().ciVigente? r.data().ciVigente : '';
          this._numSerie = r.data().serie? r.data().serie : '';
          this._captcha = r.data().captcha? r.data().captcha : ''; 
          this._nombreMed = r.data().nombreMed? r.data().nombreMed : '';         
        });
      }
    });
  }
  updated(changedProps){
    if(this._medValido && this._serieValida){
      this._generaClave = true;
    }   
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
  _validaMed(r){
    var validaMed = firebase.functions().httpsCallable('validaMed');
    var validaRutSerie = firebase.functions().httpsCallable('validaSerie');
    var rut = r.substring(0, r.indexOf('-'));
    validaMed({uid: this._user, rut: rut})
    .then(r => {
      console.log(r);
      this._medValido = (r.data.prestador.codigoBusqueda == "Médico Cirujano");
      validaRutSerie({uid: this._user, rut: this._rutDoc, serie: this._numSerie})
      .then(d => {
        console.log(d);
        this._serieValida = (d.data.message == 'Vigente');
      });
    })
    .catch(function(error) {
      console.log(error);
    });
  }
  _signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
    .then(u => {
      firebase.firestore().collection('MEDICOS').doc(u.uid).collection('DATOS').doc('LOGIN').set({
        email: u.email,
        uid: u.uid
      },{merge: true});
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
    })
    .catch(e => console.log(e));
    
  }
}
