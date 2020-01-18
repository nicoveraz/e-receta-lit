import { html, css, LitElement } from 'lit-element';
import '@vaadin/vaadin-form-layout/theme/lumo/vaadin-form-layout.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-number-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-password-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-area.js';
import '@vaadin/vaadin-button/theme/lumo/vaadin-button.js';

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
      }
    };
  }

  constructor() {
    super();
    this._emailValido = false
  }

  render() {
    return html`
    <div id="eReceta">
      <vaadin-button theme="error tertiary" disabled style="float: right">Salir</vaadin-button>
      <h5>Paso 1: Validar cuenta email</h5>
      <vaadin-button theme="primary">Ingresar con Google</vaadin-button>
      <h5 style="color: ${this._emailValido? 'black':'rgba(0,0,0,.3)'}">Paso 2: Validar Médico</h5>
      <p>(Sólo la primera vez: ingresar RUT y número de serie, con ello se obtiene registro Superintendencia de Salud)</p>
      <vaadin-number-field label="RUT" disabled></vaadin-number-field>      
      <vaadin-text-field label="Número de Serie" disabled></vaadin-text-field>      
      <vaadin-button disabled theme="primary">Validar</vaadin-button><br>   
      <vaadin-text-field label="Registro Superintendencia" readonly disabled></vaadin-text-field>       
      <h5 style="color: ${this._emailValido? 'black':'rgba(0,0,0,.3)'}">Paso 3: Llave Pública y Privada</h5>
      <p>(Si aún no cuenta con ella)</p>
      <vaadin-password-field label="Frase Clave (no puede olvidarla)" disabled></vaadin-password-field>      
      <vaadin-button theme="primary" disabled>Generar Firma</vaadin-button>
      <h5 style="color: ${this._emailValido? 'black':'rgba(0,0,0,.3)'}">Paso 4: Receta</h5>
      <div id="receta">
        <vaadin-text-field class="texto" label="Nombre" disabled></vaadin-text-field>      
        <vaadin-number-field class="dato" label="Edad" disabled></vaadin-number-field>      
        <vaadin-text-field class="texto" label="Dirección" disabled></vaadin-text-field>      
        <vaadin-text-field class="dato" label="Fecha" disabled value="${new Date().toLocaleDateString()}"></vaadin-text-field>
        <vaadin-text-area class="rp" label="Rp." disabled></vaadin-text-area> 
        <vaadin-password-field class="texto" label="Frase Clave" disabled></vaadin-password-field>      
        <vaadin-button disabled theme="primary">Crear Receta</vaadin-button>    
      </div>   
    <div>
    `;
  }
}
