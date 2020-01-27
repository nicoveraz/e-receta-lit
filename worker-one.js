importScripts("https://unpkg.com/comlink/dist/umd/comlink.min.js");
importScripts("https://unpkg.com/jspdf@latest/dist/jspdf.min.js");

// async function _printPNG(r, n, rut){
//   let pdf = new jsPDF();
//   let imgElem = await this.shadowRoot.querySelector('#qrCode').shadowRoot.querySelector('img');
//   let imgSrc = imgElem.src;

//   let width = pdf.internal.pageSize.getWidth();
//   let height = pdf.internal.pageSize.getHeight();
//   pdf.addImage(imgSrc, 'PNG', 50, 140, (width - 100), (width - 100));
//   pdf.setFontSize(12);
//   pdf.text('DATOS REFERENCIALES, RECETA EN CÓDIGO QR', 50, 32, 'left');
//   pdf.setFontSize(11);
//   pdf.text(`Nombre: ${r.nombrePte}`, 50, 42, 'left');
//   pdf.text(`RUT: ${r.rutPte}`, 50, 50, 'left');
//   pdf.text(`Rp:`, 50, 58, 'left');
//   pdf.text(`${r.rpPte}`, 50, 66, 'left');
//   pdf.setFontSize(9);
//   pdf.text(`Médico: ${this._nombreMed}`, 50, 116, 'left');
//   pdf.text(`RUT: ${this._rutDoc}`, 50, 124, 'left');
//   pdf.setProperties({
//       title: `Receta ${r.nombrePte}`,
//       creator: 'creado con e-receta.cl'
//   }); 
//   if (navigator.share) {
//     pdf.output('dataurlnewwindow', `Receta ${r.nombrePte}`);
//   } else {
//     let iframe = document.createElement('iframe');
//     iframe.id = "iprint";
//     iframe.src = pdf.output('bloburl');
//     iframe.setAttribute('style', 'display: none;');
//     document.body.appendChild(iframe);
//     iframe.onload = function() {
//         iframe.focus();
//         iframe.contentWindow.print();
//     };
//   }   
// }
const service = {
  double: value => value * 2
};
Comlink.expose(service, self);