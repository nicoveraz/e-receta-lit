import { html, css, LitElement } from 'lit-element';
import { render } from 'lit-html';
import { IconButtonToggle } from '@material/mwc-icon-button-toggle/mwc-icon-button-toggle.js';
import { IconButton } from '@material/mwc-icon-button/mwc-icon-button.js';
import '@vaadin/vaadin-dialog/theme/lumo/vaadin-dialog.js';

import '@vaadin/vaadin-text-field/theme/lumo/vaadin-number-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-area.js';
import '@vaadin/vaadin-button/theme/lumo/vaadin-button.js';

import { firebase } from '../../page-one/src/firebase.js';

const codeReader = new ZXing.BrowserQRCodeReader();

export class PageTwo extends LitElement {
  static get styles() {
    return css`
      :host {
        --page-one-text-color: #000;

        display: block;
        padding: 0;
        color: var(--page-one-text-color);
      }
      .preview {
        height: 100vh;       
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: black;
        max-width: 1270px;
      }
      mwc-icon-button, mwc-icon-button-toggle {
        z-index: 15;
        background: rgba(0,0,0,.75);
        color: hsl(42, 92%, 58%);
        border-radius: 50%;
        position: fixed;
        display: block;
        right: 100px;
        top: 148px;
      }
      #toggle {
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
        width: 100vw;
        z-index: 0;
        max-width: 1270px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: black;
      }
      .ingreso {
        text-align: center;
        color: white;
        background-color: black;
        height: 100%; 
        width: 100vw;
        position: fixed;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
    `;
  }

  static get properties() {
    return {
      _selectCamara: {
        type: Boolean
      },
      _camaras: {
        type: Array
      },
      _selectedDeviceId: {
        type: String
      },
      codeReader: {
        type: Object
      },
      _dialogQR: {
        type: Boolean
      },
      _resQR: {
        type: Object
      },
      _user: {
        type: String
      },
      _toggle: {
        type: Boolean
      },
      _receta: {
        type: Object
      },
      _nombreMed: {
        type: String
      },
      _rutMed: {
        type: String
      }
    };
  }

  constructor() {
    super();
    this._selectCamara = false;
    this._camaras = [];
    this._dialogQR = true;
    this._toggle = false;
    this._receta = '';
    this._boundDialogRenderer = this.dialogRenderer.bind(this);
  }


