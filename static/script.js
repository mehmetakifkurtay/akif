/**
 * Dashboard JavaScript - Real-time data updates and interactions
 */

const API_BASE = '/api';
let updateInterval;
let alertSound;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    initializeUI();
    startAutoRefresh();
    initializeEventListeners();
    updateTime();
    setInterval(updateTime, 1000);
});

// Update current time
function updateTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString('tr-TR');
    document.getElementById('last-update').textContent = now.toLocaleTimeString('tr-TR');
}

// Initialize UI
function initializeUI() {
    updateStatus();
    updateAccount();
    updatePositions();
    updatePrices();
    updateHeatmap();
    updateAlerts();
    updateLogs();
}

// Start auto-refresh
function startAutoRefresh() {
    updateInterval = setInterval(() => {
        updateStatus();
        updateAccount();
        updatePositions();
        updatePrices();
        updateAlerts();
        updateLogs();
    }, 3000);
}

// ================================================================
// STATUS
// ================================================================

function updateStatus() {
    fetch(`${API_BASE}/status`)
        .then(r => r.json())
        .then(data => {
            const wsBox = document.getElementById('ws-status');
            const indicator = wsBox.querySelector('.status-indicator');
            
            if (data.ws_connected) {
                indicator.className = 'status-indicator connected';
                wsBox.querySelector('span').textContent = '🟢 WebSocket Bağlı';
            } else {
                indicator.className = 'status-indicator disconnected';
                wsBox.querySelector('span').textContent = '🔴 WebSocket Kopuk';
            }
            
            // Mode badge
            document.getElementById('mode-badge').textContent = data.paper_trading ? 'PAPER' : 'LIVE';
            
            // Trading toggle
            const toggle = document.getElementById('trading-toggle');
            toggle.checked = data.trading_enabled;
        })
        .catch(err => console.error('Status update error:', err));
}

// ================================================================
// ACCOUNT INFO
// ================================================================

