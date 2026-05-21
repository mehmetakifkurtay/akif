"""
Flask Web Dashboard for NASDAQ Trading Bot
REST API + WebSocket support for real-time updates
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import threading
import time

# Bot modülünü import et
sys.path.insert(0, str(Path(__file__).parent))

app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

# Global bot instance
bot_state = None

# ================================================================
# API ENDPOINTS
# ================================================================

@app.route('/', methods=['GET'])
def dashboard():
    """Ana dashboard sayfası"""
    return render_template('dashboard.html')

@app.route('/api/status', methods=['GET'])
def get_status():
    """Bot durumu"""
    try:
        from deepseek_python_20260521_fc7173 import state, ws_manager, logger, ALPACA_PAPER_TRADING
        
        return jsonify({
            'status': 'ok',
            'ws_connected': state.is_ws_connected(),
            'trading_enabled': state.is_trading_enabled(),
            'paper_trading': ALPACA_PAPER_TRADING,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/account', methods=['GET'])
def get_account_info():
    """Hesap bilgileri"""
    try:
        from deepseek_python_20260521_fc7173 import get_account, INITIAL_CAPITAL
        
        account = get_account()
        if account:
            total_value = float(account.get('portfolio_value', INITIAL_CAPITAL))
            cash = float(account.get('cash', INITIAL_CAPITAL))
            total_pnl = total_value - INITIAL_CAPITAL
            total_pnl_pct = (total_pnl / INITIAL_CAPITAL) * 100
            
            return jsonify({
                'portfolio_value': total_value,
                'cash': cash,
                'total_pnl': total_pnl,
                'total_pnl_pct': total_pnl_pct,
                'buying_power': float(account.get('buying_power', 0))
            })
        return jsonify({'error': 'Hesap bilgisi alınamadı'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/positions', methods=['GET'])
def get_positions_info():
    """Açık pozisyonlar"""
    try:
        from deepseek_python_20260521_fc7173 import get_positions, get_live_price
        
        positions = get_positions()
        data = []
        for pos in positions:
            symbol = pos['symbol']
            qty = float(pos['qty'])
            entry = float(pos['avg_entry_price'])
            current = get_live_price(symbol)
            pnl = (current - entry) * qty
            pnl_pct = (current - entry) / entry * 100 if entry > 0 else 0
            
            data.append({
                'symbol': symbol,
                'qty': qty,
                'entry_price': entry,
                'current_price': current,
                'pnl': pnl,
                'pnl_pct': pnl_pct
            })
        
        return jsonify({'positions': data, 'count': len(data)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/prices', methods=['GET'])
def get_prices_info():
    """Güncel fiyatlar"""
    try:
        from deepseek_python_20260521_fc7173 import state
        
        prices = state.get_all_prices()
        return jsonify({'prices': prices})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/market-depth/<symbol>', methods=['GET'])
def get_market_depth_info(symbol):
    """Piyasa derinliği"""
    try:
        from deepseek_python_20260521_fc7173 import state
        
        depth = state.get_market_depth(symbol.upper())
        if depth:
            return jsonify(depth)
        return jsonify({'error': 'Piyasa derinliği bulunamamadı'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/vix', methods=['GET'])
def get_vix_info():
    """VIX değeri"""
    try:
        from deepseek_python_20260521_fc7173 import get_vix
        
        vix = get_vix()
        status = 'high_fear' if vix >= 30 else 'fear' if vix >= 25 else 'normal'
        return jsonify({'vix': vix, 'status': status})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/heatmap', methods=['GET'])
def get_heatmap_info():
    """Piyasa sıcaklık haritası"""
    try:
        from deepseek_python_20260521_fc7173 import get_heatmap_data
        
        heatmap = get_heatmap_data()
        return jsonify(heatmap)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/alerts', methods=['GET'])
def get_alerts_info():
    """Aktif uyarılar"""
    try:
        from deepseek_python_20260521_fc7173 import state
        
        alerts = state.get_alerts()
        # Convert datetime to string
        for alert in alerts:
            alert['time'] = alert['time'].isoformat()
        
        return jsonify({'alerts': alerts, 'count': len(alerts)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs', methods=['GET'])
def get_logs_info():
    """Bot logları"""
    try:
        from deepseek_python_20260521_fc7173 import logger
        
        n = request.args.get('n', 100, type=int)
        logs = logger.get_logs(n)
        return jsonify({'logs': logs, 'count': len(logs)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/control/kill-switch', methods=['POST'])
def kill_switch():
    """Acil durdurma"""
    try:
        from deepseek_python_20260521_fc7173 import (
            cancel_all_orders, close_all_positions, state, logger
        )
        
        cancel_all_orders()
        close_all_positions()
        state.set_trading_enabled(False)
        state.add_alert('error', 'KILL SWITCH', 'Tüm emirler iptal edildi')
        logger.error('KILL SWITCH aktif edildi')
        
        return jsonify({'status': 'success', 'message': 'Kill switch aktif'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/control/reset', methods=['POST'])
def reset_system():
    """Sistem resetleme"""
    try:
        from deepseek_python_20260521_fc7173 import state, logger
        
        state.set_trading_enabled(True)
        state.clear_alerts()
        logger.info('Sistem resetlendi')
        
        return jsonify({'status': 'success', 'message': 'Sistem resetlendi'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/control/toggle-trading', methods=['POST'])
def toggle_trading():
    """Trading aktif/pasif"""
    try:
        from deepseek_python_20260521_fc7173 import state, logger
        
        data = request.get_json()
        enabled = data.get('enabled', False)
        state.set_trading_enabled(enabled)
        status = 'aktif' if enabled else 'pasif'
        logger.info(f'Trading {status} edildi')
        
        return jsonify({'status': 'success', 'enabled': enabled})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/symbols', methods=['GET'])
def get_symbols():
    """İşlem yapılan semboller"""
    try:
        from deepseek_python_20260521_fc7173 import SYMBOLS
        
        return jsonify({'symbols': SYMBOLS})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================================================================
# SAĞLIK KONTROLÜ
# ================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Sağlık kontrolü"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# ================================================================
# ERROR HANDLERS
# ================================================================

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint bulunamadı'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'İç sunucu hatası'}), 500

# ================================================================
# MAIN
# ================================================================

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("  FLASK WEB DASHBOARD - NASDAQ BOT")
    print("=" * 70)
    print("  Web arayüzü: http://localhost:5000")
    print("  API docs: http://localhost:5000/api")
    print("=" * 70 + "\n")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )
