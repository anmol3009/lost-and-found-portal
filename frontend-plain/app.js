// Simple frontend-only app for Lost & Found portal
const items = [
  { id: '1', name: 'Black Wallet', location: 'Library, C-Block', date: '2025-02-12', description: 'Leather wallet with a silver logo on the front.', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa0?q=80&w=1200&auto=format&fit=crop' },
  { id: '2', name: 'Water Bottle', location: 'Mechanical Dept. Lobby', date: '2025-01-29', description: 'Blue insulated bottle with sticker of mountains.', image: 'https://images.unsplash.com/photo-1545165375-1b744b9bb2bd?q=80&w=1200&auto=format&fit=crop' },
  { id: '3', name: 'Calculator', location: 'Exam Hall 3', date: '2025-02-02', description: 'Casio scientific calculator, minor scratches on back.', image: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=1200&auto=format&fit=crop' }
];

const itemsGrid = document.getElementById('itemsGrid');
const toastEl = document.getElementById('toast');
const claimModal = document.getElementById('claimModal');
const claimForm = document.getElementById('claimForm');

function showToast(text, ms = 3000){
  const el = document.createElement('div'); el.className = 'msg'; el.textContent = text;
  toastEl.appendChild(el);
  setTimeout(()=> el.remove(), ms);
}

function renderItems(){
  itemsGrid.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div'); card.className = 'card-item';
    const thumb = document.createElement('div'); thumb.className = 'thumb';
    const img = document.createElement('img'); img.src = item.image; img.alt = item.name; img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover';
    thumb.appendChild(img);
    const content = document.createElement('div'); content.className = 'content';
    const h4 = document.createElement('h4'); h4.textContent = item.name;
    const loc = document.createElement('p'); loc.textContent = item.location;
    const date = document.createElement('small'); date.style.color='#94a3b8'; date.textContent = (new Date(item.date)).toLocaleDateString();
    const desc = document.createElement('p'); desc.textContent = item.description;
    const btn = document.createElement('button'); btn.className='claim-btn'; btn.textContent='Claim Item';
    btn.addEventListener('click', ()=> openClaim(item));
    content.append(h4, loc, date, desc, btn);
    card.append(thumb, content);
    itemsGrid.appendChild(card);
  });
}

function openClaim(item){
  claimModal.setAttribute('aria-hidden','false');
  claimForm.itemId.value = item.id;
  document.getElementById('claimTitle').textContent = `Claim “${item.name}”`;
}

function closeClaim(){
  claimModal.setAttribute('aria-hidden','true');
  claimForm.reset();
}

document.querySelectorAll('[data-close]').forEach(el=> el.addEventListener('click', closeClaim));
document.querySelector('.modal-close').addEventListener('click', closeClaim);

claimForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(claimForm);
  showToast('Claim request submitted — we will contact you.');
  closeClaim();
});

document.getElementById('foundForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const obj = {
    id: String(Date.now()),
    name: fd.get('itemName'),
    location: fd.get('locationFound'),
    date: fd.get('dateFound') || new Date().toISOString().slice(0,10),
    description: fd.get('description'),
    image: ''
  };
  const file = fd.get('photo');
  if (file && file.size) {
    obj.image = URL.createObjectURL(file);
  } else {
    obj.image = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop';
  }
  items.unshift(obj);
  renderItems();
  e.target.reset();
  showToast('Found item submitted.');
  location.hash = '#gallery';
});

document.getElementById('lostForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const obj = {
    id: String(Date.now()),
    name: fd.get('itemName'),
    location: fd.get('locationLost'),
    date: fd.get('dateLost') || new Date().toISOString().slice(0,10),
    description: fd.get('description'),
    image: ''
  };
  const file = fd.get('photo');
  if (file && file.size) {
    obj.image = URL.createObjectURL(file);
  } else {
    obj.image = 'https://images.unsplash.com/photo-1498842812179-c81beecf902c?q=80&w=1200&auto=format&fit=crop';
  }
  items.unshift(obj);
  renderItems();
  e.target.reset();
  showToast('Lost item reported.');
  location.hash = '#gallery';
});

// initialize
renderItems();