function updateAccount() {
    fetch(`${API_BASE}/account`)
        .then(r => r.json())
        .then(data => {
            if (data.error) return;
            
            const pnlValue = document.getElementById('pnl-value');
            const pnlPct = document.getElementById('pnl-pct');
            const portfolioValue = document.getElementById('portfolio-value');
            const cashValue = document.getElementById('cash-value');
            
            // Update PnL
            const isPositive = data.total_pnl >= 0;
            pnlValue.textContent = `$${data.total_pnl >= 0 ? '+' : ''}${data.total_pnl.toFixed(2)}`;
            pnlValue.className = `metric-value ${isPositive ? 'positive' : 'negative'}`;
            
            pnlPct.textContent = `${data.total_pnl_pct >= 0 ? '+' : ''}${data.total_pnl_pct.toFixed(2)}%`;
            pnlPct.className = `metric-label ${isPositive ? 'positive' : 'negative'}`;
            
            // Update portfolio value
            portfolioValue.textContent = `$${data.portfolio_value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
            
            // Update cash
            cashValue.textContent = `$${data.cash.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
        })
        .catch(err => console.error('Account update error:', err));
}

// ================================================================
// POSITIONS
// ================================================================

function updatePositions() {
    fetch(`${API_BASE}/positions`)
        .then(r => r.json())
        .then(data => {
            document.getElementById('position-count').textContent = data.count;
            
            const tbody = document.getElementById('positions-table');
            
            if (data.count === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Açık pozisyon yok</td></tr>';
                return;
            }
            
            tbody.innerHTML = data.positions.map(pos => `
                <tr>
                    <td><strong>${pos.symbol}</strong></td>
                    <td>${pos.qty.toFixed(2)}</td>
                    <td>$${pos.entry_price.toFixed(2)}</td>
                    <td>$${pos.current_price.toFixed(2)}</td>
                    <td class="${pos.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">
                        ${pos.pnl >= 0 ? '+' : ''}$${pos.pnl.toFixed(2)}
                    </td>
                    <td class="${pos.pnl_pct >= 0 ? 'pnl-positive' : 'pnl-negative'}">
                        ${pos.pnl_pct >= 0 ? '+' : ''}${pos.pnl_pct.toFixed(2)}%
                    </td>
                </tr>
            `).join('');
        })
        .catch(err => console.error('Positions update error:', err));
}

// ================================================================
// PRICES
// ================================================================

function updatePrices() {
    Promise.all([
        fetch(`${API_BASE}/prices`).then(r => r.json()),
        fetch(`${API_BASE}/vix`).then(r => r.json())
    ])
        .then(([pricesData, vixData]) => {
            // Update VIX
            const vixValue = document.getElementById('vix-value');
            const vixLabel = document.getElementById('vix-label');
            
            vixValue.textContent = vixData.vix.toFixed(1);
            vixValue.className = `metric-value ${vixData.status === 'high_fear' ? 'negative' : ''}`;
            
            if (vixData.status === 'high_fear') {
                vixLabel.textContent = 'Yüksek Korku';
                vixLabel.className = 'metric-label negative';
            } else if (vixData.status === 'fear') {
                vixLabel.textContent = 'Korku';
                vixLabel.className = 'metric-label negative';
            } else {
                vixLabel.textContent = 'Normal';
                vixLabel.className = 'metric-label';
            }
            
            // Update prices grid
            const grid = document.getElementById('prices-grid');
            const prices = pricesData.prices || {};
            
            if (Object.keys(prices).length === 0) {
                grid.innerHTML = '<div class="text-center text-muted">Fiyat verisi bekleniyor...</div>';
                return;
            }
            
            grid.innerHTML = Object.entries(prices).map(([symbol, price]) => `
                <div class="price-card">
                    <div class="card-symbol">${symbol}</div>
                    <div class="card-value">$${price.toFixed(2)}</div>
                    <div class="card-label">Güncel Fiyat</div>
                </div>
            `).join('');
        })
        .catch(err => console.error('Prices update error:', err));
}

// ================================================================
// HEATMAP
// ================================================================

function updateHeatmap() {
    fetch(`${API_BASE}/heatmap`)
        .then(r => r.json())
        .then(data => {
            const grid = document.getElementById('heatmap-grid');
            
            grid.innerHTML = Object.entries(data).map(([symbol, info]) => {
                const statusClass = info.status;
                let statusText = '';
                
                if (info.status === 'oversold') {
                    statusText = '🟢 AŞIRI SATIM';
                } else if (info.status === 'overbought') {
                    statusText = '🔴 AŞIRI ALIM';
                } else {
                    statusText = '🟡 NÖTR';
                }
                
                return `
                    <div class="heatmap-card ${statusClass}">
                        <div class="card-symbol">${symbol}</div>
                        <div class="card-value">${info.rsi}</div>
                        <div class="card-label">RSI</div>
                        <div class="card-label" style="margin-top: 8px;">${statusText}</div>
                    </div>
                `;
            }).join('');
        })
        .catch(err => console.error('Heatmap update error:', err));
}

// ================================================================
// ALERTS
// ================================================================

function updateAlerts() {
    fetch(`${API_BASE}/alerts`)
        .then(r => r.json())
        .then(data => {
            const container = document.getElementById('alerts-container');
            
            if (data.count === 0) {
                container.innerHTML = '<div class="text-center text-muted">Uyarı yok</div>';
                return;
            }
            
            container.innerHTML = data.alerts.map(alert => {
                const time = new Date(alert.time).toLocaleTimeString('tr-TR');
                const alertClass = `alert alert-${alert.level}`;
                
                return `
                    <div class="${alertClass}">
                        <div class="alert-title">${alert.title}</div>
                        <div>${alert.message}</div>
                        <div class="alert-time">${time}</div>
                    </div>
                `;
            }).join('');
        })
        .catch(err => console.error('Alerts update error:', err));
}

// ================================================================
// LOGS
// ================================================================

function updateLogs() {
    fetch(`${API_BASE}/logs?n=50`)
        .then(r => r.json())
        .then(data => {
            const output = document.getElementById('logs-output');
            output.textContent = data.logs.join('\n');
            output.scrollTop = output.scrollHeight;
        })
        .catch(err => console.error('Logs update error:', err));
}

// ================================================================
// CONTROL BUTTONS
// ================================================================

function initializeEventListeners() {
    // Kill Switch
    document.getElementById('kill-switch-btn').addEventListener('click', () => {
        if (confirm('KILL SWITCH etkinleştirilecek. Tüm pozisyonlar kapatılacak. Emin misiniz?')) {
            fetch(`${API_BASE}/control/kill-switch`, { method: 'POST' })
                .then(r => r.json())
                .then(data => {
                    showToast('KILL SWITCH Aktif!', 'danger');
                    updateStatus();
                })
                .catch(err => {
                    showToast('Hata: ' + err.message, 'danger');
                });
        }
    });
    
    // Reset
    document.getElementById('reset-btn').addEventListener('click', () => {
        fetch(`${API_BASE}/control/reset`, { method: 'POST' })
            .then(r => r.json())
            .then(data => {
                showToast('Sistem resetlendi', 'success');
                updateStatus();
                updateAlerts();
            })
            .catch(err => {
                showToast('Hata: ' + err.message, 'danger');
            });
    });
    
    // Trading Toggle
    document.getElementById('trading-toggle').addEventListener('change', (e) => {
        fetch(`${API_BASE}/control/toggle-trading`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: e.target.checked })
        })
            .then(r => r.json())
            .then(data => {
                const status = e.target.checked ? 'aktif' : 'pasif';
                showToast(`Bot ${status} edildi`, 'info');
            })
            .catch(err => {
                showToast('Hata: ' + err.message, 'danger');
            });
    });
}

// ================================================================
// TOAST NOTIFICATIONS
// ================================================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const id = 'toast-' + Date.now();
    
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    
    const bgClass = {
        'info': 'bg-info',
        'success': 'bg-success',
        'warning': 'bg-warning',
        'danger': 'bg-danger'
    }[type] || 'bg-info';
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    container.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// ================================================================
// PAGE UNLOAD
// ================================================================

window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
