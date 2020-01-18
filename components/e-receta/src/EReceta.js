import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { eRecetaLogo } from './e-receta-logo.js';

import '../../page-main/page-main.js';
import '../../page-one/page-one.js';
import '../../page-two/page-two.js';

export class EReceta extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      page: { type: String },
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
        max-width: 960px;
        margin: 0 auto;
      }

      header {
        width: 100%;
        background: #fff;
        border-bottom: 1px solid #ccc;
      }

      header ul {
        display: flex;
        justify-content: space-around;
        min-width: 400px;
        margin: 0 auto;
        padding: 0;
      }

      header ul li {
        display: flex;
      }

      header ul li a {
        color: #5a5c5e;
        text-decoration: none;
        font-size: 18px;
        line-height: 36px;
      }

      header ul li a:hover,
      header ul li a.active {
        color: blue;
      }

      main {
        flex-grow: 1;
      }

      .app-footer {
        font-size: calc(12px + 0.5vmin);
        align-items: center;
      }

      .app-footer a {
        margin-left: 5px;
        text-decoration: none;
      }
    `;
  }

  constructor() {
    super();
    this.page = 'pageOne';
  }

  render() {
    return html`
      <header>
        <ul>
          <li>
            <a href="#main" class=${this.__navClass('main')} @click=${this.__onNavClicked}>
              Inicio
            </a>
          </li>
          <li>
            <a href="#pageOne" class=${this.__navClass('pageOne')} @click=${this.__onNavClicked}>
              Generar Receta
            </a>
          </li>
          <li>
            <a href="#pageTwo" class=${this.__navClass('pageTwo')} @click=${this.__onNavClicked}>
              Leer Receta
            </a>
          </li>
        </ul>
      </header>

      <main>
        ${this._renderPage()}
      </main>

      <p class="app-footer">
        Hecho por <a target="_blank" rel="noopener noreferrer" href="https://newtri.cl">NewtriLabs</a>
        © ${new Date().getFullYear()}
      </p>
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
