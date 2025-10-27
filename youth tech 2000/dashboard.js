db.collection('customPacks')
  .where('menteeEmail', '==', auth.currentUser.email)
  .get()
  .then(snapshot => {
    const container = document.getElementById('assigned-pack-list');
    snapshot.forEach(doc => {
      const pack = doc.data();
      container.innerHTML += `
        <div class="pack-card">
          <h3>${pack.title}</h3>
          <p><strong>From:</strong> ${pack.mentorEmail}</p>
          <p><strong>Notes:</strong> ${pack.notes}</p>
          <p><strong>Challenges:</strong> ${pack.challenges.join(', ')}</p>
        </div>
      `;
    });
  });
  async function loadPackForEdit() {
  const packId = document.getElementById('pack-selector').value;
  const doc = await db.collection('customPacks').doc(packId).get();
  const pack = doc.data();

  document.getElementById('pack-title').value = pack.title;
  document.getElementById('mentee-email').value = pack.menteeEmail;
  document.getElementById('pack-notes').value = pack.notes;

  // Pre-check selected challenges
  document.querySelectorAll('#challenge-checkboxes input').forEach(cb => {
    cb.checked = pack.challenges.includes(cb.value);
  });
}

async function clonePack() {
  const packId = document.getElementById('pack-selector').value;
  const doc = await db.collection('customPacks').doc(packId).get();
  const pack = doc.data();

  await db.collection('customPacks').add({
    ...pack,
    createdOn: new Date().toISOString(),
    title: pack.title + " (Clone)"
  });

  alert('Pack cloned!');
}
if (completed.length === pack.challenges.length) {
  await db.collection('users').doc(userEmail).update({
    badges: firebase.firestore.FieldValue.arrayUnion(`Completed: ${pack.title}`)
  });
}
document.getElementById('badge-list').innerHTML = badges.map(b => `<li> ${b}</li>`).join('');

document.getElementById('pack-feedback-form').addEventListener('submit', async e => {
  e.preventDefault();
  const packId = document.getElementById('pack-id').value;
  const stars = parseInt(document.getElementById('pack-stars').value);
  const feedback = document.getElementById('pack-feedback').value;

  await db.collection('customPacks').doc(packId).update({
    ratings: firebase.firestore.FieldValue.arrayUnion({
      menteeEmail: auth.currentUser.email,
      stars,
      feedback
    })
  });

  alert('Feedback submitted!');
});

let messages = JSON.parse(localStorage.getItem("yc_messages") || "[]");

function renderMessages() {
  display.innerHTML = "";
  messages.forEach(msg => {
    const p = document.createElement("p");
    p.textContent = msg;
    display.appendChild(p);
  });
}

renderMessages();

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const message = input.value.trim();
  if (message) {
    messages.push(message);
    localStorage.setItem("yc_messages", JSON.stringify(messages));
    renderMessages();
    input.value = "";
  }
});

