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
        padding: 24px 64px;
      }
      .texto {
        font-size: 70%;
        line-height: 36px;
        font-weight: 300;
      }

      a {
        text-decoration: none;
      }

      svg {
        animation: app-logo-spin infinite 20s linear;
        width: 244px;
        height: 244px;
      }

      #eReceta {
        background-color: white;
        padding: 48px;
        box-sizing: border-box;
        border-radius: 4px;
        display: block;
        max-width: 690px;
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

    this.title = 'Bienvenido a e-receta';
    this.logo = html``;
  }

  render() {
    return html`
    <div id="eReceta">
      ${this.logo}
      <h1>${this.title}</h1>
      <h3>Experimento de NewtriLabs</h3>
      <p class="texto"><strong>Importante:</strong> A pesar de ser seguro y basarse en últimas tecnologías de encriptación, este proyecto aún no cumple con legislación chilena, pues no cuenta con Firma Digital Avanzada para cada médico <i>(Requerimiento, en nuestra opinión, completamente innecesario)</i></p>
      <p class="texto">Receta encriptada y firmada con esquema llave pública/privada de 256bits</p>
      <p class="texto">Lector público, sólo restringido a acceso con email, podría ser bloqueado a sólo usuarios autorizados, de farmacias. Graba en base de datos si receta fue despachada, evitando doble venta de producto, lo que permitiría recetas digitales "retenidas"</p>
      <p><strong>No debe ser utilizada para recetas reales</strong></p>
      <p>Si está interesado en este proyecto y necesita más información envíenos un <a href="mailto:contacto@newtri.cl?Subject=eReceta" target="_blank" rel="noopener noreferrer">email<a></p>
    </div>
    `;
  }
}
