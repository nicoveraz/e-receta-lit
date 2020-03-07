import { html, css, LitElement } from 'lit-element';
import { render } from 'lit-html';
import { IconButtonToggle } from '@material/mwc-icon-button-toggle/mwc-icon-button-toggle.js';
import { IconButton } from '@material/mwc-icon-button/mwc-icon-button.js';
import '@vaadin/vaadin-dialog/theme/lumo/vaadin-dialog.js';
import 'dile-spinner/dile-spinner.js';

import 'jspdf/dist/jspdf.min.js';
import '@zxing/library/umd/index.min.js';

import '@vaadin/vaadin-text-field/theme/lumo/vaadin-number-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-field.js';
import '@vaadin/vaadin-text-field/theme/lumo/vaadin-text-area.js';
import '@vaadin/vaadin-button/theme/lumo/vaadin-button.js';
import '@vaadin/vaadin-form-layout/vaadin-form-layout.js';

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
        top: 190px;
      }
      #toggle {
        top: 100px;
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
        position: fixed;
        display: flex;
        margin-top: 100px;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      dile-spinner {
        z-index: 10000;
        position: fixed;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
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
      },
      _spinner: {
        type: Boolean
      },
      _medico: {
        type: Boolean
      },
      _farmacia: {
        type: Boolean
      },
      _motivoAnula: {
        type: String
      },
      anulada: {
        type: Boolean
      }
    };
  }

  constructor() {
    super();
    this._selectCamara = false;
    this._camaras = [];
    this._dialogQR = false;
    this._toggle = false;
    this._receta = '';
    this._spinner = true;
    this._anulada = false;
    this._medico = false;
    this._farmacia = false;
    this._motivoAnula = '';
    this._boundDialogRenderer = this.dialogRenderer.bind(this);
  }


  render() {
    return html`
    <div class="fondo">  
        <mwc-icon-button-toggle id="toggle" ?on="${this._toggle}" offIcon="cancel" onIcon="videocam" ?disabled="${!this._user}" @click="${() => this._camToggle()}"></mwc-icon-button-toggle>
        ${this._selectCamara? html`
          ${this._camaras.length < 3? html`
            <mwc-icon-button-toggle ?on=${this._camaraFrontal} onIcon="camera_rear" offIcon="camera_front" ?disabled="${!this._selectCamara}" @click="${() => this._cambiaCamara()}"></mwc-icon-button-toggle>
            ` : html`
            <mwc-icon-button icon="camera_rear" ?disabled="${!this._selectCamara}" @click="${() => this._cambiaCamara()}"></mwc-icon-button>
            `}
          `:html``}
        ${this._user? html` 
          <dile-spinner ?active="${this._spinner}"></dile-spinner>
          <video id="video" class="preview"></video>                     
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
        firebase.auth().currentUser.getIdTokenResult()
          .then((idTokenResult) => {
             if (!!idTokenResult.claims.medicoQx) {
              this._medico = true;
             } else if (!!idTokenResult.claims.farmacia) {
              this._farmacia = true;
             }
          }).catch(e => console.log(e));
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
    this.shadowRoot.querySelectorAll('.form')
      .forEach(e => {
        e.responsiveSteps = [
        {minWidth: 0, columns: 1, labelsPosition: 'top'},
        {minWidth: '12em', columns: 1},
        {minWidth: '24em', columns: 2}
      ];
    });
         
  }
  updated(changedProps){
    if(changedProps.has('_resQR')){
      if(!!this._resQR){
        const desencriptaQR = firebase.functions().httpsCallable('procesaQR');
        desencriptaQR({user: this._user, qr: this._resQR})
        .then(r => {
          if(r.data == 'no verificado'){
            this._spinner = false;
            alert('QR no verificado, receta inválida');
          } else if(r.data == 'vendida'){
            this._spinner = false;
            alert('Receta ya vendida');
          } else {
            this._receta = JSON.parse(r.data);
            const ref = firebase.firestore().collection('MEDICOS').doc(this._user).collection('DATOS').doc('PUBKEY').get()
            .then(async r => {
              const datos = r.data();
              this._rutMed = await datos.rut;
              this._nombreMed = await datos.nombreMed;
            }).then(() => {
              this._spinner = false;
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
    if(!this._selectedDeviceId){
      this._selectedDeviceId = this._camaras[0].deviceId;
    } else {
      const length = this._camaras.length;
      const index = this._camaras.findIndex(i => i.deviceId === this._selectedDeviceId);
      console.log('cam', this._camaras);
      if(index + 1 === length){
        this._selectedDeviceId = this._camaras[0].deviceId;
      } else {
        this._selectedDeviceId = this._camaras[index + 1].deviceId;
      }
    }
    this._escaneaQR();  
  }
  _escaneaQR(){
    this._spinner = false;
    var user = firebase.auth().currentUser;
    if(!user){
      return;
    }
    codeReader.decodeFromInputVideoDeviceContinuously(this._selectedDeviceId, this.shadowRoot.querySelector('#video'), (result, err) => {
      if (result) {
        // properly decoded qr code
        this._resQR = result;
        this._spinner = true;
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
          max-width: 85vw;
        }
        .dato {
          width: 120px;
        }
        .rp {
          min-height: 260px;
        }
        .der {
          float: right;
          margin: 24px 0;
        }
      </style>
      ${(this._medico || this._farmacia)? html`
        <div class="receta">
          <mwc-icon-button icon="close" style="float: right; color: #f52419" @click="${() => {this._dialogQR = false; this._escaneaQR();}}" aria-label="Salir"></mwc-icon-button>
          <vaadin-form-layout class="form" style="margin-top: 48px"> 
            <h4 colspan="2" style="min-width: 300px">Receta ${this._receta.vendida? html`<strong>VENDIDA</strong>`:html``}${this._receta.anulada? html`<strong>ANULADA</strong>`:html``}</h4>            
            <vaadin-text-field colspan="2" label="Nombre" readonly id="nombrePte" .value="${this._receta.n}"></vaadin-text-field>
            <vaadin-number-field class="dato" label="Edad" readonly id="edadPte" .value="${this._receta.e}"></vaadin-number-field>
            <vaadin-text-field class="dato" label="RUT" readonly id="rutPte" .value="${this._receta.r}"></vaadin-text-field>
            <vaadin-text-field colspan="2" label="Dirección" readonly id="direccionPte" .value="${this._receta.d}"></vaadin-text-field>
            <div class="flotaIzq" style="margin-right: 8px;"></div><vaadin-text-field class="dato" label="Fecha" readonly .value="${this._receta.f}"></vaadin-text-field>
            <vaadin-text-area class="rp" colspan="2" label="Rp." readonly id="rpPte" .value="${this._receta.rp}"></vaadin-text-area>
            <vaadin-text-field label="Médico" readonly id="nombreMed" .value="${this._nombreMed}"></vaadin-text-field>
            <vaadin-text-field label="RUT Médico" readonly id="rutMed" .value="${this._rutMed}"></vaadin-text-field>
            <vaadin-button class="der" theme="primary" @click="${()=> this._vendeProd()}" ?disabled="${this._anulada}">Marcar como vendida</vaadin-button>
            ${(this._medico && (this._user == this._receta.u))? html`
              <p colspan="2">Anular Receta</p>
              <vaadin-text-field colspan="2" label="Motivo Anulación" id="motivoAnula" .value="${this._motivoAnula}" @change="${e => this._motivoAnula = e.target.value}"></vaadin-text-field>
              <vaadin-button ?disabled="${!this._key}" theme="primary error" @click="${() => this._anulaReceta()}">Anular Receta</vaadin-button>
              `:html``}
            ${this._farmacia? html`
              <p colspan="2">Anular Receta</p>
              <vaadin-text-field colspan="2" label="Motivo Anulación" id="motivoAnula" .value="${this._motivoAnula}" @change="${e => this._motivoAnula = e.target.value}"></vaadin-text-field>
              <vaadin-button ?disabled="${!this._key}" ?disabled="${!this.motivoAnula}" theme="primary error" @click="${() => this._anulaReceta()}">Anular Receta</vaadin-button>
              `:html``}
          </form>
        </div>
        `: html``}    
    `;
    const rend = () => render(template(), root);
    rend();
  }
  _vendeProd(){
    const vendeProd = firebase.functions().httpsCallable('vendeProd');
    this._spinner = true;
    this._anulada = true;
    vendeProd({user: this._user, idReceta: this._receta.i})
    .then(res => {
      this._spinner = false;
      codeReader.reset();
      this._toggle = !this._toggle;
      alert('Receta vendida');
    })
    .catch(function(error) {
      codeReader.reset();
      this._toggle = !this._toggle;
      this._spinner = false;
      this._anulada = false;
      alert('Error');
    });
  }
  _anulaReceta(){
    const vendeProd = firebase.functions().httpsCallable('anulaProd');
    this._spinner = true;
    this._anulada = true;
    anulaProd({user: this._user, idReceta: this._receta.i, med: this._receta.u, motivo: this._motivoAnula})
    .then(res => {
      this._spinner = false;
      codeReader.reset();
      this._toggle = !this._toggle;
      alert('Receta anulada');
    })
    .catch(function(error) {
      codeReader.reset();
      this._toggle = !this._toggle;
      this._anulada = false;
      this._spinner = false;
      alert('Error');
    });
  }
}
