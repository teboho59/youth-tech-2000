const mentorEmail = auth.currentUser.email;

// Load mentees
db.collection('matches')
  .where('mentorEmail', '==', mentorEmail)
  .get()
  .then(snapshot => {
    const container = document.getElementById('mentee-container');
    snapshot.forEach(doc => {
      const mentee = doc.data().menteeEmail;
      container.innerHTML += `<p>${mentee}</p>`;
    });
  });

// Load messages
db.collection('messages')
  .where('receiver', '==', mentorEmail)
  .orderBy('timestamp')
  .onSnapshot(snapshot => {
    const chatBox = document.getElementById('mentor-chat-box');
    chatBox.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      chatBox.innerHTML += `<p><strong>${msg.sender}:</strong> ${msg.text}</p>`;
    });
  });

// Send reply
document.getElementById('mentor-chat-form').addEventListener('submit', async e => {
  e.preventDefault();
  const text = document.getElementById('mentor-chat-input').value;

  await db.collection('messages').add({
    sender: mentorEmail,
    receiver: SELECTED_MENTEE_EMAIL,
    text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  e.target.reset();
});

// Update profile
document.getElementById('mentor-profile-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('mentor-name').value;
  const bio = document.getElementById('mentor-bio').value;
  const availability = document.getElementById('mentor-availability').value;

  await db.collection('users').doc(mentorEmail).update({
    name, bio, availability
  });

  alert('Profile updated!');
});

async function loadMenteeProgress(menteeEmail) {
  const doc = await db.collection('users').doc(menteeEmail).get();
  const data = doc.data();

  const container = document.getElementById('mentee-container');
  container.innerHTML += `
    <div class="mentee-progress">
      <h4>${menteeEmail}</h4>
      <p>XP: ${data.xp}</p>
      <p>Badges: ${data.badges?.join(', ') || 'None'}</p>
      <p>Challenges Completed: ${data.completedChallenges?.length || 0}</p>
    </div>
  `;
}

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

  document.getElementById('mentor-chat-form').addEventListener('submit', async e => {
  e.preventDefault();
  const text = document.getElementById('mentor-chat-input').value;
  const file = document.getElementById('mentor-chat-file').files[0];
  const code = document.getElementById('mentor-chat-code').value;
  const receiver = SELECTED_MENTEE_EMAIL;

  let fileUrl = null;
  if (file) {
    const storageRef = firebase.storage().ref(`chat_files/${file.name}`);
    await storageRef.put(file);
    fileUrl = await storageRef.getDownloadURL();
  }

  await db.collection('messages').add({
    sender: mentorEmail,
    receiver,
    text,
    codeSnippet: code || null,
    fileUrl: fileUrl || null,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  e.target.reset();
});

document.getElementById('goal-form').addEventListener('submit', async e => {
  e.preventDefault();
  const menteeEmail = document.getElementById('mentee-email').value;
  const goal = document.getElementById('goal-text').value;
  const deadline = document.getElementById('goal-deadline').value;

  await db.collection('goals').add({
    menteeEmail,
    mentorEmail: auth.currentUser.email,
    goal,
    deadline,
    feedback: []
  });

  alert('Goal set!');
});

document.getElementById('feedback-form').addEventListener('submit', async e => {
  e.preventDefault();
  const menteeEmail = document.getElementById('feedback-mentee').value;
  const feedbackText = document.getElementById('feedback-text').value;

  const snapshot = await db.collection('goals')
    .where('menteeEmail', '==', menteeEmail)
    .where('mentorEmail', '==', auth.currentUser.email)
    .get();

  if (!snapshot.empty) {
    const goalDoc = snapshot.docs[0];
    await goalDoc.ref.update({
      feedback: firebase.firestore.FieldValue.arrayUnion({
        text: feedbackText,
        timestamp: new Date().toISOString()
      })
    });
    alert('Feedback sent!');
  } else {
    alert('No goal found for this mentee.');
  }
});

document.getElementById('session-form').addEventListener('submit', async e => {
  e.preventDefault();
  const menteeEmail = document.getElementById('session-mentee').value;
  const date = document.getElementById('session-date').value;
  const topic = document.getElementById('session-topic').value;

  await db.collection('sessions').add({
    mentorEmail: auth.currentUser.email,
    menteeEmail,
    date,
    topic,
    reminderSent: false
  });

  alert('Session scheduled!');
});

db.collection('matches').get().then(async snapshot => {
  const mentorStats = {};

  for (const doc of snapshot.docs) {
    const { mentorEmail, menteeEmail } = doc.data();
    const menteeDoc = await db.collection('users').doc(menteeEmail).get();
    const xp = menteeDoc.data().xp || 0;

    mentorStats[mentorEmail] = (mentorStats[mentorEmail] || 0) + xp;
  }

  const leaderboard = Object.entries(mentorStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const container = document.getElementById('mentor-leaderboard');
  leaderboard.forEach(([email, xp]) => {
    container.innerHTML += `<p><strong>${email}</strong> — ${xp} mentee XP</p>`;
  });
});

auth.onAuthStateChanged(user => {
  if (!user) window.location.href = 'dashboad.html';
  else loadUserData(user);
});
document.getElementById('assign-challenge-form').addEventListener('submit', async e => {
  e.preventDefault();
  const menteeEmail = document.getElementById('mentee-email').value;
  const challengeId = document.getElementById('assign-challenge-id').value;

  await db.collection('mentorAssigned').add({
    mentorEmail: auth.currentUser.email,
    menteeEmail,
    challengeId,
    assignedOn: new Date().toISOString()
  });

  alert('Challenge assigned!');
});
db.collection('challenges').get().then(snapshot => {
  const container = document.getElementById('challenge-checkboxes');
  snapshot.forEach(doc => {
    const c = doc.data();
    container.innerHTML += `
      <label>
        <input type="checkbox" value="${doc.id}" />
        ${c.title} (${c.xpReward} XP)
      </label><br/>
    `;
  });
});
document.getElementById('custom-pack-form').addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('pack-title').value;
  const menteeEmail = document.getElementById('mentee-email').value;
  const notes = document.getElementById('pack-notes').value;
  const mentorEmail = auth.currentUser.email;

  const selectedChallenges = Array.from(document.querySelectorAll('#challenge-checkboxes input:checked'))
    .map(cb => cb.value);

  await db.collection('customPacks').add({
    title,
    mentorEmail,
    menteeEmail,
    challenges: selectedChallenges,
    notes,
    createdOn: new Date().toISOString()
  });

  alert('Custom pack created!');
  e.target.reset();
});

document.addEventListener("DOMContentLoaded", function () {
  const sendBtn = document.getElementById("sendBtn");
  const messageInput = document.getElementById("messageInput");
  const chatMessages = document.getElementById("chatMessages");

  // When send button is clicked
  sendBtn.addEventListener("click", sendMessage);

  // Optional: Press Enter to send
  messageInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

  function sendMessage() {
    const messageText = messageInput.value.trim(); 

    if (messageText === "") return; 

    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "user-message");
    messageElement.textContent = messageText;

    // Add it to the chat area
    chatMessages.appendChild(messageElement);

    // Clear input
    messageInput.value = "";

    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      const botMessage = document.createElement("div");
      botMessage.classList.add("message", "bot-message");
      botMessage.textContent = "Thanks for your message! 👋";
      chatMessages.appendChild(botMessage);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
  }
});
