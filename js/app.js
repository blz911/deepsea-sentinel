// ============================================================
// DeepSea Sentinel — Core Application Logic
// ============================================================

const DSS = {

  // ── Storage helpers ─────────────────────────────────────
  storage: {
    get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
    push: (k, v) => {
      const arr = DSS.storage.get(k) || [];
      arr.unshift(v);
      DSS.storage.set(k, arr.slice(0, 100)); // keep last 100
    }
  },

  // ── Grade calculation ────────────────────────────────────
  calcGrade(score) {
    if (score >= 90) return { letter: 'A', sub: score >= 97 ? '' : score >= 93 ? '+' : '-', color: '#4fdbc8' };
    if (score >= 80) return { letter: 'B', sub: score >= 87 ? '+' : score >= 83 ? '' : '-', color: '#89ceff' };
    if (score >= 70) return { letter: 'C', sub: score >= 77 ? '+' : score >= 73 ? '' : '-', color: '#f59e0b' };
    if (score >= 60) return { letter: 'D', sub: score >= 67 ? '+' : score >= 63 ? '' : '-', color: '#f97316' };
    return { letter: 'F', sub: '', color: '#ffb4ab' };
  },

  // ── Simulate scan modules ────────────────────────────────
  simulateScan(url) {
    const hostname = (() => { try { return new URL(url).hostname; } catch { return url; } })();
    const seed = hostname.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = (min, max) => min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min) | 0;

    const sslScore = rng(55, 100);
    const headerScore = rng(30, 95);
    const fileScore = rng(40, 100);
    const dnsScore = rng(50, 100);
    const techScore = rng(60, 100);

    const overall = Math.round(sslScore * 0.30 + headerScore * 0.25 + fileScore * 0.25 + dnsScore * 0.10 + techScore * 0.10);
    const grade = DSS.calcGrade(overall);

    const headers = ['Content-Security-Policy','Strict-Transport-Security','X-Frame-Options',
      'X-Content-Type-Options','X-XSS-Protection','Referrer-Policy','Permissions-Policy'];
    const presentCount = Math.round(headers.length * headerScore / 100);
    const presentHeaders = headers.slice(0, presentCount);
    const missingHeaders = headers.slice(presentCount);

    const sensitiveFiles = ['/.env','/.git/HEAD','/robots.txt','/.DS_Store','/backup.zip','/wp-admin','/.htaccess','/server-status'];
    const exposedCount = Math.max(0, Math.round((100 - fileScore) / 100 * 4));
    const exposedFiles = sensitiveFiles.slice(0, exposedCount);

    const techs = ['React','Nginx','Node.js','PostgreSQL','Docker','Redis','Varnish','WordPress'];
    const detectedCount = 2 + (seed % 4);
    const detectedTechs = techs.slice(seed % 3, (seed % 3) + detectedCount);

    return {
      url, hostname,
      scanId: 'SC-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      timestamp: new Date().toISOString(),
      overall, grade,
      modules: {
        ssl: {
          score: sslScore,
          valid: sslScore > 60,
          expiry: 180 + (seed % 200),
          issuer: ['GlobalSign','Let\'s Encrypt','DigiCert','Sectigo'][seed % 4],
          protocol: sslScore > 70 ? 'TLS 1.3' : 'TLS 1.2',
          findings: sslScore < 70 ? ['Weak cipher suites detected','TLS 1.0/1.1 still enabled'] : ['Certificate chain valid','TLS 1.3 active']
        },
        headers: {
          score: headerScore,
          present: presentHeaders,
          missing: missingHeaders,
          findings: missingHeaders.map(h => `${h} not detected`)
        },
        files: {
          score: fileScore,
          exposed: exposedFiles,
          findings: exposedFiles.length ? exposedFiles.map(f => `${f} returned HTTP 200`) : ['No sensitive files exposed']
        },
        dns: {
          score: dnsScore,
          spf: dnsScore > 60,
          dkim: dnsScore > 70,
          dmarc: dnsScore > 80,
          findings: [
            dnsScore > 60 ? 'SPF record valid' : 'SPF record missing',
            dnsScore > 70 ? 'DKIM configured' : 'DKIM not found',
            dnsScore > 80 ? 'DMARC policy active' : 'DMARC policy missing',
          ]
        },
        tech: {
          score: techScore,
          detected: detectedTechs,
          findings: detectedTechs.map(t => `${t} detected`)
        }
      }
    };
  },

  // ── Navigation ──────────────────────────────────────────
  navigate(page, params = {}) {
    if (params) DSS.storage.set('nav_params', params);
    window.location.href = page;
  },

  getParams() {
    return DSS.storage.get('nav_params') || {};
  },

  // ── Current page init ───────────────────────────────────
  init() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (DSS.pages[page]) DSS.pages[page]();
  },

  // ── Page handlers ────────────────────────────────────────
  pages: {

    'index.html': () => {
      const form = document.getElementById('scan-form');
      const input = document.getElementById('url-input');
      if (!form || !input) return;

      // Load recent scans
      const history = DSS.storage.get('scan_history') || [];
      const container = document.getElementById('recent-scans');
      if (container && history.length) {
        container.innerHTML = history.slice(0, 3).map(s => {
          const g = s.grade;
          return `
          <div onclick="DSS.navigate('dashboard.html', {scanId:'${s.scanId}'})" class="glass-card p-card-padding rounded-xl hover:border-primary/40 transition-all group cursor-pointer">
            <div class="flex justify-between items-start mb-6">
              <div class="p-3 rounded-lg bg-surface-container-high">
                <span class="material-symbols-outlined" style="color:${g.color}">hub</span>
              </div>
              <div class="flex flex-col items-end">
                <span class="font-grade-display text-grade-display drop-shadow-lg" style="color:${g.color}">${g.letter}${g.sub}</span>
                <span class="font-mono-data text-mono-data text-outline uppercase tracking-widest">Security Score</span>
              </div>
            </div>
            <div class="space-y-1">
              <h4 class="font-h3 text-[18px] text-on-surface group-hover:text-primary transition-colors truncate">${s.hostname}</h4>
              <p class="font-mono-data text-mono-data text-on-surface-variant">${DSS._timeAgo(s.timestamp)}</p>
            </div>
            <div class="mt-4 pt-4 border-t border-white/5 flex gap-4">
              <div class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full" style="background:${s.modules.files.exposed.length ? '#ffb4ab' : '#4fdbc8'}"></span>
                <span class="font-mono-data text-on-surface-variant">${s.modules.files.exposed.length} Exposed Files</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                <span class="font-mono-data text-on-surface-variant">${s.modules.headers.missing.length} Header Warnings</span>
              </div>
            </div>
          </div>`;
        }).join('');
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let url = input.value.trim();
        if (!url) return;
        if (!url.startsWith('http')) url = 'https://' + url;
        DSS.storage.set('pending_scan_url', url);
        DSS.navigate('scanning.html');
      });
    },

    'scanning.html': () => {
      const url = DSS.storage.get('pending_scan_url');
      if (!url) { window.location.href = 'index.html'; return; }

      const hostname = (() => { try { return new URL(url).hostname; } catch { return url; } })();
      document.querySelectorAll('.scan-target').forEach(el => el.textContent = hostname);

      const modules = ['ssl', 'headers', 'files', 'dns', 'tech'];
      const bars = {
        ssl: document.getElementById('bar-ssl'),
        headers: document.getElementById('bar-headers'),
        files: document.getElementById('bar-files'),
        dns: document.getElementById('bar-dns'),
        tech: document.getElementById('bar-tech'),
      };
      const pcts = {
        ssl: document.getElementById('pct-ssl'),
        headers: document.getElementById('pct-headers'),
        files: document.getElementById('pct-files'),
        dns: document.getElementById('pct-dns'),
        tech: document.getElementById('pct-tech'),
      };
      const log = document.getElementById('scan-log');
      const progressEl = document.getElementById('overall-progress');
      const logs = [
        'Initializing deep scan protocol...',
        `Resolving DNS for ${hostname}...`,
        'Establishing TLS handshake...',
        'Validating SSL certificate chain...',
        'Checking security response headers...',
        'Probing sensitive file paths...',
        'Analyzing DNS and email security records...',
        'Detecting technology fingerprints...',
        'Running anomaly cross-check...',
        'Compiling vulnerability report...',
      ];

      let logIdx = 0;
      const logInterval = setInterval(() => {
        if (logIdx < logs.length && log) {
          log.textContent = logs[logIdx++];
        }
      }, 800);

      // Animate module progress bars one by one
      const scanResult = DSS.simulateScan(url);
      const targetPcts = [scanResult.modules.ssl.score, scanResult.modules.headers.score,
        scanResult.modules.files.score, scanResult.modules.dns.score, scanResult.modules.tech.score];

      let moduleIdx = 0;
      let overall = 0;
      const moduleInterval = setInterval(() => {
        if (moduleIdx >= modules.length) {
          clearInterval(moduleInterval);
          clearInterval(logInterval);
          // Save result and navigate
          DSS.storage.push('scan_history', scanResult);
          DSS.storage.set('latest_scan', scanResult);
          setTimeout(() => DSS.navigate('dashboard.html'), 800);
          return;
        }
        const mod = modules[moduleIdx];
        const target = targetPcts[moduleIdx];
        let current = 0;
        const anim = setInterval(() => {
          current = Math.min(current + 3, target);
          if (bars[mod]) bars[mod].style.width = current + '%';
          if (pcts[mod]) pcts[mod].textContent = current + '%';
          overall = Math.round(targetPcts.slice(0, moduleIdx).reduce((a, v) => a + v, 0) / (moduleIdx + 1 || 1));
          if (progressEl) progressEl.textContent = Math.min(Math.round((moduleIdx / modules.length) * 100 + current / modules.length), 99) + '%';
          if (current >= target) { clearInterval(anim); moduleIdx++; }
        }, 20);
      }, 1800);
    },

    'dashboard.html': () => {
      const scan = DSS.storage.get('latest_scan');
      if (!scan) return;

      const g = scan.grade;

      // Grade circle
      DSS._setEl('grade-letter', g.letter + g.sub);
      DSS._setStyle('grade-letter', 'color', g.color);
      DSS._setEl('grade-description', g.letter === 'A' ? 'Strong Integrity' : g.letter === 'B' ? 'Good Posture' : g.letter === 'C' ? 'Moderate Risk' : g.letter === 'D' ? 'High Risk' : 'Critical Threats');
      DSS._setEl('overall-score', scan.overall + '/100');
      DSS._setEl('target-hostname', 'TARGET: ' + scan.hostname + ' • LAST SCAN: JUST NOW');
      DSS._setEl('threat-level', g.letter <= 'B' ? 'Low' : g.letter === 'C' ? 'Medium' : 'High');

      // SSL
      DSS._setEl('ssl-status', scan.modules.ssl.valid ? 'Valid & Secure' : 'Insecure');
      DSS._setEl('ssl-detail', `Expires in ${scan.modules.ssl.expiry} days (${scan.modules.ssl.issuer})`);
      DSS._setEl('ssl-badge', scan.modules.ssl.valid ? 'SAFE' : 'WARNING');

      // Headers
      DSS._setEl('header-status', scan.modules.headers.missing.length === 0 ? 'All Present' : `Missing ${scan.modules.headers.missing[0]}`);
      DSS._setEl('header-detail', scan.modules.headers.missing.length === 0 ? 'All security headers detected' : `${scan.modules.headers.missing.length} header(s) missing`);
      DSS._setEl('header-badge', scan.modules.headers.missing.length === 0 ? 'SECURE' : 'WARNING');

      // Files
      DSS._setEl('files-status', scan.modules.files.exposed.length === 0 ? 'No Exposure' : `${scan.modules.files.exposed.length} Files Exposed`);
      DSS._setEl('files-detail', scan.modules.files.exposed.length === 0 ? 'No sensitive files found' : scan.modules.files.exposed.join(', '));
      DSS._setEl('files-badge', scan.modules.files.exposed.length === 0 ? 'SAFE' : 'CRITICAL');

      // DNS
      DSS._setEl('dns-spf', scan.modules.dns.spf ? 'PASS' : 'FAIL');
      DSS._setEl('dns-dkim', scan.modules.dns.dkim ? 'PASS' : 'FAIL');
      DSS._setEl('dns-dmarc', scan.modules.dns.dmarc ? 'PASS' : 'MISSING');

      // Tech
      const techContainer = document.getElementById('tech-stack');
      if (techContainer) {
        techContainer.innerHTML = scan.modules.tech.detected.map(t =>
          `<span class="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono-data">${t.toUpperCase()}</span>`
        ).join('');
      }

      // History rows
      const history = DSS.storage.get('scan_history') || [];
      const tbody = document.getElementById('history-rows');
      if (tbody && history.length) {
        tbody.innerHTML = history.slice(0, 3).map(s => {
          const g2 = s.grade;
          const icon = g2.letter <= 'B' ? 'check_circle' : g2.letter === 'C' ? 'warning' : 'error';
          const iconColor = g2.letter <= 'B' ? 'text-secondary' : g2.letter === 'C' ? 'text-yellow-500' : 'text-error';
          return `
          <div class="flex items-center justify-between py-4 border-b border-white/5 hover:bg-white/5 transition-colors px-4 rounded-lg cursor-pointer" onclick="DSS.navigate('history.html')">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full glass-surface flex items-center justify-center ${iconColor}">
                <span class="material-symbols-outlined">${icon}</span>
              </div>
              <div>
                <p class="font-bold text-white">${s.hostname}</p>
                <p class="font-mono-data text-slate-500">${new Date(s.timestamp).toLocaleString()} • Scan ID: ${s.scanId}</p>
              </div>
            </div>
            <div class="flex items-center gap-8">
              <span class="font-grade-display text-2xl" style="color:${g2.color}">${g2.letter}${g2.sub}</span>
              <span class="material-symbols-outlined text-slate-500 cursor-pointer">chevron_right</span>
            </div>
          </div>`;
        }).join('');
      }
    },

    'history.html': () => {
      const history = DSS.storage.get('scan_history') || [];
      const tbody = document.getElementById('history-tbody');
      const totalEl = document.getElementById('total-scans');
      if (totalEl) totalEl.textContent = history.length.toLocaleString();

      if (tbody) {
        if (history.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-12 text-center text-slate-500">No scans yet. <a href="index.html" class="text-primary hover:underline">Run your first scan</a></td></tr>`;
          return;
        }
        tbody.innerHTML = history.map((s, i) => {
          const g = s.grade;
          const critCount = s.modules.files.exposed.length;
          const warnCount = s.modules.headers.missing.length;
          return `
          <tr class="hover:bg-white/[0.03] transition-colors group">
            <td class="px-6 py-5">
              <div class="flex flex-col">
                <span class="text-sm font-semibold text-slate-100">${s.url}</span>
                <span class="font-mono-data text-[10px] text-slate-500 uppercase tracking-tighter">ID: ${s.scanId}</span>
              </div>
            </td>
            <td class="px-6 py-5">
              <div class="flex flex-col">
                <span class="text-sm text-slate-300">${new Date(s.timestamp).toLocaleDateString()}</span>
                <span class="text-xs text-slate-500">${new Date(s.timestamp).toLocaleTimeString()}</span>
              </div>
            </td>
            <td class="px-6 py-5">
              <div class="flex justify-center">
                <div class="w-12 h-12 flex items-center justify-center rounded-full glass-card" style="border:1px solid ${g.color}33; box-shadow:0 0 15px ${g.color}33">
                  <span class="font-grade-display text-2xl" style="color:${g.color}">${g.letter}${g.sub}</span>
                </div>
              </div>
            </td>
            <td class="px-6 py-5">
              <div class="flex gap-2">
                ${critCount ? `<span class="bg-error/10 border border-error/20 px-2 py-1 rounded text-[10px] font-bold text-error">${critCount} CRITICAL</span>` : '<span class="bg-white/5 px-2 py-1 rounded text-[10px] font-bold text-slate-400">0 CRITICAL</span>'}
                ${warnCount ? `<span class="bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded text-[10px] font-bold text-yellow-500">${warnCount} WARN</span>` : ''}
              </div>
            </td>
            <td class="px-6 py-5 text-right">
              <div class="flex justify-end gap-2">
                <button onclick="DSS.storage.set('latest_scan', DSS.storage.get('scan_history')[${i}]); DSS.navigate('dashboard.html')" class="p-2 hover:bg-primary/20 rounded-lg text-primary transition-all material-symbols-outlined" title="View Report">visibility</button>
                <button onclick="DSS._deleteHistory(${i})" class="p-2 hover:bg-error/20 rounded-lg text-error transition-all material-symbols-outlined" title="Delete">delete</button>
              </div>
            </td>
          </tr>`;
        }).join('');
      }

      // Search filter
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const q = e.target.value.toLowerCase();
          document.querySelectorAll('#history-tbody tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
          });
        });
      }
    },

    'admin.html': () => {
      // Animate bar charts with random live-ish data
      const bars = document.querySelectorAll('.chart-bar');
      setInterval(() => {
        bars.forEach(b => {
          const current = parseInt(b.style.height) || 40;
          const delta = (Math.random() - 0.5) * 10;
          b.style.height = Math.max(10, Math.min(95, current + delta)).toFixed(0) + '%';
        });
      }, 2000);
    },

    'auth.html': () => {
      const loginForm = document.getElementById('login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const btn = loginForm.querySelector('button[type=submit]');
          btn.textContent = 'AUTHENTICATING...';
          setTimeout(() => DSS.navigate('index.html'), 1500);
        });
      }

      const toggleBtn = document.getElementById('toggle-auth');
      const formTitle = document.getElementById('auth-title');
      const submitBtn = document.getElementById('auth-submit-label');
      let isLogin = true;
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          isLogin = !isLogin;
          if (formTitle) formTitle.textContent = isLogin ? 'Sign In' : 'Create Account';
          if (submitBtn) submitBtn.textContent = isLogin ? 'INITIALIZE SESSION' : 'CREATE ACCOUNT';
          toggleBtn.innerHTML = isLogin ? 'Create Account <span class="material-symbols-outlined text-sm">arrow_forward</span>' : 'Sign In <span class="material-symbols-outlined text-sm">arrow_forward</span>';
        });
      }
    },

    'report.html': () => {
      const scan = DSS.storage.get('latest_scan');
      if (!scan) return;
      const g = scan.grade;
      DSS._setEl('report-grade', g.letter + g.sub);
      DSS._setStyle('report-grade', 'color', '#04b4a2');
      DSS._setEl('report-hostname', scan.hostname);
      DSS._setEl('report-date', new Date(scan.timestamp).toLocaleDateString());
      DSS._setEl('report-scanid', scan.scanId);
      DSS._setEl('report-score', scan.overall + '%');

      const printBtn = document.getElementById('print-btn');
      if (printBtn) printBtn.addEventListener('click', () => window.print());
    }
  },

  // ── Helpers ──────────────────────────────────────────────
  _setEl(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; },
  _setStyle(id, prop, val) { const el = document.getElementById(id); if (el) el.style[prop] = val; },
  _timeAgo(iso) {
    const d = (Date.now() - new Date(iso)) / 1000;
    if (d < 60) return 'Just now';
    if (d < 3600) return Math.floor(d / 60) + 'm ago';
    if (d < 86400) return Math.floor(d / 3600) + 'h ago';
    return Math.floor(d / 86400) + 'd ago';
  },
  _deleteHistory(idx) {
    const h = DSS.storage.get('scan_history') || [];
    h.splice(idx, 1);
    DSS.storage.set('scan_history', h);
    DSS.pages['history.html']();
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => DSS.init());
