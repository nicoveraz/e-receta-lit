import { html, css, LitElement } from 'lit-element';
import { IconButtonToggle } from '@material/mwc-icon-button-toggle/mwc-icon-button-toggle.js';
import { IconButton } from '@material/mwc-icon-button/mwc-icon-button.js';

export class PageTwo extends LitElement {
  static get styles() {
    return css`
      :host {
        --page-one-text-color: #000;

        display: block;
        padding: 0;
        color: var(--page-one-text-color);
      }
      #preview {
        height: 100vh;       
        z-index: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: black
      }
      mwc-icon-button, mwc-icon-button-toggle {
        z-index: 10;
        background: rgba(0,0,0,.75);
        color: hsl(42, 92%, 58%);
        border-radius: 50%;
        position: fixed;
        display: block;
        right: 100px;
        top: 148px;
      }
      mwc-icon-button {
        top: 78px;
      }
      mwc-icon-button-toggle[disabled] {
        --mdc-theme-text-disabled-on-light: rgba(255,255,255,.8);
      }
      @media(max-width: 1320px){
        mwc-icon-button, mwc-icon-button-toggle { 
          right: 30px;
        }
      }
      .fondo {
        position: relative;
        margin-top: -55px;
        height: 100vh;
        width: 1270px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: black;
      }
    `;
  }

  static get properties() {
    return {
      _selectCamara: {
        type: Boolean
      },
      _camaraFrontal: {
        type: Boolean
      }
    };
  }

  constructor() {
    super();
    this._selectCamara = true;
    this._camaraFrontal = true;
  }


  render() {
    return html`
    <div class="fondo">
      <mwc-icon-button icon="close" @click="${() => this.scanner.stop()}"></mwc-icon-button>
      <mwc-icon-button-toggle ?on=${this._camaraFrontal} onIcon="camera_rear" offIcon="camera_front" ?disabled="${!this._selectCamara}" @click="${() => this._cambiaCamara()}"></mwc-icon-button-toggle>
      <video id="preview"></video>
    </div>
    `;
  }
  firstUpdated(){
    this.scanner = new Instascan.Scanner({ 
      video: this.shadowRoot.querySelector('#preview'),
      backgroundScan: false
    });
    this.scanner.addListener('scan', (content) => {
      console.log(content);
      this.scanner.stop();
    });
    Instascan.Camera.getCameras().then((cameras) => {
      if (cameras.length > 0) {
        console.log(cameras);
        this.scanner.start(cameras[0]);
        if(cameras.length > 1){
          this._selectCamara = true;
        }
      } else {
        console.error('No cameras found.');
      }
    }).catch(function (e) {
      console.error(e);
    });
  }
  _cambiaCamara(){
    Instascan.Camera.getCameras().then(cameras => {
      this.scanner.stop();
      if(this._camaraFrontal){
        this.scanner.start(cameras[1]);
        this._camaraFrontal = false;
      } else {
        this.scanner.start(cameras[0]);
        this._camaraFrontal = true;
      }
    });
  }
}
