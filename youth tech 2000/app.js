document.addEventListener('DOMContentLoaded',()=>{
    const form=document.querySelector('form');

    form.addEventListener('submit',function(e){
        e.preventDefault();

        //simple feedback
        alert('Thanks for reaching out, we will get back to you soon.');

        //optinally clear the form
        form.reset();
    });
});

document.querySelectorAll('a[href="#"]').forEach(anchor =>{
    anchor.addEventListener('click' ,function(e){
        e.preventDefault();
        const target=document.querySelector(this.getAttribute('href'));
        if (target){
            target.scrollIntoView({behavior:'smooth'});
        }
    })
});

document.addEventListener('DOMContentLoaded', ()=>{
    const loginForm=document.getElementById('login-Form');
    const signupForm=document.getElementById('signup-Form');

    if (loginForm){
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            alert('Logged in successfully!');
        });
    }

    if (signupForm){
        signupForm.addEventListener('submit', e => {
            e.preventDefault();
            alert('Signup complete! Welcome to Youth Tech 2000.');
        });
    }
});

ScrollReveal().reveal('fade-in', {
    origin:'bottom',
    distance:'30px',
    duration: 1000,
    delay: 200,
    reset: true,
});

const auth= firebase.auth();

document.getElementById('signup-form').addEventListener('submit', e =>{
    e.preventDefault();
    const email= e.target[1].value;
    const password= e.target[2].value;

    auth.createUserWithEmailAndPassword(email, password)
    .then(user => alert('Signup successful!'))
    window.location.href = "dashboard.html";
});

document.getElementById('login-form').addEventListener('submit', e =>{
    e.preventDefault();
    const email= e.target[0].value;
    const password= e.target[1].value;

    auth.signInWithEmailAndPassword(email, password)
    .then(user => alert('Login successful!'))
    window.location.href = "dashboard.html";
});
import { getAuth, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "auth.html";
  } else {
    document.querySelector(".profile-card").innerHTML = `
      <p><strong>Email:</strong> ${user.email}</p>
      <button id="logout">Logout</button>
    `;
  }
});
document.addEventListener("click", (e) => {
  if (e.target.id === "logout") {
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  }
});

auth.onAuthStateChanged(user =>{
    if (!user){
        window.location.href ='auth.html';
    } else{
        document.querySelector('dashboard h2').textContent='Welcome, ${user.email}';
    }
});

document.getElementById('logout').addEventListener('click', ()=>{
    auth.signout().then(() =>{
        window.location.href='auth.html';
    });
});

const db = firebase.firestore();

auth.onAuthStateChanged(user => {
  if (user) {
    const userRef = db.collection('users').doc(user.uid);

    userRef.get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        document.querySelector('.profile-card').innerHTML = `
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Name:</strong> ${data.name || 'Not set'}</p>
          <p><strong>Joined:</strong> ${data.joined || 'Unknown'}</p>
          <button id="edit-profile">Edit Profile</button>
        `;
      } else {
        userRef.set({ name: '', joined: new Date().toDateString() });
      }
    });
  } else {
    window.location.href = 'auth.html';
  }
});

const userRef = db.collection('users').doc(auth.currentUser.uid);

document.getElementById('edit-profile').addEventListener('click', () => {
  document.getElementById('edit-profile-form').style.display = 'block';
});

document.getElementById('profile-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const bio = document.getElementById('bio').value;

  userRef.update({ name, bio })
    .then(() => {
      alert('Profile updated!');
      location.reload();
    })
    .catch(error => alert(error.message));
});

document.querySelector('.profile-card').innerHTML = `
  <p><strong>Email:</strong> ${user.email}</p>
  <p><strong>Name:</strong> ${data.name || 'Not set'}</p>
  <p><strong>Bio:</strong> ${data.bio || 'No bio yet'}</p>
  <p><strong>Joined:</strong> ${data.joined || 'Unknown'}</p>
  <button id="edit-profile">Edit Profile</button>
`;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('Service Worker Registered:', registration);
      messaging.useServiceWorker(registration);
    })
    .catch(function(err) {
      console.log('Service Worker registration failed:', err);
    });
}

// Initialize Firebase (already in your app.js)
const messaging = firebase.messaging();

// Request notification permission from the user
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    console.log('Notification permission granted.');

    // Optional: get FCM token
    messaging.getToken({ vapidKey: 'YOUR_VAPID_KEY_HERE' })
      .then((token) => {
        console.log('FCM Token:', token);
        // You can save this token in Firestore for sending notifications
      })
      .catch((err) => {
        console.log('Error getting FCM token:', err);
      });
  } else {
    console.log('Notification permission denied.');
  }
});

