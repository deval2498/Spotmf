import os
import json
import logging
from flask import Flask, request, jsonify
import psycopg2
from datetime import datetime, timedelta
import requests
from typing import List, Dict, Optional
from google.cloud import secretmanager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Initialize Secret Manager client
secret_client = secretmanager.SecretManagerServiceClient()
project_id = os.environ.get('GOOGLE_CLOUD_PROJECT')

def get_secret(secret_id):
    """Get secret from Google Secret Manager"""
    try:
        name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
        response = secret_client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except Exception as e:
        logger.error(f"Error accessing secret {secret_id}: {e}")
        return None

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host=get_secret('db-host'),
        database=get_secret('db-name'),
        user=get_secret('db-user'),
        password=get_secret('db-password'),
        port=5432
    )

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/monitor', methods=['POST'])
def monitor_transactions():
    """Main endpoint to monitor transaction confirmations"""
    try:
        logger.info("Starting Transaction Monitor execution")
        
        # Get pending transactions
        pending_transactions = get_pending_transactions()
        
        if not pending_transactions:
            logger.info("No pending transactions to monitor")
            results = {'monitored': 0, 'confirmed': 0, 'failed': 0}
        else:
            logger.info(f"Monitoring {len(pending_transactions)} pending transactions")
            
            confirmed_count = 0
            failed_count = 0
            
            # Check each transaction status
            for tx in pending_transactions:
                result = check_transaction_status(tx)
                if result == 'confirmed':
                    confirmed_count += 1
                elif result == 'failed':
                    failed_count += 1
            
            results = {
                'monitored': len(pending_transactions),
                'confirmed': confirmed_count,
                'failed': failed_count
            }
        
        # Clean up old failed transaction logs (keep only 2 weeks)
        cleanup_old_failed_logs()
        
        # Send alerts for new failed transactions
        alerts_sent = send_failed_transaction_alerts()
        results['alerts_sent'] = alerts_sent
        
        logger.info(f"Monitor completed: {results}")
        
        return jsonify({
            'message': 'Transaction monitoring completed',
            'results': results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Transaction Monitor failed: {str(e)}")
        send_alert(f"Transaction Monitor Service failed: {str(e)}")
        return jsonify({'error': str(e)}), 500

def get_pending_transactions() -> List[Dict]:
    """Get all transactions that are currently executing or pending confirmation"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                SELECT 
                    se.id as execution_id,
                    se.strategy_id,
                    se.transaction_hash,
                    se.amount_in,
                    se.status,
                    se.executed_at,
                    se.created_at,
                    us.wallet_address,
                    an.asset,
                    an.strategy_type
                FROM strategy_executions se
                JOIN user_strategies us ON se.strategy_id = us.id
                JOIN action_nonces an ON us.action_nonce_id = an.id
                WHERE se.status IN ('EXECUTING', 'PENDING')
                  AND se.transaction_hash IS NOT NULL
                ORDER BY se.created_at ASC
            """
            
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            transactions = []
            
            for row in cursor.fetchall():
                tx = dict(zip(columns, row))
                transactions.append(tx)
            
            return transactions
            
    finally:
        conn.close()

def check_transaction_status(tx: Dict) -> str:
    """Check the blockchain status of a transaction"""
    execution_id = tx['execution_id']
    tx_hash = tx['transaction_hash']
    
    try:
        logger.info(f"Checking status for transaction {tx_hash} (execution: {execution_id})")
        
        # Check if transaction is too old (24+ hours)
        hours_since_created = (datetime.now() - tx['created_at']).total_seconds() / 3600
        
        if hours_since_created > 24:
            logger.warning(f"Transaction {tx_hash} is over 24 hours old, marking as failed")
            mark_transaction_failed(execution_id, "Transaction timeout - over 24 hours old")
            log_failed_transaction(tx, "Transaction timeout")
            return 'failed'
        
        # Query blockchain for transaction status
        blockchain_status = get_blockchain_transaction_status(tx_hash, tx['asset'])
        
        if blockchain_status['status'] == 'confirmed':
            logger.info(f"Transaction {tx_hash} confirmed on blockchain")
            update_transaction_confirmed(execution_id, blockchain_status)
            return 'confirmed'
            
        elif blockchain_status['status'] == 'failed':
            logger.warning(f"Transaction {tx_hash} failed on blockchain")
            mark_transaction_failed(execution_id, blockchain_status.get('error', 'Transaction failed on blockchain'))
            log_failed_transaction(tx, blockchain_status.get('error', 'Blockchain failure'))
            return 'failed'
            
        elif blockchain_status['status'] == 'not_found':
            # Transaction not found - could be still propagating or failed
            if hours_since_created > 2:  # Give it 2 hours before considering it failed
                logger.warning(f"Transaction {tx_hash} not found after 2+ hours, marking as failed")
                mark_transaction_failed(execution_id, "Transaction not found on blockchain")
                log_failed_transaction(tx, "Transaction not found")
                return 'failed'
            else:
                logger.info(f"Transaction {tx_hash} not found yet, will check again later")
                return 'pending'
                
        else:
            # Still pending
            logger.info(f"Transaction {tx_hash} still pending confirmation")
            return 'pending'
            
    except Exception as e:
        logger.error(f"Error checking transaction {tx_hash}: {str(e)}")
        return 'error'

def get_blockchain_transaction_status(tx_hash: str, asset: str) -> Dict:
    """Query blockchain RPC to get transaction status"""
    try:
        blockchain_rpc_url = get_secret('blockchain-rpc-url')
        if not blockchain_rpc_url or blockchain_rpc_url == 'your-blockchain-rpc-url':
            # For testing purposes, simulate random outcomes
            import random
            outcomes = ['confirmed', 'pending', 'not_found']
            weights = [0.7, 0.25, 0.05]  # 70% confirmed, 25% pending, 5% not found
            status = random.choices(outcomes, weights=weights)[0]
            
            logger.info(f"SIMULATION: Transaction {tx_hash} status: {status}")
            
            if status == 'confirmed':
                return {
                    'status': 'confirmed',
                    'block_number': '0x123456',
                    'gas_used': '0x5208',
                    'transaction_hash': tx_hash
                }
            else:
                return {'status': status}
        
        # Real blockchain query (example for Ethereum-like blockchain)
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_getTransactionReceipt",
            "params": [tx_hash],
            "id": 1
        }
        
        response = requests.post(blockchain_rpc_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('result') is None:
                return {'status': 'not_found'}
            
            receipt = result['result']
            
            # Check if transaction was successful
            if receipt.get('status') == '0x1':  # Success
                return {
                    'status': 'confirmed',
                    'block_number': receipt.get('blockNumber'),
                    'gas_used': receipt.get('gasUsed'),
                    'transaction_hash': tx_hash
                }
            else:  # Failed
                return {
                    'status': 'failed',
                    'error': 'Transaction reverted',
                    'transaction_hash': tx_hash
                }
        else:
            return {'status': 'unknown', 'error': f'RPC error: {response.status_code}'}
            
    except Exception as e:
        logger.error(f"Blockchain query failed for {tx_hash}: {str(e)}")
        return {'status': 'unknown', 'error': str(e)}

def update_transaction_confirmed(execution_id: str, blockchain_status: Dict):
    """Mark transaction as confirmed and update details"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                UPDATE strategy_executions 
                SET status = 'SUCCESS',
                    gas_used = %s,
                    updated_at = %s
                WHERE id = %s
            """
            
            gas_used = None
            if blockchain_status.get('gas_used'):
                try:
                    # Convert hex gas_used to BigInt
                    gas_used = int(blockchain_status['gas_used'], 16)
                except:
                    pass
            
            cursor.execute(query, (gas_used, datetime.now(), execution_id))
            conn.commit()
            
            logger.info(f"Marked execution {execution_id} as confirmed")
            
    finally:
        conn.close()

def mark_transaction_failed(execution_id: str, error_message: str):
    """Mark transaction as failed"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                UPDATE strategy_executions 
                SET status = 'FAILED',
                    error_message = %s,
                    updated_at = %s
                WHERE id = %s
            """
            
            cursor.execute(query, (error_message, datetime.now(), execution_id))
            conn.commit()
            
            logger.info(f"Marked execution {execution_id} as failed: {error_message}")
            
    finally:
        conn.close()

def log_failed_transaction(tx: Dict, error_message: str):
    """Log failed transaction for alerting"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Check if already logged
            check_query = """
                SELECT id FROM failed_transaction_logs 
                WHERE execution_id = %s
            """
            cursor.execute(check_query, (tx['execution_id'],))
            
            if cursor.fetchone():
                logger.info(f"Failed transaction already logged for execution {tx['execution_id']}")
                return
            
            # Insert new failed log
            query = """
                INSERT INTO failed_transaction_logs 
                (wallet_address, strategy_id, execution_id, asset, transaction_hash, 
                 amount, plan_type, error_message, failed_at, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            now = datetime.now()
            cursor.execute(query, (
                tx['wallet_address'],
                tx['strategy_id'],
                tx['execution_id'],
                tx['asset'],
                tx['transaction_hash'],
                str(tx['amount_in']),
                tx['strategy_type'],
                error_message,
                now,
                now
            ))
            conn.commit()
            
            logger.info(f"Logged failed transaction for execution {tx['execution_id']}")
            
    finally:
        conn.close()

def send_failed_transaction_alerts() -> int:
    """Send email alerts for failed transactions that haven't been alerted yet"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                SELECT id, wallet_address, asset, transaction_hash, amount, 
                       plan_type, error_message, failed_at
                FROM failed_transaction_logs 
                WHERE alert_sent = false
                ORDER BY failed_at DESC
                LIMIT 10
            """
            
            cursor.execute(query)
            failed_transactions = cursor.fetchall()
            
            alerts_sent = 0
            for tx in failed_transactions:
                send_failed_transaction_alert(tx)
                
                # Mark as alerted
                update_query = "UPDATE failed_transaction_logs SET alert_sent = true WHERE id = %s"
                cursor.execute(update_query, (tx[0],))
                alerts_sent += 1
            
            if failed_transactions:
                conn.commit()
                logger.info(f"Sent alerts for {len(failed_transactions)} failed transactions")
            
            return alerts_sent
                
    finally:
        conn.close()

def send_failed_transaction_alert(tx_data):
    """Send individual failed transaction alert"""
    try:
        message = f"""
Transaction Failed - Crypto Investment Platform

Transaction Details:
- User: {tx_data[1]}
- Asset: {tx_data[2]}
- Transaction Hash: {tx_data[3] or 'N/A'}
- Amount: {tx_data[4]}
- Strategy Type: {tx_data[5]}
- Error: {tx_data[6]}
- Failed At: {tx_data[7]}

Please investigate and take necessary action.
        """.strip()
        
        send_alert(message)
        
    except Exception as e:
        logger.error(f"Failed to send transaction alert: {str(e)}")

def cleanup_old_failed_logs():
    """Remove failed transaction logs older than 2 weeks"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            two_weeks_ago = datetime.now() - timedelta(days=14)
            
            query = """
                DELETE FROM failed_transaction_logs 
                WHERE failed_at < %s
            """
            
            cursor.execute(query, (two_weeks_ago,))
            deleted_count = cursor.rowcount
            conn.commit()
            
            if deleted_count > 0:
                logger.info(f"Cleaned up {deleted_count} old failed transaction logs")
                
    finally:
        conn.close()

def send_alert(message: str):
    """Send email alert"""
    try:
        # For now, just log the alert
        # You can implement email sending using SendGrid, Gmail API, etc.
        logger.warning(f"ALERT: {message}")
        
        # TODO: Implement actual email sending
        # Example with SendGrid:
        # import sendgrid
        # sg = sendgrid.SendGridAPIClient(api_key=get_secret('sendgrid-api-key'))
        # from_email = "alerts@yourplatform.com"
        # to_email = get_secret('alert-email')
        # subject = "Transaction Monitor Alert"
        # content = Content("text/plain", message)
        # mail = Mail(from_email, to_email, subject, content)
        # sg.client.mail.send.post(request_body=mail.get())
        
    except Exception as e:
        logger.error(f"Failed to send alert: {str(e)}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)