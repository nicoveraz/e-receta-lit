import { html, css, LitElement } from 'lit-element';

export class PageTwo extends LitElement {
  static get styles() {
    return css`
      :host {
        --page-one-text-color: #000;

        display: block;
        padding: 25px;
        color: var(--page-one-text-color);
      }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      counter: { type: Number },
    };
  }

  constructor() {
    super();
    this.title = 'Pronto!';
  }


  render() {
    return html`
      <h2>${this.title}</h2>
    `;
  }
}