constmessaging = firebase.messaging();

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: async function(fetchInfo, successCallback) {
      const snapshot = await db.collection('events').get();
      const events = snapshot.docs.map(doc => doc.data());
      successCallback(events);
    }
  });
  calendar.render();
});

const chatBox = document.getElementById('chat-box');

db.collection('messages')
  .orderBy('timestamp')
  .onSnapshot(snapshot => {
    chatBox.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      chatBox.innerHTML += `<p><strong>${msg.sender}:</strong> ${msg.text}</p>`;
    });
  });

document.getElementById('chat-form').addEventListener('submit', e => {
  e.preventDefault();
  const text = document.getElementById('chat-input').value;
  db.collection('messages').add({
    sender: auth.currentUser.email,
    text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
  e.target.reset();
});

function completeChallenge(userId, challengeId) {
  db.collection('users').doc(userId).update({
    xp: firebase.firestore.FieldValue.increment(10),
    badges: firebase.firestore.FieldValue.arrayUnion('First Challenge')
  });
};

constmessaging = firebase.messaging();

messaging.requestPermission()
  .then(() => messaging.getToken())
  .then(token => {
    console.log('FCM Token:', token);
    // Save token to Firestore for targeting notifications
  })
  .catch(err => console.error('Notification permission denied:', error));

  document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: async function(fetchInfo, successCallback) {
      const snapshot = await db.collection('events').get();
      const events = snapshot.docs.map(doc => doc.data());
      successCallback(events);
    }
  });
  calendar.render();
});

document.getElementById('event-form').addEventListener('submit', async e => {
  e.preventDefault();

  const title = document.getElementById('event-title').value.trim();
  const start = document.getElementById('event-start').value;
  const end = document.getElementById('event-end').value;
  const location = document.getElementById('event-location').value.trim();
  const description = document.getElementById('event-description').value.trim();

  if (!title || !start || !end || !location || !description) {
    alert('Please fill out all fields.');
    return;
  }

  if (new Date(end) < new Date(start)) {
    alert('End date cannot be before start date.');
    return;
  }

  try {
    await db.collection('events').add({ title, start, end, location, description });
    alert('Event submitted successfully!');
    e.target.reset();
  } catch (error) {
    alert('Error submitting event: ' + error.message);
  }
});

document.querySelectorAll('.edit-event').forEach(button => {
  button.addEventListener('click', async () => {
    const eventId = button.parentElement.dataset.id;
    const doc = await db.collection('events').doc(eventId).get();
    const data = doc.data();

    document.getElementById('event-title').value = data.title;
    document.getElementById('event-start').value = data.start;
    document.getElementById('event-end').value = data.end;
    document.getElementById('event-location').value = data.location;
    document.getElementById('event-description').value = data.description;

    // Replace submit logic
    document.getElementById('event-form').onsubmit = async e => {
      e.preventDefault();
      await db.collection('events').doc(eventId).update({
        title: data.title,
        start: data.start,
        end: data.end,
        location: data.location,
        description: data.description
      });
      alert('Event updated!');
      location.reload();
    };
  });
});

document.querySelectorAll('.delete-event').forEach(button => {
  button.addEventListener('click', async () => {
    const eventId = button.parentElement.dataset.id;
    await db.collection('events').doc(eventId).delete();
    alert('Event deleted!');
    location.reload();
  });
});

document.querySelectorAll('.rsvp-button').forEach(button => {
  button.addEventListener('click', async () => {
    const eventId = button.dataset.id;
    const userEmail = auth.currentUser.email;

    await db.collection('events').doc(eventId).update({
      attendees: firebase.firestore.FieldValue.arrayUnion(userEmail)
    });

    alert('You have RSVP to this event!');
    const doc = await db.collection('events').doc(eventId).get();
    const attendees = doc.data().attendees || [];
    document.getElementById('attendee-list').innerHTML = attendees.map(email => `<li>${email}</li>`).join('');
  });
});

const MAX_CAPACITY = 50;

document.querySelectorAll('.rsvp-button').forEach(button => {
  button.addEventListener('click', async () => {
    const eventId = button.dataset.id;
    const doc = await db.collection('events').doc(eventId).get();
    const event = doc.data();

    if ((event.attendees?.length || 0) >= MAX_CAPACITY) {
      alert('Sorry, this event is full.');
      return;
    }

    await db.collection('events').doc(eventId).update({
      attendees: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.email)
    });

    alert('You have RSVP to this event!');
  });
});

const userEmail = auth.currentUser.email;

