// firebase-config.js

  const firebaseConfig = {
    apiKey: "AIzaSyByQUpD3VMxWheqgLwbRv9ID-LVJUdpq6I",
    authDomain: "scoreboard-a6f3b.firebaseapp.com",
    databaseURL: "https://scoreboard-a6f3b-default-rtdb.firebaseio.com",
    projectId: "scoreboard-a6f3b",
    storageBucket: "scoreboard-a6f3b.firebasestorage.app",
    messagingSenderId: "829183941506",
    appId: "1:829183941506:web:49830f61344a73c2564d9b",
    measurementId: "G-NM6JBYCW10"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

console.log('Firebase configurado!');