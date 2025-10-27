// Import Firebase scripts for messaging
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging.js');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaD77hpOWIgCOETJylkPPIxrvF8qCrBZA",
  authDomain: "youth-tech-2000.firebaseapp.com",
  projectId: "youth-tech-2000",
  storageBucket: "youth-tech-2000.firebasestorage.app",
  messagingSenderId: "597556787355",
  appId: "1:597556787355:web:3a3c155c0502f160d6ae3e",
  measurementId: "G-LZT0LFNPQF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification
  const notificationTitle = payload.notification.title || 'Youth Tech 2000';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new notification!',
    icon: '/logo.png'  // Add a path to your app icon here
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

auth.onAuthStateChanged(user => {
  if (!user) window.location.href = 'index.html';
  else loadUserData(user);
});