db.collection('events')
  .where('attendees', 'array-contains', userEmail)
  .get()
  .then(snapshot => {
    const myEventsContainer = document.getElementById('my-events');
    snapshot.forEach(doc => {
      const event = doc.data();
      myEventsContainer.innerHTML += `
        <div class="event-card">
          <h3>${event.title}</h3>
          <p>${event.start} to ${event.end}</p>
          <p>Location: ${event.location}</p>
          <p>Attendees: ${event.attendees?.length || 0}</p>
        </div>
      `;
    });
});

constchatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

db.collection('messages')
  .orderBy('timestamp')
  .onSnapshot(snapshot => {
    chatBox.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      chatBox.innerHTML += `<p><strong>${msg.sender}:</strong> ${msg.text}</p>`;
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = chatInput.value;
  db.collection('messages').add({
    sender: auth.currentUser.email,
    text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
  chatInput.value = '';
});

document.querySelectorAll('.unrsvp-button').forEach(button => {
  button.addEventListener('click', async () => {
    const eventId = button.dataset.id;
    await db.collection('events').doc(eventId).update({
      attendees: firebase.firestore.FieldValue.arrayRemove(auth.currentUser.email)
    });
    alert('Your RSVP has been cancelled.');
    location.reload();
  });
});

document.getElementById('organizer-form').addEventListener('submit', async e => {
  e.preventDefault();
  const message = document.getElementById('organizer-message').value;
  const eventId = CURRENT_EVENT_ID;
  const receiver = ORGANIZER_EMAIL;

  await db.collection('messages').add({
    sender: auth.currentUser.email,
    receiver,
    text: message,
    eventId,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert('Message sent to organizer!');
  e.target.reset();
});

db.collection('users')
  .where('role', '==', 'mentor')
  .get()
  .then(snapshot => {
    const container = document.getElementById('mentor-list');
    snapshot.forEach(doc => {
      const m = doc.data();
      container.innerHTML += `
        <div class="mentor-card">
          <img src="${m.photoUrl}" alt="${m.name}" />
          <h3>${m.name}</h3>
          <p>${m.bio}</p>
          <p><strong>Availability:</strong> ${m.availability}</p>
          <p><strong>Rating:</strong> ${m.rating.toFixed(1)} ⭐</p>
          <button onclick="messageMentor('${m.email}')">Message</button>
        </div>
      `;
    });
});

db.collection('mentors').add({
  email: "tshotetsiteboho@gmail.com",
  role: "mentor",
  name: "Teboho T.",
  bio: "Frontend developer with 5 years of experience in React and UI/UX design.",
  interests: ["React", "Design", "JavaScript"],
  availability: "Weekends 10am–4pm",
  photoUrl: "https://example.com/photo.jpg",
  rating: 4.8,
  reviews: [
    { reviewer: "Teboho", text: "Very helpful and patient!", stars: 5 }
  ]
}).then(() => {
  console.log("Mentor profile added successfully!");
}).catch((error) => {
  console.error("Error adding mentor profile: ", error);
});


document.getElementById('mentor-chat-form').addEventListener('submit', async e => {
  e.preventDefault();
  const text = document.getElementById('mentor-chat-input').value;

  await db.collection('messages').add({
    threadId,
    sender: auth.currentUser.email,
    text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  e.target.reset();
});

document.getElementById('mentor-chat-form').addEventListener('submit', async e => {
  e.preventDefault();
  const text = document.getElementById('mentor-chat-input').value;
  const file = document.getElementById('chat-file').files[0];
  const code = document.getElementById('chat-code').value;
  const threadId = `${auth.currentUser.email}_MENTOR_EMAIL`;

  let fileUrl = null;
  if (file) {
    const storageRef = firebase.storage().ref(`chat_files/${file.name}`);
    await storageRef.put(file);
    fileUrl = await storageRef.getDownloadURL();
  }

  await db.collection('messages').add({
    threadId,
    sender: auth.currentUser.email,
    text,
    codeSnippet: code || null,
    fileUrl: fileUrl || null,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  e.target.reset();
});

db.collection('messages')
  .where('threadId', '==', threadId)
  .orderBy('timestamp')
  .onSnapshot(snapshot => {
    const chatBox = document.getElementById('mentor-chat-box');
    chatBox.innerHTML = '';
    snapshot.forEach(doc =>{
      const msg = doc.data();
      chatBox.innerHTML += `
        <p><strong>${msg.sender}:</strong> ${msg.text}</p>
        ${msg.codeSnippet ? `<pre>${msg.codeSnippet}</pre>` : ''}
        ${msg.fileUrl ? `<a href="${msg.fileUrl}" target="_blank">Download File</a>` : ''}
      `;
    });
});

const userId = auth.currentUser.uid;

db.collection('users').doc(userId).onSnapshot(doc => {
  const data = doc.data();
  const xp = data.xp || 0;
  const badges = data.badges || [];

  const xpPercent = Math.min((xp / 1000) * 100, 100);
  document.getElementById('xp-fill').style.width = `${xpPercent}%`;
  document.getElementById('xp-fill').textContent = `${xp} XP`;

  const badgeList = document.getElementById('badge-list');
  badgeList.innerHTML = badges.map(b => `<li>${b}</li>`).join('');
});

db.collection('users').doc(userId).update({
  xp: firebase.firestore.FieldValue.increment(10),
  badges: firebase.firestore.FieldValue.arrayUnion('First Challenge')
});

async function matchMentorForUser(userEmail) {
  const userDoc = await db.collection('users').doc(userEmail).get();
  const userInterests = userDoc.data().interests;

  const mentorsSnapshot = await db.collection('users')
    .where('role', '==', 'mentor')
    .get();

  let bestMatch = null;
  let highestOverlap = 0;

  mentorsSnapshot.forEach(doc => {
    const mentor = doc.data();
    const overlap = mentor.interests.filter(i => userInterests.includes(i)).length;
    if (overlap > highestOverlap) {
      highestOverlap = overlap;
      bestMatch = mentor.email;
    }
  });

  if (bestMatch) {
    await db.collection('matches').add({
      menteeEmail: userEmail,
      mentorEmail: bestMatch,
      matchedOn: new Date().toISOString()
    });
    alert(`You have been matched with mentor: ${bestMatch}`);
  } else {
    alert('No suitable mentor found yet.');
  }
};

document.getElementById('review-form').addEventListener('submit', async e => {
  e.preventDefault();
  const text = document.getElementById('review-text').value;
  const stars = parseInt(document.getElementById('review-stars').value);
  const mentorEmail = SELECTED_MENTOR_EMAIL;

  await db.collection('users').doc(mentorEmail).update({
    reviews: firebase.firestore.FieldValue.arrayUnion({
      reviewer: auth.currentUser.displayName,
      text,
      stars
    })
  });

  alert('Review submitted!');
});

constuserId = auth.currentUser.uid;

db.collection('challenges').get().then(snapshot => {
  const container = document.getElementById('challenge-container');
  snapshot.forEach(doc => {
    const challenge = doc.data();
    const completed = challenge.completedBy?.includes(userId);

    container.innerHTML += `
      <div class="challenge-card">
        <h3>${challenge.title}</h3>
        <p>${challenge.description}</p>
        <p><strong>XP:</strong> ${challenge.xpReward}</p>
        ${completed ? '<p>✅ Completed</p>' : `<button onclick="completeChallenge('${doc.id}', ${challenge.xpReward})">Complete</button>`}
      </div>
    `;
  });
});

function completeChallenge(challengeId, xpReward) {
  const userRef = db.collection('users').doc(userId);
  const challengeRef = db.collection('challenges').doc(challengeId);

  userRef.update({
    xp: firebase.firestore.FieldValue.increment(xpReward)
  });

  challengeRef.update({
    completedBy: firebase.firestore.FieldValue.arrayUnion(userId)
  });

  alert(`Challenge completed! You earned ${xpReward} XP.`);
  location.reload();
}

document.getElementById('challenge-filter').addEventListener('change', async e => {
  const selectedLevel = e.target.value;
  const container = document.getElementById('challenge-container');
  container.innerHTML = '';

  let query = db.collection('challenges');
  if (selectedLevel !== 'All') {
    query = query.where('level', '==', selectedLevel);
  }

  const snapshot = await query.get();
  snapshot.forEach(doc => {
    const challenge = doc.data();
    container.innerHTML += `
      <div class="challenge-card">
        <h3>${challenge.title}</h3>
        <p>${challenge.description}</p>
        <p><strong>XP:</strong> ${challenge.xpReward}</p>
        <p><strong>Level:</strong> ${challenge.level}</p>
        <button onclick="completeChallenge('${doc.id}', ${challenge.xpReward})">Complete</button>
      </div>
    `;
  });
});

async function updateStreak(userId) {
  const userRef = db.collection('users').doc(userId);
  const doc = await userRef.get();
  const data = doc.data();

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let newStreak = 1;
  if (data.lastCompleted === yesterday) {
    newStreak = (data.streak || 0) + 1;
  }

  await userRef.update({
    lastCompleted: today,
    streak: newStreak
  });
}

db.collection('users')
  .orderBy('xp', 'desc')
  .limit(10)
  .get()
  .then(snapshot => {
    const leaderboard = document.getElementById('leaderboard');
    snapshot.forEach(doc => {
      const user = doc.data();
      leaderboard.innerHTML += `
        <div class="leaderboard-entry">
          <strong>${user.username}</strong> — ${user.xp} XP — 🔥 Streak: ${user.streak || 0}
        </div>
      `;
    });
  });

  if (newStreak === 5) {
  await userRef.update({
    badges: firebase.firestore.FieldValue.arrayUnion("5-Day Streak")
  });
}
if (newStreak === 10) {
  await userRef.update({
    badges: firebase.firestore.FieldValue.arrayUnion("10-Day Streak")
  });
}
document.getElementById('badge-list').innerHTML = badges.map(b => `<li>🏅 ${b}</li>`).join('');

document.getElementById('friend-challenge-form').addEventListener('submit', async e => {
  e.preventDefault();
  const friendEmail = document.getElementById('friend-email').value;
  const challengeId = document.getElementById('challenge-id').value;

  await db.collection('challenges').doc(challengeId).update({
    challenged: firebase.firestore.FieldValue.arrayUnion(friendEmail)
  });

  alert('Challenge sent!');
});

db.collection('matches')
  .where('mentorEmail', '==', mentorEmail)
  .get()
  .then(async snapshot => {
    let totalXP = 0;
    let totalChallenges = 0;

    for (const doc of snapshot.docs) {
      const menteeEmail = doc.data().menteeEmail;
      const menteeDoc = await db.collection('users').doc(menteeEmail).get();
      const menteeData = menteeDoc.data();
      totalXP += menteeData.xp || 0;
      totalChallenges += menteeData.completedChallenges?.length || 0;
    }

    document.getElementById('mentor-impact').innerHTML = `
      <h3>🌟 Your Impact</h3>
      <p>Total XP Earned by Mentees: ${totalXP}</p>
      <p>Total Challenges Completed: ${totalChallenges}</p>
    `;
  });

  auth.onAuthStateChanged(user => {
  if (!user) window.location.href = 'index.html';
  else loadUserData(user);
});
import { getAuth, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

constauth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (!user) {
            window.location.href = "auth.html";
    } else {
        document.querySelector(".profile-card").innerHTML = `
            <p><strong>Email:</strong> ${user.email}</p>
            <button id="logout">Logout</button>
        `;
    }
});

// Main: when a message is sent
  function sendMessageHandler() {
    const txt = messageInput.value.trim();
    if (!txt) return;
    // Show message in chat UI
    appendChatMessage(txt, 'user');

    // 1) try to find existing pack(s) that match message
    const matches = findMatchingPacks(txt);

    if (matches.length > 0) {
      // show all matching packs on dashboard
      matches.forEach(pack => renderPackOnDashboard(pack));
      appendChatMessage(`Found ${matches.length} matching pack(s) and displayed them.`, 'system');
    } else {
      // create temporary pack from message and display it
      const tempPack = createPackFromMessage(txt);
      renderPackOnDashboard(tempPack);
      appendChatMessage('Created a temporary pack from your message and displayed it on the dashboard.', 'system');
      // Optionally automatically save to storage — comment/uncomment as desired:
      // const packs = loadPacks(); packs.unshift(tempPack); savePacks(packs);
    }

    // Clear input & scroll chat
    messageInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Small utility to show messages in chat area
  function appendChatMessage(text, role = 'user') {
    const p = document.createElement('div');
    p.className = 'chat-msg ' + (role === 'user' ? 'chat-user' : 'chat-system');
    p.textContent = text;
    chatMessages.appendChild(p);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Escaping helpers
  function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Flash helper (reuse from packs code if available)
  function flash(msg) {
    const el = document.createElement('div'); el.textContent = msg;
    Object.assign(el.style, { position:'fixed', right:'20px', bottom:'20px', background:'#222', color:'#fff', padding:'8px 12px', borderRadius:'8px', zIndex:9999 });
    document.body.appendChild(el);
    setTimeout(()=> el.style.opacity='0.01', 1400); setTimeout(()=> el.remove(), 1800);
  }

  // Attach events
  if (sendBtn) sendBtn.addEventListener('click', sendMessageHandler);
  if (messageInput) messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessageHandler(); });

  // Optional: on page load, show the top 3 packs already in storage
  (function showTopPacksOnLoad() {
    const packs = loadPacks();
    if (packs && packs.length) {
      packs.slice(0,3).forEach(p => renderPackOnDashboard(p));
    } else {
      // show nothing or sample message
      // dashboardPacks.innerHTML = '<div class="muted">No packs yet — send message to create one.</div>';
    }
  })();

});
