// ── Helpers ────────────────────────────────────────────────────

function setLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    const label = btn.querySelector('.btn-label');
    const icon = btn.querySelector('.btn-icon');
    const loader = btn.querySelector('.btn-loader');

    btn.disabled = isLoading;
    const defaultLabels = { callBtn: 'CALL NOW', smsBtn: 'SEND SMS', mailBtn: 'SEND MAIL' };
    label.textContent = isLoading ? 'SENDING...' : defaultLabels[btnId];
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
    const recipientEl = document.getElementById('callRecipient');
    const recipient = recipientEl.value.trim();

    if (!recipient) {
        recipientEl.focus();
        recipientEl.classList.add('mail-input--error');
        showStatus('error', '❌ Please enter a phone number to call.', '⚠️');
        return;
    }
    recipientEl.classList.remove('mail-input--error');

    setLoading('callBtn', true);
    showStatus('loading', `Initiating emergency call to ${recipient}…`, '⏳');

    try {
        const res = await fetch('/call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: recipient }),
        });
        const data = await res.json();

        if (data.success) {
            showStatus('success', `✅ Call triggered to ${recipient}! Phone will ring shortly.`, '📞');
            recipientEl.value = '';
        } else {
            showStatus('error', `❌ Call failed: ${data.message}`, '⚠️');
        }
    } catch (err) {
        showStatus('error', `❌ Network error: ${err.message}`, '⚠️');
    } finally {
        setLoading('callBtn', false);
    }
}

// ── SMS ─────────────────────────────────────────────────────────

async function triggerSMS() {
    const recipientEl = document.getElementById('smsRecipient');
    const recipient = recipientEl.value.trim();

    if (!recipient) {
        recipientEl.focus();
        recipientEl.classList.add('mail-input--error');
        showStatus('error', '❌ Please enter a phone number to SMS.', '⚠️');
        return;
    }
    recipientEl.classList.remove('mail-input--error');

    setLoading('smsBtn', true);
    showStatus('loading', `Sending emergency SMS to ${recipient}…`, '⏳');

    try {
        const res = await fetch('/sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: recipient }),
        });
        const data = await res.json();

        if (data.success) {
            showStatus('success', `✅ SMS sent to ${recipient}! Check the phone.`, '💬');
            recipientEl.value = '';
        } else {
            showStatus('error', `❌ SMS failed: ${data.message}`, '⚠️');
        }
    } catch (err) {
        showStatus('error', `❌ Network error: ${err.message}`, '⚠️');
    } finally {
        setLoading('smsBtn', false);
    }
}

// ── Mail ─────────────────────────────────────────────────────────

async function triggerMail() {
    const recipientEl = document.getElementById('mailRecipient');
    const recipient = recipientEl.value.trim();

    if (!recipient) {
        recipientEl.focus();
        recipientEl.classList.add('mail-input--error');
        showStatus('error', '❌ Please enter a recipient email address.', '⚠️');
        return;
    }
    recipientEl.classList.remove('mail-input--error');

    setLoading('mailBtn', true);
    showStatus('loading', `Sending emergency email to ${recipient}…`, '⏳');

    try {
        const res = await fetch('/mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: recipient }),
        });
        const data = await res.json();

        if (data.success) {
            showStatus('success', `✅ Email sent to ${recipient}!`, '✉️');
            recipientEl.value = '';
        } else {
            showStatus('error', `❌ Email failed: ${data.message}`, '⚠️');
        }
    } catch (err) {
        showStatus('error', `❌ Network error: ${err.message}`, '⚠️');
    } finally {
        setLoading('mailBtn', false);
    }
}
