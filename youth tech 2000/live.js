import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaD77hpOWIgCOETJylkPPIxrvF8qCrBZA",
  authDomain: "youth-tech-2000.firebaseapp.com",
  projectId: "youth-tech-2000",
  storageBucket: "youth-tech-2000.firebasestorage.app",
  messagingSenderId: "597556787355",
  appId: "1:597556787355:web:3a3c155c0502f160d6ae3e",
  measurementId: "G-LZT0LFNPQF"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const servers = { iceServers: [{ urls: ["stun:stun1.l.google.com:19302"] }] };

const pc = new RTCPeerConnection(servers);
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream = null;
let remoteStream = new MediaStream();

remoteVideo.srcObject = remoteStream;

// capture local stream
async function initLocal() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  localVideo.srcObject = localStream;

  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
  };
}

// Start Session (mentor creates room)
document.getElementById('startSession').onclick = async () => {
  await initLocal();
  const callDoc = doc(collection(db, 'calls'));
  const offerCandidates = collection(callDoc, 'offerCandidates');
  const answerCandidates = collection(callDoc, 'answerCandidates');

  document.getElementById('sessionId').value = callDoc.id;

  pc.onicecandidate = event => {
    if (event.candidate) {
      addDoc(offerCandidates, event.candidate.toJSON());
    }
  };

  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
  await setDoc(callDoc, { offer });

  onSnapshot(callDoc, snapshot => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  onSnapshot(answerCandidates, snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });
};

// Join Session (mentee joins with ID)
document.getElementById('joinSession').onclick = async () => {
  await initLocal();
  const callId = document.getElementById('sessionId').value;
  const callDoc = doc(db, 'calls', callId);
  const offerCandidates = collection(callDoc, 'offerCandidates');
  const answerCandidates = collection(callDoc, 'answerCandidates');

  pc.onicecandidate = event => {
    if (event.candidate) {
      addDoc(answerCandidates, event.candidate.toJSON());
    }
  };

  const callData = (await getDoc(callDoc)).data();
  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
  await updateDoc(callDoc, { answer });

  onSnapshot(offerCandidates, snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });
};

// Hang up
document.getElementById('hangupButton').onclick = () => {
  pc.close();
  window.location.reload();
};
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaD77hpOWIgCOETJylkPPIxrvF8qCrBZA",
  authDomain: "youth-tech-2000.firebaseapp.com",
  projectId: "youth-tech-2000",
  storageBucket: "youth-tech-2000.firebasestorage.app",
  messagingSenderId: "597556787355",
  appId: "1:597556787355:web:3a3c155c0502f160d6ae3e",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const sessionIdInput = document.getElementById('sessionId');

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  const sessionId = sessionIdInput.value;

  if (!sessionId || !text) return alert('Enter a session ID first!');

  await addDoc(collection(db, 'sessions', sessionId, 'messages'), {
    text,
    timestamp: new Date(),
  });

  chatInput.value = '';
});

function loadMessages(sessionId) {
  const q = query(collection(db, 'sessions', sessionId, 'messages'), orderBy('timestamp'));
  onSnapshot(q, snapshot => {
    chatMessages.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      const p = document.createElement('p');
      p.textContent = msg.text;
      chatMessages.appendChild(p);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

document.getElementById('startSession').addEventListener('click', () => {
  loadMessages(sessionIdInput.value);
});

document.getElementById('joinSession').addEventListener('click', () => {
  loadMessages(sessionIdInput.value);
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaD77hpOWIgCOETJylkPPIxrvF8qCrBZA",
  authDomain: "youth-tech-2000.firebaseapp.com",
  projectId: "youth-tech-2000",
  storageBucket: "youth-tech-2000.firebasestorage.app",
  messagingSenderId: "597556787355",
  appId: "1:597556787355:web:3a3c155c0502f160d6ae3e",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const editor = document.getElementById('codeEditor');
const preview = document.getElementById('preview');
const sessionInput = document.getElementById('sessionId');

let typingTimeout;

editor.addEventListener('input', async () => {
  const sessionId = sessionInput.value;
  if (!sessionId) return;

  const code = editor.value;
  preview.textContent = code;

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    setDoc(doc(db, 'sessions', sessionId), { code }, { merge: true });
  }, 500);
});

function syncCode(sessionId) {
  onSnapshot(doc(db, 'sessions', sessionId), (snapshot) => {
    const data = snapshot.data();
    if (data?.code && data.code !== editor.value) {
      editor.value = data.code;
      preview.textContent = data.code;
    }
  });
}

document.getElementById('startSession').addEventListener('click', () => {
  syncCode(sessionInput.value);
});

document.getElementById('joinSession').addEventListener('click', () => {
  syncCode(sessionInput.value);
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaD77hpOWIgCOETJylkPPIxrvF8qCrBZA",
  authDomain: "youth-tech-2000.firebaseapp.com",
  projectId: "youth-tech-2000",
  storageBucket: "youth-tech-2000.firebasestorage.app",
  messagingSenderId: "597556787355",
  appId: "1:597556787355:web:3a3c155c0502f160d6ae3e",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sessionInput = document.getElementById('sessionId');
const preview = document.getElementById('preview');
const runButton = document.getElementById('runCode');

// Initialize CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
  mode: "htmlmixed",
  theme: "default",
  lineNumbers: true,
  tabSize: 2,
  indentWithTabs: true,
  autofocus: true
});

let typingTimeout;

// Auto-save editor content to Firestore
editor.on('change', () => {
  const sessionId = sessionInput.value;
  if (!sessionId) return;

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(async () => {
    await setDoc(doc(db, 'sessions', sessionId), { code: editor.getValue() }, { merge: true });
  }, 500);
});

// Sync code in real-time
function syncCode(sessionId) {
  onSnapshot(doc(db, 'sessions', sessionId), (snapshot) => {
    const data = snapshot.data();
    if (data?.code && data.code !== editor.getValue()) {
      editor.setValue(data.code);
    }
  });
}

// Run Code in iframe
function runCode() {
  const code = editor.getValue();
  preview.srcdoc = code;
}

runButton.addEventListener('click', runCode);

// Start/Join session hooks
document.getElementById('startSession').addEventListener('click', () => {
  const sessionId = sessionInput.value;
  if (!sessionId) return;
  syncCode(sessionId);
});

document.getElementById('joinSession').addEventListener('click', () => {
  const sessionId = sessionInput.value;
  if (!sessionId) return;
  syncCode(sessionId);
});