  render() {
    return html`
    <div class="fondo">  
        <mwc-icon-button-toggle id="toggle" ?on="${this._toggle}" offIcon="close" onIcon="videocam" @click="${() => this._camToggle()}"></mwc-icon-button-toggle>
        <mwc-icon-button-toggle ?on=${this._camaraFrontal} onIcon="camera_rear" offIcon="camera_front" ?disabled="${!this._selectCamara}" @click="${() => this._cambiaCamara()}"></mwc-icon-button-toggle>
        <video id="video" class="preview"></video>             
        ${this._user? html`         
          ` : html`
          <div class="ingreso">
            Debe ingresar con su email para acceder al lector QR
          </div>
        `}
          
    </div>
    <vaadin-dialog .opened="${this._dialogQR}" .renderer="${this._boundDialogRenderer}" no-close-on-esc no-close-on-outside-click></vaadin-dialog>
    `;
  }
  firstUpdated(){
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this._user = user.uid;
        codeReader.listVideoInputDevices()
          .then(videoInputDevices => {
            this._selectedDeviceId = videoInputDevices[0].deviceId;
            if(videoInputDevices.length > 1){
              this._selectedDeviceId = videoInputDevices[1].deviceId;
              this._selectCamara = true;
              videoInputDevices.forEach(e => {
                this._camaras.push(e);
              });
            }
            this._escaneaQR(); 
        }).catch(err => console.error(err));
      }
    });
    console.log(this._user);
         
  }
  updated(changedProps){
    if(changedProps.has('_resQR')){
      if(!!this._resQR){
        const desencriptaQR = firebase.functions().httpsCallable('procesaQR');
        desencriptaQR({user: this._user, qr: this._resQR})
        .then(r => {
          if(r.data == 'no verificado'){
            alert('QR no verificado, receta inválida');
          } else if(r.data == 'vendida'){
            alert('Receta ya vendida');
          } else {
            this._receta = JSON.parse(r.data);
            const ref = firebase.firestore().collection('MEDICOS').doc(this._user).collection('DATOS').doc('PUBKEY').get()
            .then(async r => {
              const datos = r.data();
              this._rutMed = await datos.rut;
              this._nombreMed = await datos.nombreMed;
            }).then(() => {
              this._dialogQR = true;
            });
          }
        });
      }
    }
  }
  _camToggle(){
    this._toggle? this._escaneaQR() : codeReader.reset();
    this._toggle = !this._toggle;
  }
  _cambiaCamara(){
    if(!this._selectCamara || !this._user){
      return;
    }
    codeReader.reset();
    (this._camaras[0].deviceId == this._selectedDeviceId)? (this._selectedDeviceId = this._camaras[1].deviceId) : (this._selectedDeviceId = this._camaras[0].deviceId);
    this._escaneaQR();
  }
  _escaneaQR(){
    var user = firebase.auth().currentUser;
    if(!user){
      return;
    }
    codeReader.decodeFromInputVideoDeviceContinuously(this._selectedDeviceId, this.shadowRoot.querySelector('#video'), (result, err) => {
      if (result) {
        // properly decoded qr code
        this._resQR = result;
        codeReader.reset();
      }

      if (err) {
        if (err instanceof ZXing.NotFoundException) {
          console.log('No se encontró QR');
        }

        if (err instanceof ZXing.ChecksumException) {
          console.log('Se encontró un QR, pero el valor no es válido');
        }

        if (err instanceof ZXing.FormatException) {
          console.log('Se encontró un QR, pero formato es inválido');
        }
      }
    });
  }
  dialogRenderer(root) {
    let template = () => html`
      <style>
        .receta {
          width: 640px;
          max-width: 95vw;
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
        .der {
          float: right;
          margin: 24px 0;
        }
      </style>
      <div class="receta">
        <mwc-icon-button icon="close" style="float: right; color: #f52419" @click="${() => {this._dialogQR = false; this._escaneaQR();}}" aria-label="Salir"></mwc-icon-button>
        <vaadin-text-field class="texto" label="Nombre" readonly id="nombrePte" .value="${this._receta.n}"></vaadin-text-field>
        <vaadin-number-field class="dato" label="Edad" readonly id="edadPte" .value="${this._receta.e}"></vaadin-number-field>
        <vaadin-text-field class="texto" label="Dirección" readonly id="direccionPte" .value="${this._receta.d}"></vaadin-text-field>
        <vaadin-text-field class="dato" label="RUT" readonly id="rutPte" .value="${this._receta.r}"></vaadin-text-field>
        <div class="flotaIzq" style="margin-right: 8px;"></div><vaadin-text-field class="dato" label="Fecha" readonly .value="${this._receta.f}"></vaadin-text-field>
        <vaadin-text-area class="rp" label="Rp." readonly id="rpPte" .value="${this._receta.rp}"></vaadin-text-area>
        <vaadin-text-field class="texto" label="Médico" readonly id="nombreMed" .value="${this._nombreMed}"></vaadin-text-field>
        <vaadin-text-field class="dato" label="RUT Médico" readonly id="rutMed" .value="${this._rutMed}"></vaadin-text-field>
        <vaadin-button class="der" theme="primary" @click="${()=> this._vendeProd()}">Marcar como vendida</vaadin-button>
      </div>
    `;
    const rend = () => render(template(), root);
    rend();
  }
  _vendeProd(){
    const vendeProd = firebase.functions().httpsCallable('vendeProd');
    vendeProd({user: this._user, idReceta: this._receta.i})
    .then(res => {
      codeReader.reset();
      this._toggle = !this._toggle;
      alert('Receta vendida');
    })
    .catch(function(error) {
      codeReader.reset();
      this._toggle = !this._toggle;
      alert('Error');
    });
  }
}