// packs-edit-clone.js
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'yc_packs_v2';
  const grid = document.getElementById('packsGrid');

  // Modal & form elements
  const modal = document.getElementById('packModal');
  const form = document.getElementById('packForm');
  const titleEl = document.getElementById('packTitle');
  const descEl = document.getElementById('packDesc');
  const linkEl = document.getElementById('packLink');
  const cancelBtn = document.getElementById('packCancel');
  const modalTitle = document.getElementById('packModalTitle');

  let packs = loadPacks();
  let editingId = null; // null => create, id => edit

  // Render initial packs
  render();

  // Delegated click handler for actions: open/edit/clone/delete
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const card = btn.closest('.pack-card');
    const id = card && card.dataset.id;
    if (!id) return;

    if (action === 'open') {
      const pack = packs.find(p => p.id === id);
      if (pack && pack.link) window.location.href = pack.link;
      else alert('No link defined for this pack.');
    } else if (action === 'edit') {
      openEditModal(id);
    } else if (action === 'clone') {
      clonePack(id);
    } else if (action === 'delete') {
      if (confirm('Delete this pack?')) deletePack(id);
    }
  });

  // Form submit: save edit or create
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const data = {
      title: titleEl.value.trim(),
      description: descEl.value.trim(),
      link: linkEl.value.trim()
    };
    if (!data.title) return alert('Title required');
    if (editingId) {
      // update
      const p = packs.find(x => x.id === editingId);
      if (p) { p.title = data.title; p.description = data.description; p.link = data.link; p.updatedAt = Date.now(); }
    } else {
      // create
      packs.unshift({ id: genId(), ...data, createdAt: Date.now() });
    }
    savePacks();
    closeModal();
    render();
  });

  cancelBtn.addEventListener('click', () => { closeModal(); });

  // functions
  function render() {
    grid.innerHTML = '';
    if (!packs || packs.length === 0) {
      grid.innerHTML = '<div class="muted">No packs yet. Create one by using the + New Pack button (or add sample packs in localStorage).</div>';
      return;
    }
    packs.forEach(p => {
      const el = document.createElement('article');
      el.className = 'pack-card';
      el.dataset.id = p.id;
      el.innerHTML = `
        <h3>${escapeHtml(p.title)}</h3>
        <div class="pack-meta">${escapeHtml(p.description || '')}</div>
        <div class="pack-actions">
          <button data-action="open" class="btn-open">Open</button>
          <button data-action="edit" class="btn-edit">Edit</button>
          <button data-action="clone" class="btn-clone">Clone</button>
          <button data-action="delete" class="btn-delete">Delete</button>
        </div>
      `;
      grid.appendChild(el);
    });
  }

  function openEditModal(id) {
    const p = packs.find(x => x.id === id);
    if (!p) return;
    editingId = id;
    modalTitle.textContent = 'Edit Pack';
    titleEl.value = p.title;
    descEl.value = p.description || '';
    linkEl.value = p.link || '';
    openModal();
  }

  function openModal() {
    modal.classList.remove('hide');
    modal.setAttribute('aria-hidden', 'false');
    titleEl.focus();
  }
  function closeModal() {
    modal.classList.add('hide');
    modal.setAttribute('aria-hidden', 'true');
    editingId = null;
    form.reset();
  }

  function clonePack(id) {
    const p = packs.find(x => x.id === id);
    if (!p) return;
    const copy = { ...p, id: genId(), title: p.title + ' (Clone)', createdAt: Date.now() };
    packs.unshift(copy);
    savePacks();
    render();
    flash('Cloned ✓');
  }

  function deletePack(id) {
    packs = packs.filter(x => x.id !== id);
    savePacks();
    render();
    flash('Deleted');
  }

  // localStorage helpers
  function loadPacks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return samplePacks();
      return JSON.parse(raw);
    } catch (err) {
      console.error(err);
      return samplePacks();
    }
  }
  function savePacks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(packs)); }

  // tiny helpers
  function genId() { return 'pk_' + Math.random().toString(36).slice(2,9); }
  function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function flash(msg){
    const el = document.createElement('div'); el.textContent = msg;
    Object.assign(el.style,{position:'fixed',right:'20px',bottom:'20px',background:'#222',color:'#fff',padding:'8px 12px',borderRadius:'8px',zIndex:9999});
    document.body.appendChild(el); setTimeout(()=> el.style.opacity='0.01',1400); setTimeout(()=> el.remove(),1800);
  }

  // sample starter packs (only used if no localStorage)
  function samplePacks(){
    return [
      { id: genId(), title: 'Uber App', description: 'Driver & rider flows + maps', link: 'uber.html', createdAt: Date.now() },
      { id: genId(), title: 'Food Delivery', description: 'Orders, menu & checkout', link: '', createdAt: Date.now() }
    ];
  }

  // Allow modal close on Escape or outside click
  modal.addEventListener('click', (ev) => { if (ev.target === modal) closeModal(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModal(); });

  // initial UI: optional create button injection (if you want a "New Pack")
  // You can add a button in your page and call openCreate() - simple example:
  const createBtn = document.getElementById('createPackBtn');
  if (createBtn) createBtn.addEventListener('click', () => { editingId = null; modalTitle.textContent = 'Create Pack'; openModal(); });

});

// chat-to-pack-display.js
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'yc_packs_v2'; // same key used by packs module
  // Chat DOM
  const sendBtn = document.getElementById('sendBtn');
  const messageInput = document.getElementById('messageInput');
  const chatMessages = document.getElementById('chatMessages');

  // Dashboard packs container
  const dashboardPacks = document.getElementById('dashboardPacks');

  // load packs from storage
  function loadPacks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('loadPacks error', e);
      return [];
    }
  }
  function savePacks(packs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
  }

  // Render a pack short card into the dashboard packs area
  function renderPackOnDashboard(pack) {
    // avoid duplicate display for same id
    if (dashboardPacks.querySelector(`[data-id="${pack.id}"]`)) return;

    const el = document.createElement('article');
    el.className = 'dashboard-pack';
    el.dataset.id = pack.id;
    el.innerHTML = `
      <h4>${escapeHtml(pack.title)}</h4>
      <p>${escapeHtml(pack.description || 'No description')}</p>
      <div class="small-actions">
        <button class="open-btn">Open</button>
        <button class="save-btn">Save to Packs</button>
      </div>
    `;
    // open action
    el.querySelector('.open-btn').addEventListener('click', () => {
      if (pack.link) window.location.href = pack.link;
      else alert('No link configured for this pack.');
    });
    // save action: ensure pack exists in storage (if temporary)
    el.querySelector('.save-btn').addEventListener('click', () => {
      const packs = loadPacks();
      if (!packs.some(p => p.id === pack.id)) {
        packs.unshift(pack);
        savePacks(packs);
        flash('Pack saved to your packs list');
      } else flash('Pack already saved');
    });

    dashboardPacks.prepend(el);
  }

  // Try to find packs by matching message text to title (case-insensitive)
  function findMatchingPacks(message) {
    const packs = loadPacks();
    const q = message.trim().toLowerCase();
    if (!q) return [];
    return packs.filter(p => {
      return (p.title && p.title.toLowerCase().includes(q)) ||
             (p.description && p.description.toLowerCase().includes(q));
    });
  }

  // Create a temporary pack from message
  function createPackFromMessage(message) {
    const id = 'pk_msg_' + Math.random().toString(36).slice(2,9);
    const shortTitle = message.length > 40 ? message.slice(0,40) + '...' : message;
    return {
      id,
      title: shortTitle || 'New Pack',
      description: 'Created from message: ' + message,
      link: '',
      createdAt: Date.now()
    };
  }

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
