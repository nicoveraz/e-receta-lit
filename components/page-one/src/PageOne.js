import { html, css, LitElement } from 'lit-element';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-number-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-password-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-area.js';
import '@vaadin/vaadin-button/theme/lumo/vaadin-button.js';
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
      vaadin-password-field {
        width: 486px;
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
    `;
  }

  static get properties() {
    return {
      _emailValido: {
        type: Boolean
      },
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
      }
    };
  }

  constructor() {
    super();
    this._emailValido = true;
    this._medValido = false;
    this._firma = false;
    this._rutDoc = '';
    this._rutValido = false;
    this._numSerie = '';
  }

  render() {
    return html`
    <div id="eReceta">
      <vaadin-button theme="error tertiary" ?disabled=${!this._emailValido} style="float: right">Salir</vaadin-button>
      <h5>Paso 1: Validar cuenta de correo electrónico</h5>
      <vaadin-button theme="primary">Ingresar con Google</vaadin-button>
      ${this._firma? html`
      <h5 style="color: ${this._firma? 'black':'rgba(0,0,0,.3)'}">Paso 2: Receta</h5>
        `:html`
          <h5 style="color: ${this._emailValido? 'black':'rgba(0,0,0,.3)'}">Paso 2: Validar Médico</h5>
          <p>(Sólo la primera vez: ingresar RUT y número de serie, con ello se obtiene registro Superintendencia de Salud)</p>
          <vaadin-text-field clear-button-visible id="rutDoc" error-message="Rut inválido" label="RUT" ?disabled=${!this._emailValido} .value="${this._rutDoc}" @input="${(e) => {e.target.value = `${e.target.value === '-'? e.target.value.replace('-', '') : e.target.value.split('').pop() != '-'? e.target.value.replace('-','').slice(0, -1) + '-' + e.target.value.slice(-1): e.target.value.replace('-','')}`; this._validaRut(e.target.value)}}"></vaadin-text-field>      
          <vaadin-text-field label="Número de Serie" .value="${this._numSerie}" ?disabled=${!this._rutValido} @input="${e => this._numSerie = e.target.value}"></vaadin-text-field>      
          <vaadin-button ?disabled="${!this._rutDoc && !this._numSerie}" @click="${(e) => this._validaMed()}" theme="primary">Validar</vaadin-button><br>   
          <vaadin-text-field label="Estado CI" readonly ?disabled=${!this._emailValido}></vaadin-text-field>       
          <vaadin-text-field label="Registro Superintendencia" .value="${this._medicoValidado}" readonly ?disabled=${!this._emailValido}></vaadin-text-field>       
          <h5 style="color: ${this._medValido? 'black':'rgba(0,0,0,.3)'}">Paso 3: Llave Pública y Privada</h5>
          <p>(Sólo la primera vez)</p>
          <vaadin-password-field label="Frase Clave (no puede olvidarla)" ?disabled=${!this._medValido}></vaadin-password-field>      
          <vaadin-button theme="primary" ?disabled=${!this._medValido}>Generar Firma</vaadin-button>
      <h5 style="color: ${this._firma? 'black':'rgba(0,0,0,.3)'}">Paso 4: Receta</h5>
        `}      
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
  _validaMed(){
    var validaMed = firebase.functions().httpsCallable('validaMed');
    var validaRutSerie = firebase.functions().httpsCallable('validaSerie');
    var rut = this._rutDoc.substring(0, this._rutDoc.indexOf('-'));
    validaMed({rut: rut})
    .then(r => {
      console.log(r.data.prestador.codigoBusqueda);
      this._medicoValidado = (r.data.prestador.codigoBusqueda == "Médico Cirujano");
      validaRutSerie({rut: this._rutDoc, serie: this._numSerie})
      .then(d => {
         this._serieValida = (d.data.message == 'Vigente');
         console.log(d.data.message);
      });
    })
    .catch(function(error) {
      console.log(error);
    });
  }
}
