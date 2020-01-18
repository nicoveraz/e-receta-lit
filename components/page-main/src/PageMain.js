import { html, css, LitElement } from 'lit-element';

export class PageMain extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
        text-align: center;
      }

      p {
        font-size: 80%;
        font-weight: 400;
      }

      a {
        text-decoration: none;
      }

      svg {
        animation: app-logo-spin infinite 20s linear;
        width: 244px;
        height: 244px;
      }

      @keyframes app-logo-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      logo: { type: Function },
    };
  }

  constructor() {
    super();
    this.title = 'Bienvenido a eReceta';
    this.logo = html``;
  }

  render() {
    return html`
      ${this.logo}
      <h1>${this.title}</h1>
      <h3>Experimento de NewtriLabs</h3>
      <p><strong>Importante:</strong> A pesar de ser seguro y basarse en últimas tecnologías de encriptación, este proyecto no cumple con legislación chilena, pues no cuenta con Firma Digital Avanzada <i>(Requerimiento, en nuestra opinión, completamente innecesario)</i></p>
      <p>No debe ser utilizado para recetas reales</p>
      <p>Si necesita más información puede <a href="mailto:contacto@newtri.cl?Subject=eReceta">enviarnos un correo<a></p>
    `;
  }
}
