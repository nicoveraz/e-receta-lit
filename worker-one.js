importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
//importScripts("https://unpkg.com/jspdf@latest/dist/jspdf.min.js");

function fibonacci(num) {
  let a = 1;
  let b = 0;

  while (num >= 0) {
    const temp = a;
    a = a + b;
    b = temp;
    num--;
  }
  console.log('bip', b);
  return b;
}

Comlink.expose(fibonacci);