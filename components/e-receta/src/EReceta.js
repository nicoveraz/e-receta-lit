import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { eRecetaLogo } from './e-receta-logo.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';

import '../../page-main/page-main.js';
import '../../page-one/page-one.js';
import '../../page-two/page-two.js';
import './snack-bar.js';
import './cookie-bar.js';

import '@vaadin/vaadin-button/theme/lumo/vaadin-button.js';
import { IconButtonToggle } from '@material/mwc-icon-button-toggle/mwc-icon-button-toggle.js';

export class EReceta extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      page: { type: String },
      _snackbarOpened: { type: Boolean },
      _cookiebarOpened: { type: Boolean }
    };
  }

  static get styles() {
    return css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        font-size: calc(10px + 2vmin);
        color: #1a2b42;
        max-width: 100vw;
        margin: 0 auto;
      }

      header {
        width: 100vw;
        max-width: 100vw;
        background: #fff;
        border-bottom: 1px solid #ccc;
        z-index: 100;
      }

      header ul {
        display: flex;
        justify-content: space-around;
        min-width: 400px;
        margin: 0 auto;
      }

      header ul li {
        display: flex;
      }

      header ul li a {
        color: #5a5c5e;
        text-decoration: none;
        font-size: 20px;
        line-height: 36px;
        padding: 8px;
      }

      header ul li a:hover {
        color: #004ba0;
      }
      header ul li a.active {
        color: #004ba0;
        border-bottom: solid 3px #004ba0;
      }

      main {
        flex-grow: 1;
      }

      .app-footer {
        font-size: calc(12px + 0.5vmin);
        align-items: center;
        padding: 36px;
      }

      .app-footer a {
        margin-left: 5px;
        text-decoration: none;
      }
      @media(max-width: 640px) {
        header ul li a {
          font-size: calc(10px + 1vmin);
        }
        header ul {
          min-width: 100px;
        }
        .cookies {
          max-width: 100vw;
          padding: 0;
          font-size: 80%;
        }
        .cookies ul, h2, h3, p {
          font-size: 80%;
          line-height: 24px;
        }
      }
      snack-bar vaadin-button{
        margin-left: 12px;
      }
      .cookies {
        margin: 0 auto;
        padding: 24px;
        max-width: 90vw;
        text-align: left;
        font-weight: 300;
        font-family: 'Arial';
      }
      .cookies div {
        display: inline-block;
        vertical-align: top;
        margin-right: 36px;
      }
      .accordion {
        background-color: transparent;
        color: #444;
        cursor: pointer;
        padding: 18px;
        width: 100%;
        border: none;
        text-align: left;
        outline: none;
        font-size: 15px;
        transition: 0.4s;
      }
      .panel {
        background-color: transparent;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.2s ease-out;
      }
      mwc-icon-button-toggle {
        background-color: rgba(0,0,0,.05);
        border-radius: 50%;
      }
      vaadin-button {
        float: right;
      }
    `;
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.page = 'main';
    window['isUpdateAvailable'].then(r => {
      this._snackbarOpened = true;
    });
  }

  render() {
    return html`
      <header style="${(this.page == 'pageTwo')? 'background: rgba(0,0,0,.75); border-bottom: none; max-width: 1270px' : ''}"">
        <ul>
          <li>
            <a href="#main" class=${this.__navClass('main')} @click=${this.__onNavClicked} style="${(this.page == 'pageTwo')? 'color: white' : ''}">
              Inicio
            </a>
          </li>
          <li>
            <a href="#pageOne" class=${this.__navClass('pageOne')} @click=${this.__onNavClicked} style="${(this.page == 'pageTwo')? 'color: white' : ''}">
              Generar Receta
            </a>
          </li>
          <li>
            <a href="#pageTwo" class=${this.__navClass('pageTwo')} @click=${this.__onNavClicked} style="${(this.page == 'pageTwo')? 'color: white' : ''}">
              Leer Receta
            </a>
          </li>
        </ul>
      </header>

      <main>
        ${this._renderPage()}
      </main>

      <p class="app-footer" style="display: ${(this.page == 'pageTwo')? 'none' : 'block'}">
        Hecho por <a target="_blank" rel="noopener noreferrer" href="https://newtri.cl">NewtriLabs</a>
        © ${new Date().getFullYear()}
      </p>
      <snack-bar ?active="${this._snackbarOpened}">
        Nueva versión disponible 
        <vaadin-button theme="primary" @click="${() => this.rld()}">Recargar</vaadin-button>
      </snack-bar>
      <cookie-bar ?active="${this._cookiebarOpened}">
        <div class="cookies accordion" id="b10">
          <vaadin-button theme="primary" @click="${() => this.aceptaCookies()}">Acepto</vaadin-button>
          <h2>Cuidamos su privacidad</h2>
          <h3>Este sitio utiliza sólo cookies fundamentales para su funcionamiento adecuado, no se enviará a otros ni será utilizada con fines publicitarios</h3>
          <div class="panel" id="p10">
            <div>
              <p>Información que puede ser utilizada</p>
              <ul>
                <li>Tipo de navegador</li>
                <li>Identidad del usuario</li>
                <li>Información del tipo de dispositivo</li>
                <li>Fallas en aplicación</li>
              </ul>
            </div>
            <div>
              <p>Propósitos</p>
              <ul>
                <li>Almacenamiento y acceso a información</li>
                <li>Personalización del servicio</li>
                <li>Medición de calidad de servicio</li>
              </ul>
            </div>
          </div>
        </div>
        <mwc-icon-button-toggle onIcon="expand_less" offIcon="expand_more" @click="${()=> this.accordion({b: 'b10', p: 'p10'})}"></mwc-icon-button-toggle>
      </cookie-bar>
    `;
  }

  _renderPage() {
    switch (this.page) {
      case 'main':
        return html`
          <page-main .logo=${eRecetaLogo}></page-main>
        `;
      case 'pageOne':
        return html`
          <page-one></page-one>
        `;
      case 'pageTwo':
        return html`
          <page-two></page-two>
        `;
      default:
        return html`
          <p>Página no encontrada, regresar al <a href="#main">Inicio</a></p>
        `;
    }
  }

  async firstUpdated(){
    if(!window.localStorage.getItem('aceptaCookies')){
      const delay = ms => new Promise(res => setTimeout(res, ms));
      await delay(10000);
      this._cookiebarOpened = true;
    } else {
      return;
    }
  }

  accordion(d){
    var panel = this.shadowRoot.querySelector('#'+d.p);
    this.shadowRoot.querySelector('#'+d.b).classList.toggle("active");
    if (panel.style.maxHeight){
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  }

  aceptaCookies(){
    window.localStorage.setItem('aceptaCookies', true);
    this._cookiebarOpened = false;
  }

  rld(){
    window.location.reload(true);
  }

  __onNavClicked(ev) {
    ev.preventDefault();
    this.page = ev.target.hash.substring(1);
  }

  __navClass(page) {
    return classMap({ active: this.page === page });
  }
}
