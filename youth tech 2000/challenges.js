const userEmail = auth.currentUser.email;

// Load challenges into dropdown
db.collection('challenges').get().then(snapshot => {
  const select = document.getElementById('challenge-id');
  snapshot.forEach(doc => {
    const c = doc.data();
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = `${c.title} (${c.xpReward} XP)`;
    select.appendChild(option);
  });
});

// Send challenge
document.getElementById('friend-challenge-form').addEventListener('submit', async e => {
  e.preventDefault();
  const friendEmail = document.getElementById('friend-email').value;
  const challengeId = document.getElementById('challenge-id').value;

  await db.collection('challenges').doc(challengeId).update({
    challenged: firebase.firestore.FieldValue.arrayUnion(friendEmail)
  });

  alert('Challenge sent!');
  e.target.reset();
});

// Display sent challenges
db.collection('challenges')
  .where('challenger', '==', userEmail)
  .get()
  .then(snapshot => {
    const container = document.getElementById('sent-challenges');
    snapshot.forEach(doc => {
      const c = doc.data();
      container.innerHTML += `<p>${c.title} → ${c.challenged.join(', ')}</p>`;
    });
  });

// Display received challenges
db.collection('challenges')
  .where('challenged', 'array-contains', userEmail)
  .get()
  .then(snapshot => {
    const container = document.getElementById('received-challenges');
    snapshot.forEach(doc => {
      const c = doc.data();
      container.innerHTML += `<p>${c.title} from ${c.challenger}</p>`;
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
auth.onAuthStateChanged(user => {
  if (!user) window.location.href = 'index.html';
  else loadUserData(user);
});

document.getElementById('skill-filter').addEventListener('change', async e => {
  const selectedSkill = e.target.value;
  const container = document.getElementById('challenge-container');
  container.innerHTML = '';

  let query = db.collection('challenges');
  if (selectedSkill !== 'All') {
    query = query.where('skills', 'array-contains', selectedSkill);
  }

  const snapshot = await query.get();
  snapshot.forEach(doc => {
    const c = doc.data();
    container.innerHTML += `
      <div class="challenge-card">
        <h3>${c.title}</h3>
        <p>${c.description}</p>
        <p><strong>XP:</strong> ${c.xpReward}</p>
        <p><strong>Skills:</strong> ${c.skills.join(', ')}</p>
      </div>
    `;
  });
});
db.collection('challengePacks').get().then(snapshot => {
  const container = document.getElementById('pack-container');
  snapshot.forEach(doc => {
    const pack = doc.data();
    container.innerHTML += `
      <div class="pack-card">
        <h3>${pack.title}</h3>
        <p>Theme: ${pack.theme}</p>
        <p>Active: ${pack.startDate} to ${pack.endDate}</p>
        <p>Challenges: ${pack.challenges.join(', ')}</p>
      </div>
    `;
  });
});