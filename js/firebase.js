const firebaseConfig = {
    apiKey: "AIzaSyBADRk_f7_vqG7cSFIWTUUeyL4D49UTHb4",
    authDomain: "emulator-games-id-bf695.firebaseapp.com",
    projectId: "emulator-games-id-bf695",
    storageBucket: "emulator-games-id-bf695.firebasestorage.app",
    messagingSenderId: "108875032762",
    appId: "1:108875032762:web:80b7f3436afa7c1667fa83",
    measurementId: "G-N6HNXLQ9GJ"
  };

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const gamesRef = db.collection("games");
const roadmapRef = db.collection("roadmap");