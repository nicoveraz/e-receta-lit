/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import firebase from '@firebase/app';
import '@firebase/auth';
import '@firebase/firestore';
import '@firebase/functions';

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCAZNl8hCsHD6b6Mn0GahRPyrRbeDZRGM8",
  authDomain: "e-receta-4b81d.firebaseapp.com",
  databaseURL: "https://e-receta-4b81d.firebaseio.com",
  projectId: "e-receta-4b81d",
  storageBucket: "e-receta-4b81d.appspot.com",
  messagingSenderId: "182069811844",
  appId: "1:182069811844:web:fb16ebe064bc82543280d1",
  measurementId: "G-H6MX0KK5WS"
};
firebase.initializeApp(config);

export { firebase };