let managedScholarships = [];

function scholarshipAdminRequest(path, options = {}) {
    const token = localStorage.getItem('adminToken');
    return window.padhaanApiFetch(path, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.body ? { 'Content-Type': 'application/json' } : {})
        }
    });
}

function escapeScholarshipText(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

function showScholarshipsPanel() {
    const area = document.getElementById('mainContentArea');
    if (!area) return;

    area.innerHTML = `
        <section class="scholarship-manager">
            <header class="sch-admin-heading">
                <div>
                    <div class="sch-eyebrow">Content management</div>
                    <h1>Scholarships</h1>
                    <p>Keep scholarship details current for students visiting Padhaan.</p>
                </div>
                <button class="sch-add-btn" type="button" id="addScholarshipButton"><i class="fas fa-plus"></i> Add scholarship</button>
            </header>

            <div class="sch-summary" id="scholarshipSummary"></div>
            <div class="sch-message" id="scholarshipMessage" role="status" hidden></div>

            <section class="sch-form-panel" id="scholarshipFormPanel" hidden>
                <div class="sch-form-heading">
                    <div><h2 id="scholarshipFormTitle">Add a scholarship</h2><p>These details will appear on the public scholarship pages.</p></div>
                    <button class="sch-action sch-action-edit" type="button" id="closeScholarshipForm" aria-label="Close form"><i class="fas fa-times"></i></button>
                </div>
                <form id="scholarshipForm">
                    <input type="hidden" id="scholarshipRecordId">
                    <div class="sch-form-grid">
                        <div class="sch-field sch-field-wide"><label for="scholarshipName">Scholarship name</label><input id="scholarshipName" required maxlength="140" placeholder="e.g. Padhaan Future Leaders Award"></div>
                        <div class="sch-field"><label for="scholarshipAmount">Award amount</label><input id="scholarshipAmount" required maxlength="80" placeholder="e.g. ₹50,000 per year"></div>
                        <div class="sch-field"><label for="scholarshipDeadline">Application deadline</label><input id="scholarshipDeadline" type="date" required></div>
                        <div class="sch-field"><label for="scholarshipStatus">Listing status</label><select id="scholarshipStatus"><option>Open</option><option>Soon</option><option>Closed</option></select></div>
                        <div class="sch-field"><label for="scholarshipGroup">Website category</label><select id="scholarshipGroup"><option value="all">All</option><option value="school">School</option><option value="class11-12">Class 11–12</option><option value="college">College</option><option value="private">Private</option><option value="state">State</option></select></div>
                        <div class="sch-field sch-field-wide"><label for="scholarshipDescription">Short description</label><textarea id="scholarshipDescription" required maxlength="1200" placeholder="Who is this scholarship for and what does it support?"></textarea></div>
                        <div class="sch-field sch-field-wide"><label for="scholarshipLink">Official application or information link</label><input id="scholarshipLink" type="url" placeholder="https://example.org/scholarship"></div>
                        <div class="sch-field"><label for="scholarshipClasses">Eligible classes or courses</label><input id="scholarshipClasses" placeholder="12th, undergraduate"></div>
                        <div class="sch-field"><label for="scholarshipCategories">Eligible categories</label><input id="scholarshipCategories" placeholder="general, obc, sc, st"></div>
                        <div class="sch-field"><label for="scholarshipFields">Eligible fields of study</label><input id="scholarshipFields" placeholder="science, commerce, engineering"></div>
                        <div class="sch-field"><label for="scholarshipGender">Gender eligibility</label><input id="scholarshipGender" placeholder="female (leave blank for all)"></div>
                        <div class="sch-field"><label for="scholarshipStates">Eligible states</label><input id="scholarshipStates" placeholder="All India or state names"></div>
                        <div class="sch-field"><label for="scholarshipMinMarks">Minimum marks (%)</label><input id="scholarshipMinMarks" type="number" min="0" max="100" value="0"></div>
                        <div class="sch-field"><label for="scholarshipMaxIncome">Maximum family income (₹)</label><input id="scholarshipMaxIncome" type="number" min="0" value="10000000"></div>
                        <div class="sch-field"><label for="scholarshipDocuments">Required documents</label><textarea id="scholarshipDocuments" placeholder="One item per line"></textarea></div>
                        <div class="sch-field"><label for="scholarshipBenefits">Benefits</label><textarea id="scholarshipBenefits" placeholder="One item per line"></textarea></div>
                    </div>
                    <div class="sch-form-actions"><button class="sch-cancel-btn" type="button" id="cancelScholarshipForm">Cancel</button><button class="sch-save-btn" type="submit" id="saveScholarshipButton">Save scholarship</button></div>
                </form>
            </section>

            <section class="sch-list-panel">
                <div class="sch-list-toolbar"><h2>Published listings</h2><input class="sch-search" id="scholarshipSearch" type="search" placeholder="Search scholarships" aria-label="Search scholarships"></div>
                <div class="sch-table-wrap" id="scholarshipTableWrap"></div>
            </section>
        </section>`;

    document.getElementById('addScholarshipButton').addEventListener('click', () => openScholarshipEditor());
    document.getElementById('closeScholarshipForm').addEventListener('click', closeScholarshipEditor);
    document.getElementById('cancelScholarshipForm').addEventListener('click', closeScholarshipEditor);
    document.getElementById('scholarshipForm').addEventListener('submit', saveScholarship);
    document.getElementById('scholarshipSearch').addEventListener('input', renderScholarshipTable);
    document.getElementById('scholarshipTableWrap').addEventListener('click', handleScholarshipTableClick);
    refreshManagedScholarships();
}

async function refreshManagedScholarships() {
    const table = document.getElementById('scholarshipTableWrap');
    if (!table) return;

    try {
        const response = await scholarshipAdminRequest('/admin/scholarships');
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load scholarships.');
        managedScholarships = Array.isArray(result) ? result : [];
        renderScholarshipSummary();
        renderScholarshipTable();
    } catch (error) {
        table.innerHTML = `<div class="sch-empty">${escapeScholarshipText(error.message)} Check that the backend is running and its URL is configured.</div>`;
    }
}

function renderScholarshipSummary() {
    const summary = document.getElementById('scholarshipSummary');
    if (!summary) return;
    const open = managedScholarships.filter(item => item.status === 'Open').length;
    const soon = managedScholarships.filter(item => item.status === 'Soon').length;
    summary.innerHTML = `
        <div class="sch-summary-card"><span>Total listings</span><strong>${managedScholarships.length}</strong></div>
        <div class="sch-summary-card"><span>Open now</span><strong>${open}</strong></div>
        <div class="sch-summary-card"><span>Coming soon</span><strong>${soon}</strong></div>`;
}

function renderScholarshipTable() {
    const table = document.getElementById('scholarshipTableWrap');
    if (!table) return;
    const search = (document.getElementById('scholarshipSearch')?.value || '').trim().toLowerCase();
    const items = managedScholarships.filter(item => `${item.name} ${item.group} ${item.status}`.toLowerCase().includes(search));
    if (!items.length) {
        table.innerHTML = `<div class="sch-empty">${managedScholarships.length ? 'No listings match that search.' : 'No scholarships yet. Add the first listing to get started.'}</div>`;
        return;
    }

    table.innerHTML = `<table class="sch-table"><thead><tr><th>Scholarship</th><th>Award</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead><tbody>${items.map(item => {
        const statusClass = `sch-status-${String(item.status || 'Open').toLowerCase()}`;
        const deadline = item.deadline ? new Date(`${item.deadline}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        return `<tr>
            <td class="sch-title-cell"><strong>${escapeScholarshipText(item.name)}</strong><small>${escapeScholarshipText(item.group || 'all')}</small></td>
            <td>${escapeScholarshipText(item.amount || '—')}</td>
            <td>${escapeScholarshipText(deadline)}</td>
            <td><span class="sch-status ${statusClass}">${escapeScholarshipText(item.status || 'Open')}</span></td>
            <td><div class="sch-row-actions"><button type="button" class="sch-action sch-action-edit" data-action="edit" data-id="${escapeScholarshipText(item._id)}">Edit</button><button type="button" class="sch-action sch-action-delete" data-action="delete" data-id="${escapeScholarshipText(item._id)}">Remove</button></div></td>
        </tr>`;
    }).join('')}</tbody></table>`;
}

function listForEditor(value) {
    return Array.isArray(value) ? value.join(', ') : '';
}

function setScholarshipEditorValue(id, value) {
    const input = document.getElementById(id);
    if (input) input.value = value ?? '';
}

function openScholarshipEditor(record = null) {
    const panel = document.getElementById('scholarshipFormPanel');
    const form = document.getElementById('scholarshipForm');
    if (!panel || !form) return;
    form.reset();
    const eligibility = record?.eligibility || {};
    document.getElementById('scholarshipRecordId').value = record?._id || '';
    setScholarshipEditorValue('scholarshipName', record?.name || '');
    setScholarshipEditorValue('scholarshipAmount', record?.amount || '');
    setScholarshipEditorValue('scholarshipDeadline', String(record?.deadline || '').slice(0, 10));
    setScholarshipEditorValue('scholarshipStatus', record?.status || 'Open');
    setScholarshipEditorValue('scholarshipGroup', record?.group || 'all');
    setScholarshipEditorValue('scholarshipDescription', record?.description || '');
    setScholarshipEditorValue('scholarshipLink', record?.link || '');
    setScholarshipEditorValue('scholarshipClasses', listForEditor(eligibility.classes || record?.education));
    setScholarshipEditorValue('scholarshipCategories', listForEditor(eligibility.categories || record?.category));
    setScholarshipEditorValue('scholarshipFields', listForEditor(record?.field));
    setScholarshipEditorValue('scholarshipGender', listForEditor(eligibility.gender));
    setScholarshipEditorValue('scholarshipStates', listForEditor(eligibility.states));
    setScholarshipEditorValue('scholarshipMinMarks', eligibility.minMarks ?? record?.percentage ?? 0);
    setScholarshipEditorValue('scholarshipMaxIncome', eligibility.maxIncome ?? 10000000);
    setScholarshipEditorValue('scholarshipDocuments', Array.isArray(record?.documents) ? record.documents.join('\n') : '');
    setScholarshipEditorValue('scholarshipBenefits', Array.isArray(record?.benefits) ? record.benefits.join('\n') : '');
    document.getElementById('scholarshipFormTitle').textContent = record ? 'Edit scholarship' : 'Add a scholarship';
    document.getElementById('saveScholarshipButton').textContent = record ? 'Save changes' : 'Save scholarship';
    panel.hidden = false;
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeScholarshipEditor() {
    const panel = document.getElementById('scholarshipFormPanel');
    if (panel) panel.hidden = true;
}

function parseScholarshipList(value) {
    return value.split(/[\n,]/).map(item => item.trim()).filter(Boolean);
}

async function saveScholarship(event) {
    event.preventDefault();
    const recordId = document.getElementById('scholarshipRecordId').value;
    const classes = parseScholarshipList(document.getElementById('scholarshipClasses').value);
    const categories = parseScholarshipList(document.getElementById('scholarshipCategories').value);
    const fields = parseScholarshipList(document.getElementById('scholarshipFields').value);
    const minMarks = Number(document.getElementById('scholarshipMinMarks').value || 0);
    const maxIncome = Number(document.getElementById('scholarshipMaxIncome').value || 0);
    const income = maxIncome > 0 ? `0-${maxIncome}` : '';
    const payload = {
        name: document.getElementById('scholarshipName').value.trim(),
        amount: document.getElementById('scholarshipAmount').value.trim(),
        deadline: document.getElementById('scholarshipDeadline').value,
        status: document.getElementById('scholarshipStatus').value,
        group: document.getElementById('scholarshipGroup').value,
        description: document.getElementById('scholarshipDescription').value.trim(),
        link: document.getElementById('scholarshipLink').value.trim(),
        eligibility: {
            classes,
            categories,
            minMarks,
            maxIncome,
            gender: parseScholarshipList(document.getElementById('scholarshipGender').value),
            states: parseScholarshipList(document.getElementById('scholarshipStates').value)
        },
        education: classes,
        category: categories,
        percentage: minMarks,
        income,
        field: fields,
        documents: parseScholarshipList(document.getElementById('scholarshipDocuments').value),
        benefits: parseScholarshipList(document.getElementById('scholarshipBenefits').value)
    };
    const button = document.getElementById('saveScholarshipButton');
    button.disabled = true;
    button.textContent = 'Saving…';
    try {
        const path = recordId ? `/admin/scholarships/${encodeURIComponent(recordId)}` : '/admin/scholarships';
        const response = await scholarshipAdminRequest(path, {
            method: recordId ? 'PUT' : 'POST',
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not save this scholarship.');
        closeScholarshipEditor();
        await refreshManagedScholarships();
        showScholarshipMessage(recordId ? 'Changes saved.' : 'Scholarship added to the live list.');
    } catch (error) {
        showScholarshipMessage(error.message);
    } finally {
        button.disabled = false;
        button.textContent = recordId ? 'Save changes' : 'Save scholarship';
    }
}

async function handleScholarshipTableClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const record = managedScholarships.find(item => String(item._id) === button.dataset.id);
    if (!record) return;
    if (button.dataset.action === 'edit') {
        openScholarshipEditor(record);
        return;
    }
    if (!confirm(`Remove “${record.name}” from the public scholarship list?`)) return;

    try {
        const response = await scholarshipAdminRequest(`/admin/scholarships/${encodeURIComponent(record._id)}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not remove this scholarship.');
        managedScholarships = managedScholarships.filter(item => String(item._id) !== String(record._id));
        renderScholarshipSummary();
        renderScholarshipTable();
        showScholarshipMessage('Scholarship removed from the live list.');
    } catch (error) {
        showScholarshipMessage(error.message);
    }
}

function showScholarshipMessage(message) {
    const element = document.getElementById('scholarshipMessage');
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    window.setTimeout(() => { if (element.isConnected) element.hidden = true; }, 5000);
}
