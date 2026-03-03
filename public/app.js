// ── Helpers ────────────────────────────────────────────────────

function setLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    const label = btn.querySelector('.btn-label');
    const icon = btn.querySelector('.btn-icon');
    const loader = btn.querySelector('.btn-loader');

    btn.disabled = isLoading;
    label.textContent = isLoading ? 'SENDING...' : (btnId === 'callBtn' ? 'CALL NOW' : 'SEND SMS');
    icon.classList.toggle('hidden', isLoading);
    loader.classList.toggle('hidden', !isLoading);
}

function showStatus(type, message, icon) {
    const banner = document.getElementById('statusBanner');
    const text = document.getElementById('statusText');
    const iconEl = document.getElementById('statusIcon');

    banner.className = `status-banner ${type}`;
    iconEl.textContent = icon;
    text.textContent = message;
    banner.classList.remove('hidden');

    // Auto hide after 6 seconds
    clearTimeout(banner._timer);
    banner._timer = setTimeout(() => {
        banner.classList.add('hidden');
    }, 6000);
}

// ── Call ────────────────────────────────────────────────────────

async function triggerCall() {
    setLoading('callBtn', true);
    showStatus('loading', 'Initiating emergency call…', '⏳');

    try {
        const res = await fetch('/call', { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            showStatus('success', '✅ Call triggered! Your phone will ring shortly.', '📞');
        } else {
            showStatus('error', `❌ Call failed: ${data.message}`, '⚠️');
        }
    } catch (err) {
        showStatus('error', `❌ Network error: ${err.message}`, '⚠️');
    } finally {
        setLoading('callBtn', false);
        const btn = document.getElementById('callBtn');
        btn.querySelector('.btn-label').textContent = 'CALL NOW';
    }
}

// ── SMS ─────────────────────────────────────────────────────────

async function triggerSMS() {
    setLoading('smsBtn', true);
    showStatus('loading', 'Sending emergency SMS…', '⏳');

    try {
        const res = await fetch('/sms', { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            showStatus('success', '✅ SMS sent! Check your phone for the message.', '💬');
        } else {
            showStatus('error', `❌ SMS failed: ${data.message}`, '⚠️');
        }
    } catch (err) {
        showStatus('error', `❌ Network error: ${err.message}`, '⚠️');
    } finally {
        setLoading('smsBtn', false);
        const btn = document.getElementById('smsBtn');
        btn.querySelector('.btn-label').textContent = 'SEND SMS';
    }
}
