db.collection('bursaries').get().then(snapshot => {
  const container = document.getElementById('bursary-container');
  snapshot.forEach(doc => {
    const b = doc.data();
    container.innerHTML += `
      <div class="opportunity-card">
        <h3>${b.title}</h3>
        <p><strong>Provider:</strong> ${b.provider}</p>
        <p>${b.requirements}</p>
        <p><strong>Deadline:</strong> ${b.deadline}</p>
        <a href="${b.applyLink}" target="_blank">Apply Now</a>
      </div>
    `;
  });
});
async function applyOpportunityFilters() {
  const location = document.getElementById('location-filter').value;
  const skill = document.getElementById('skill-filter').value;
  const deadline = document.getElementById('deadline-filter').value;
  let query = db.collection('internships');

  if (location !== 'All') query = query.where('location', '==', location);
  if (skill !== 'All') query = query.where('skills', 'array-contains', skill);
  if (deadline) query = query.where('deadline', '<=', deadline);

  const snapshot = await query.get();
  const container = document.getElementById('internship-container');
  container.innerHTML = '';
  snapshot.forEach(doc => {
    const i = doc.data();
    container.innerHTML += `<p>${i.title} — ${i.location}</p>`;
  });
}
document.getElementById('recommend-form').addEventListener('submit', async e => {
  e.preventDefault();
  const mentorEmail = auth.currentUser.email;
  const menteeEmail = document.getElementById('mentee-email').value;
  const opportunityId = document.getElementById('opportunity-id').value;
  const note = document.getElementById('recommend-note').value;

  await db.collection('recommendations').add({
    mentorEmail,
    menteeEmail,
    opportunityId,
    type: "internship",
    note,
    recommendedOn: new Date().toISOString()
  });

  alert('Recommendation sent!');
});
db.collection('companies').get().then(snapshot => {
  const container = document.getElementById('company-list');
  snapshot.forEach(doc => {
    const c = doc.data();
    container.innerHTML += `
      <div class="company-card">
        <h3>${c.name}</h3>
        <p><strong>Industry:</strong> ${c.industry}</p>
        <p><strong>Location:</strong> ${c.location}</p>
        <p><strong>Mentors:</strong> ${c.mentors.join(', ')}</p>
        <a href="${c.website}" target="_blank">Visit Website</a>
      </div>
    `;
  });
});
const userEmail = auth.currentUser.email;

db.collection('users').doc(userEmail).get().then(doc => {
  const data = doc.data();
  document.getElementById('xp-summary').innerHTML = `
    <h3>🎮 XP & Badges</h3>
    <p>Total XP: ${data.xp}</p>
    <p>Badges: ${data.badges?.join(', ') || 'None yet'}</p>
  `;
});

db.collection('goals')
  .where('menteeEmail', '==', userEmail)
  .get()
  .then(snapshot => {
    const container = document.getElementById('goal-summary');
    container.innerHTML = '<h3>🎯 Goals</h3>';
    snapshot.forEach(doc => {
      const g = doc.data();
      container.innerHTML += `<p>${g.goal} — ${g.progress}/${g.target}</p>`;
    });
  });

db.collection('applications')
  .where('userEmail', '==', userEmail)
  .get()
  .then(snapshot => {
    const container = document.getElementById('application-summary');
    container.innerHTML = '<h3>📋 Applications</h3>';
    snapshot.forEach(doc => {
      const a = doc.data();
      container.innerHTML += `<p>${a.title} — ${a.status}</p>`;
    });
});
  db.collection('feedback')
  .where('menteeEmail', '==', auth.currentUser.email)
  .orderBy('timestamp', 'desc')
  .get()
  .then(snapshot => {
    const container = document.getElementById('feedback-list');
    snapshot.forEach(doc => {
      const f = doc.data();
      container.innerHTML += `
        <p><strong>${f.mentorEmail}:</strong> ${f.text}</p>
      `;
    });
});
async function bookmarkOpportunity(itemId, title) {
  await db.collection('bookmarks').add({
    userEmail: auth.currentUser.email,
    type: "internship",
    itemId,
    title,
    bookmarkedOn: new Date().toISOString()
  });
  alert('Bookmarked!');
}

db.collection('bookmarks')
  .where('userEmail', '==', auth.currentUser.email)
  .get()
  .then(snapshot => {
    const container = document.getElementById('bookmark-list');
    snapshot.forEach(doc => {
      const b = doc.data();
      container.innerHTML += `<p>${b.title} (${b.type})</p>`;
    });
});