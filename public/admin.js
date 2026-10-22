const $ = (s) => document.querySelector(s);
const adminKey = () => $('#adminKey').value.trim();

async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey(),
      ...(opts.headers || {})
    }
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

/* Load partners list */
async function loadPartners() {
  try {
    const partners = await api('/api/partners');
    const tbody = $('#partnersTable tbody');
    tbody.innerHTML = '';
    if (!partners.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="muted">No partners yet.</td></tr>';
      return;
    }
    partners.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHtml(p.name)}</strong><div class="muted">${escapeHtml(p.company || '')}</div></td>
        <td>${p.click_count}</td>
        <td>${p.lead_count}</td>
        <td><span class="badge ${p.status}">${p.status}</span></td>
        <td><button class="small ghost" data-id="${p.id}">View</button></td>
      `;
      tr.querySelector('button').addEventListener('click', () => showPartner(p.id));
      tbody.appendChild(tr);
    });
  } catch (e) {
    alert(e.message);
  }
}

/* Show partner detail + leads */
async function showPartner(id) {
  try {
    const p = await api(`/api/partners/${id}`);
    const panel = $('#detailPanel');
    panel.style.display = 'block';
    $('#detailTitle').textContent = `Partner: ${p.name}`;

    const leadsHtml = p.leads.length
      ? `<table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Type</th><th>Budget</th><th>Submitted</th><th>Status</th></tr></thead><tbody>
          ${p.leads.map(l => `
            <tr>
              <td>${escapeHtml(l.name)}</td>
              <td>${escapeHtml(l.email)}</td>
              <td>${escapeHtml(l.phone || '—')}</td>
              <td>${escapeHtml(l.project_type || '—')}</td>
              <td>${escapeHtml(l.budget || '—')}</td>
              <td>${l.created_at}</td>
              <td><span class="badge new">${l.status}</span></td>
            </tr>`).join('')}
        </tbody></table>`
      : '<p class="muted">No leads yet.</p>';

    $('#detailBody').innerHTML = `
      <div class="grid" style="margin-bottom:16px;">
        <div>
          <p><strong>Email:</strong> ${escapeHtml(p.email || '—')}</p>
          <p><strong>Company:</strong> ${escapeHtml(p.company || '—')}</p>
          <p><strong>Commission:</strong> ${p.commission_rate}%</p>
          <p><strong>Status:</strong> <span class="badge ${p.status}">${p.status}</span></p>
        </div>
        <div>
          <p><strong>Referral link:</strong></p>
          <div class="link-box">
            <input readonly value="${p.referral_link}" id="refLink" />
            <button class="small" onclick="copyLink()">Copy</button>
          </div>
          <p class="muted" style="margin-top:8px;">Clicks: ${p.clicks} · Leads: ${p.leads.length}</p>
          <button class="small ghost" onclick="toggleStatus(${p.id}, '${p.status === 'active' ? 'inactive' : 'active'}')">
            ${p.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
      <h2>Clients brought by ${escapeHtml(p.name)}</h2>
      ${leadsHtml}
    `;
  } catch (e) {
    alert(e.message);
  }
}

function copyLink() {
  const el = document.getElementById('refLink');
  el.select();
  document.execCommand('copy');
  alert('Referral link copied.');
}

async function toggleStatus(id, status) {
  try {
    await api(`/api/partners/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    await loadPartners();
    await showPartner(id);
  } catch (e) { alert(e.message); }
}

/* Create partner */
$('#partnerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  data.commission_rate = parseFloat(data.commission_rate) || 10;
  try {
    const p = await api('/api/partners', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    $('#createMsg').innerHTML = `✓ Created <strong>${escapeHtml(p.name)}</strong> — link: <code>${p.referral_link}</code>`;
    e.target.reset();
    await loadPartners();
    await showPartner(p.id);
  } catch (err) {
    $('#createMsg').textContent = err.message;
  }
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}