// src/seedguard-app.js
class SeedGuardApp {
  constructor() {
    this.storageKey = 'seedguard_v1';
    this.data = this.loadData() || this.getDefaultData();
    this.ui = document.getElementById('seedguard-ui');
    this.init();
  }

  getDefaultData() {
    return {
      streakStart: null,
      goalDays: 30,
      currentStreakDays: 0,
      currentStreakHours: 0,
      totalCleanHours: 0,
      urges: [],
      milestones: [],
      guardianEmail: '',
      lastCheckIn: null
    };
  }

  loadData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) { console.warn('Storage write failed:', e); }
  }

  calculateStreak() {
    if (!this.data.streakStart) return { days: 0, hours: 0, mins: 0, reset: true };
    const now = Date.now();
    const diff = now - this.data.streakStart;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    return { days, hours, mins, reset: false };
  }

  startStreak() {
    this.data.streakStart = Date.now();
    this.data.lastCheckIn = Date.now();
    this.saveData();
    this.renderDashboard();
  }

  logUrge(intensity, trigger, note = '') {
    const urge = {
      id: crypto.randomUUID?.() || Date.now(),
      time: new Date().toISOString(),
      intensity: Math.min(10, Math.max(1, intensity)),
      trigger,
      note
    };
    this.data.urges.unshift(urge);
    if (this.data.urges.length > 100) this.data.urges.pop();
    this.saveData();
    this.renderUrges();
  }

  setGoalDays(days) {
    this.data.goalDays = Math.max(1, Math.min(365, parseInt(days) || 30));
    this.saveData();
    this.renderDashboard();
  }

  setGuardianEmail(email) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.data.guardianEmail = email;
      this.saveData();
    }
  }

  renderDashboard() {
    if (!this.ui) return;
    const { days, hours, mins, reset } = this.calculateStreak();
    const progress = Math.min(100, (days / this.data.goalDays) * 100);
    const nextMilestone = Math.ceil((this.data.goalDays) / 5) * 5;
    const isMilestone = days % 5 === 0 && days > 0;

    this.ui.innerHTML = `
      <div class="dashboard">
        <div class="streak-circle ${reset ? 'reset' : ''}">
          <span class="days">${days}</span>
          <span class="label">Days</span>
        </div>
        <div class="timer">${String(hours).padStart(2,'0')}:${String(mins % 60).padStart(2,'0')}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${progress}%"></div>
          <span>${progress.toFixed(1)}%</span>
        </div>
        ${isMilestone ? '<div class="milestone-flash">🎯 Milestone Reached!</div>' : ''}
        <div class="controls">
          <button id="btn-start" ${this.data.streakStart ? 'disabled' : ''}>Start Clean</button>
          <button id="btn-urge">I Have an Urge</button>
          <button id="btn-set-goal">Set Goal Days</button>
          <button id="btn-guardian">Add Guardian</button>
        </div>
        <div id="urge-modal" class="modal hidden">
          <form id="urge-form">
            <h3>Log Urge</h3>
            <input type="number" id="urge-intensity" min="1" max="10" placeholder="Intensity (1-10)" required>
            <select id="urge-trigger">
              <option value="boredom">Boredom</option>
              <option value="stress">Stress</option>
              <option value="loneliness">Loneliness</option>
              <option value="late_night">Late Night</option>
              <option value="other">Other</option>
            </select>
            <textarea id="urge-note" placeholder="What triggered this? (optional)"></textarea>
            <div class="modal-actions">
              <button type="button" id="urge-cancel">Cancel</button>
              <button type="submit">Log & Surf</button>
            </div>
          </form>
        </div>
        <div id="urges-list" class="urges-list"></div>
      </div>
    `;

    this.ui.querySelector('#btn-start')?.addEventListener('click', () => this.startStreak());
    this.ui.querySelector('#btn-urge')?.addEventListener('click', () => this.ui.querySelector('#urge-modal')?.classList.remove('hidden'));
    this.ui.querySelector('#urge-cancel')?.addEventListener('click', () => this.ui.querySelector('#urge-modal')?.classList.add('hidden'));
    this.ui.querySelector('#urge-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.logUrge(
        document.getElementById('urge-intensity').value,
        document.getElementById('urge-trigger').value,
        document.getElementById('urge-note').value
      );
      this.ui.querySelector('#urge-modal')?.classList.add('hidden');
    });
    this.ui.querySelector('#btn-set-goal')?.addEventListener('click', () => {
      const days = prompt('Set recovery goal (days):', this.data.goalDays);
      if (days) this.setGoalDays(days);
    });
    this.ui.querySelector('#btn-guardian')?.addEventListener('click', () => {
      const email = prompt('Guardian email (alerts sent weekly):', this.data.guardianEmail);
      if (email) this.setGuardianEmail(email);
    });

    this.renderUrges();
  }

  renderUrges() {
    const list = this.ui?.querySelector('#urges-list');
    if (!list || !this.data.urges.length) return;
    list.innerHTML = this.data.urges.slice(0, 5).map(u => `
      <div class="urge-item">
        <strong>Intensity:</strong> ${u.intensity}/10 
        <strong>Trigger:</strong> ${u.trigger}
        <small>${new Date(u.time).toLocaleString()}</small>
        ${u.note ? `<p>${u.note}</p>` : ''}
      </div>
    `).join('');
  }

  init() {
    this.renderDashboard();
    setInterval(() => this.renderDashboard(), 60000); // Update every minute
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.seedguardApp = new SeedGuardApp();
});
