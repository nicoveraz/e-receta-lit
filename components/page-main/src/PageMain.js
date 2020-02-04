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
      p > span {
        font-weight: 600;
      }
      .texto {
        font-size: 70%;
        line-height: 36px;
        font-weight: 300;
      }

      a {
        text-decoration: none;
      }
      h1 {
        white-space: nowrap;
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
        max-width: 780px;
      }

      @media(max-width: 640px) {
        #eReceta {
          padding: 48px 0;
        }
        p {
          padding: 24px 36px;
        }
        svg {
          animation: app-logo-spin infinite 20s linear;
          width: 200px;
          height: 200px;
        }
      }

      @media(min-width: 640px) {
        .titulo {
          display: inline-block;
        }
        h1:first-of-type{
          margin-right: 8px; 
        }
      }

      @keyframes app-logo-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .version {
        margin-top: -40px;
      }
    `;
  }

  static get properties() {
    return {
      logo: { type: Function },
    };
  }

  constructor() {
    super();

    this.logo = html``;
  }

  render() {
    return html`
    <div id="eReceta">
      ${this.logo}
      <div>
        <h1 class="titulo">Bienvenido a</h1>
        <h1 class="titulo">e-receta</h1>
      </div>
      <p class="version">Versión 0.1.6b</p>
      <h3>Experimento de NewtriLabs</h3>
      <p class="texto">Receta encriptada y firmada con esquema llave pública/privada de 256bits, en código QR que puede ser compartido a dispositivos móviles, enviado vía email o impreso</p>
      <p class="texto">Lector restringido a acceso con email, para médicos enrolados en el sistema y usuarios autorizados, por ejemplo, de farmacias. Graba en base de datos si receta fue despachada, evitando doble venta de producto, lo que permitiría recetas digitales "retenidas"</p>
      <p class="texto"><span>Importante:</span> A pesar de ser seguro y basarse en últimas tecnologías de encriptación, este proyecto aún no cumple con legislación chilena, pues no cuenta con Firma Digital Avanzada para cada médico <i>(Requerimiento, en nuestra opinión, completamente innecesario)</i></p>
      <p class="texto">Fácilmente se puede incorporar firma electrónica a nuestro sistema en el futuro</p>
      <p class="texto">e-receta.cl es un proyecto en desarrollo, es libre de probarlo en forma gratuita, pero <span>no debe ser utilizado para recetas reales</span></p>
      <p>Si está interesado en este proyecto y necesita más información envíenos un <a href="mailto:contacto@newtri.cl?Subject=eReceta" rel="noopener noreferrer">email<a></p>
      <p>Más detalles en nuestro <a href="https://blog.newtri.cl/2020/01/26/e-receta.html" target="_blank" rel="noopener noreferrer">blog</a></p>
    </div>
    `;
  }
}
