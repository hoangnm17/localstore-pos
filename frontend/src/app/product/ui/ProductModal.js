/* ===== Modal Base ===== */
.modal - overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 20, 50, 0.5);
    display: flex;
    align - items: center;
    justify - content: center;
    z - index: 1000;
    padding: 16px;
    backdrop - filter: blur(2px);
}

.modal {
    background: #fff;
    border - radius: 14px;
    box - shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
    display: flex;
    flex - direction: column;
    max - height: 90vh;
    width: 100 %;
    animation: modal -in 0.18s ease;
}

@keyframes modal -in {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal--sm { max - width: 400px; }
.modal--md { max - width: 520px; }
.modal--lg { max - width: 760px; }

/* ===== Modal Header ===== */
.modal__header {
    display: flex;
    align - items: center;
    justify - content: space - between;
    padding: 20px 24px 16px;
    border - bottom: 1px solid #eef0f7;
    flex - shrink: 0;
}

.modal__title {
    font - size: 17px;
    font - weight: 700;
    color: #1a1a2e;
    margin: 0;
}

.modal__close {
    background: none;
    border: none;
    font - size: 18px;
    color: #9197b3;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border - radius: 6px;
    display: flex;
    align - items: center;
    justify - content: center;
    transition: background 0.15s, color 0.15s;
}

.modal__close:hover {
    background: #f0f3fb;
    color: #2d3561;
}

/* ===== Modal Tabs ===== */
.modal__tabs {
    display: flex;
    padding: 0 24px;
    border - bottom: 1px solid #eef0f7;
    flex - shrink: 0;
}

.modal__tab {
    padding: 10px 18px;
    background: none;
    border: none;
    border - bottom: 2px solid transparent;
    cursor: pointer;
    font - size: 13.5px;
    font - weight: 500;
    color: #9197b3;
    margin - bottom: -1px;
    transition: color 0.15s, border - color 0.15s;
    display: flex;
    align - items: center;
    gap: 6px;
}

.modal__tab:hover { color: #1565c0; }

.modal__tab--active {
    color: #1565c0;
    border - bottom - color: #1565c0;
    font - weight: 600;
}

.tab - badge {
    background: #1565c0;
    color: #fff;
    border - radius: 10px;
    font - size: 11px;
    padding: 1px 6px;
    font - weight: 600;
}

/* ===== Modal Body ===== */
.modal__body {
    padding: 20px 24px;
    overflow - y: auto;
    flex: 1;
}

/* ===== Modal Footer ===== */
.modal__footer {
    display: flex;
    gap: 10px;
    justify - content: flex - end;
    padding: 16px 24px;
    border - top: 1px solid #eef0f7;
    flex - shrink: 0;
}

/* ===== States ===== */
.modal - loading, .modal - empty {
    text - align: center;
    padding: 40px 0;
    color: #9197b3;
    font - size: 14px;
}

.modal - error {
    padding: 12px 16px;
    background: #fce4ec;
    color: #c62828;
    border - radius: 8px;
    font - size: 13px;
}

/* ===== Detail Layout ===== */
.detail - top {
    display: flex;
    gap: 20px;
    margin - bottom: 24px;
}

.detail - image {
    width: 110px;
    height: 110px;
    flex - shrink: 0;
    border - radius: 10px;
    overflow: hidden;
    border: 1px solid #eef0f7;
    background: #f7f9ff;
}

.detail - image img {
    width: 100 %;
    height: 100 %;
    object - fit: cover;
}

.detail - image__placeholder {
    width: 100 %;
    height: 100 %;
    display: flex;
    align - items: center;
    justify - content: center;
    font - size: 36px;
}

.detail - info { flex: 1; }

.detail - name {
    font - size: 16px;
    font - weight: 700;
    color: #1a1a2e;
    margin: 0 0 14px 0;
}

.detail - grid {
    display: grid;
    grid - template - columns: 1fr 1fr;
    gap: 10px 20px;
}

.detail - field {
    display: flex;
    flex - direction: column;
    gap: 2px;
}

.detail - label {
    font - size: 11px;
    font - weight: 600;
    text - transform: uppercase;
    color: #9197b3;
    letter - spacing: 0.5px;
}

.detail - value {
    font - size: 13.5px;
    color: #2d3561;
    font - weight: 500;
}

.detail - value--code {
    font - family: 'Courier New', monospace;
    color: #1565c0;
}

.detail - value--price {
    color: #2e7d32;
    font - weight: 700;
}

/* ===== Section ===== */
.detail - section {
    margin - top: 20px;
    padding - top: 20px;
    border - top: 1px solid #eef0f7;
}

.detail - section__title {
    font - size: 13px;
    font - weight: 700;
    text - transform: uppercase;
    color: #9197b3;
    letter - spacing: 0.5px;
    margin: 0 0 12px 0;
}

/* ===== Detail Table ===== */
.detail - table {
    width: 100 %;
    border - collapse: collapse;
    font - size: 13px;
}

.detail - table th {
    background: #f0f3fb;
    padding: 8px 12px;
    text - align: left;
    font - weight: 600;
    color: #3a3f5c;
}

.detail - table td {
    padding: 9px 12px;
    border - bottom: 1px solid #eef0f7;
    color: #2d3561;
    vertical - align: middle;
}

.detail - table tr: last - child td { border - bottom: none; }

.cell--price {
    color: #2e7d32;
    font - weight: 600;
}

/* ===== Price History ===== */
.price - history__item {
    background: #f7f9ff;
    border: 1px solid #dde1ec;
    border - radius: 10px;
    padding: 16px;
}

.price - history__row {
    display: grid;
    grid - template - columns: 1fr 1fr;
    gap: 16px;
    margin - bottom: 12px;
}

.price - history__field {
    display: flex;
    flex - direction: column;
    gap: 4px;
}

.price - history__label {
    font - size: 11px;
    font - weight: 600;
    text - transform: uppercase;
    color: #9197b3;
    letter - spacing: 0.5px;
}

.price - history__value {
    font - size: 20px;
    font - weight: 700;
    color: #1565c0;
}

.price - history__meta {
    display: flex;
    gap: 16px;
    font - size: 12px;
    color: #9197b3;
}

/* ===== Form Grid ===== */
.form - grid {
    display: grid;
    grid - template - columns: 1fr 1fr;
    gap: 14px 20px;
}

.form - grid--compact { gap: 10px 16px; }

.form - field {
    display: flex;
    flex - direction: column;
    gap: 5px;
}

.form - field--full { grid - column: 1 / -1; }

.form - label {
    font - size: 12px;
    font - weight: 600;
    color: #3a3f5c;
}

.required { color: #c62828; }

.form - input {
    height: 38px;
    border: 1px solid #dde1ec;
    border - radius: 7px;
    padding: 0 12px;
    font - size: 13.5px;
    color: #2d3561;
    background: #fff;
    transition: border - color 0.15s, box - shadow 0.15s;
    outline: none;
    width: 100 %;
    box - sizing: border - box;
}

.form - input:focus {
    border - color: #1565c0;
    box - shadow: 0 0 0 3px rgba(21, 101, 192, 0.12);
}

.form - input--error { border - color: #c62828; }

.form - error {
    font - size: 11px;
    color: #c62828;
}

/* ===== Units Tab ===== */
.units - tab {
    display: flex;
    flex - direction: column;
    gap: 16px;
}

.btn--add - unit {
    align - self: flex - start;
    margin - top: 8px;
}

.unit - form {
    background: #f7f9ff;
    border: 1px solid #dde1ec;
    border - radius: 10px;
    padding: 16px;
    margin - top: 8px;
}

.unit - form__title {
    font - size: 13px;
    font - weight: 700;
    color: #2d3561;
    margin: 0 0 14px 0;
}

.unit - form__btns {
    display: flex;
    gap: 8px;
    justify - content: flex - end;
    margin - top: 12px;
}

/* ===== Action Buttons ===== */
.action - btns {
    display: flex;
    gap: 6px;
    align - items: center;
}

.action - btn {
    width: 28px;
    height: 28px;
    border: none;
    border - radius: 6px;
    cursor: pointer;
    font - size: 13px;
    display: flex;
    align - items: center;
    justify - content: center;
    transition: transform 0.1s, opacity 0.1s;
}

.action - btn:hover { transform: scale(1.1); opacity: 0.85; }
.action - btn--edit { background: #fff8e1; }
.action - btn--stop { background: #fce4ec; }

/* ===== Badge ===== */
.badge {
    display: inline - block;
    padding: 3px 10px;
    border - radius: 20px;
    font - size: 12px;
    font - weight: 600;
}

.badge--selling  { background: #e8f5e9; color: #2e7d32; }
.badge--stop     { background: #fff3e0; color: #e65100; }
.badge--suspended{ background: #fce4ec; color: #c62828; }

/* ===== Buttons ===== */
.btn {
    padding: 9px 18px;
    border - radius: 8px;
    border: none;
    cursor: pointer;
    font - size: 13.5px;
    font - weight: 600;
    transition: opacity 0.15s, transform 0.1s;
}

.btn:hover   { opacity: 0.88; transform: translateY(-1px); }
.btn:active  { transform: translateY(0); }
.btn:disabled{ opacity: 0.5; cursor: not - allowed; transform: none; }

.btn--primary { background: #1565c0; color: #fff; }
.btn--ghost   { background: #f0f3fb; color: #3a3f5c; }
.btn--danger  { background: #c62828; color: #fff; }