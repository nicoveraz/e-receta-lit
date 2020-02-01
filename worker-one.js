importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
importScripts("https://unpkg.com/jspdf@latest/dist/jspdf.debug.js");

async function printRp(rp, nm, rm, i) {
  let reader = new FileReader();
  reader.onloadend = () => {
    let base64data = reader.result;                
        console.log(base64data);
  };

  reader.readAsDataURL(i);
}

Comlink.expose(printRp);