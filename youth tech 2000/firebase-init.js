const firebaseConfig = { /* your config */ };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

auth.onAuthStateChanged(user => {
  if (!user) window.location.href = 'index.html';
  else loadUserData(user);
});