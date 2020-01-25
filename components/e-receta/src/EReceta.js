import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { eRecetaLogo } from './e-receta-logo.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';

import '../../page-main/page-main.js';
import '../../page-one/page-one.js';
import '../../page-two/page-two.js';
import './snack-bar.js';

import '@vaadin/vaadin-button/theme/lumo/vaadin-button.js';

export class EReceta extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      page: { type: String },
      _snackbarOpened: { type: Boolean }
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
      }
      snack-bar vaadin-button{
        margin-left: 12px;
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
        <vaadin-button theme="primary" @click="${() => window.location.reload(true)}">Recargar</vaadin-button>
      </snack-bar>
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

  __onNavClicked(ev) {
    ev.preventDefault();
    this.page = ev.target.hash.substring(1);
  }

  __navClass(page) {
    return classMap({ active: this.page === page });
  }
}
