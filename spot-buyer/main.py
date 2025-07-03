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

@app.route('/execute', methods=['POST'])
def execute_strategies():
    """Main endpoint to execute investment strategies"""
    try:
        logger.info("Starting Spot Buyer execution")
        
        # Get all active strategies ready for execution
        strategies_to_execute = get_strategies_ready_for_execution()
        
        if not strategies_to_execute:
            logger.info("No strategies ready for execution")
            return jsonify({'message': 'No strategies ready for execution', 'count': 0})
        
        logger.info(f"Found {len(strategies_to_execute)} strategies ready for execution")
        
        # Process each strategy
        execution_results = []
        for strategy in strategies_to_execute:
            result = process_strategy(strategy)
            execution_results.append(result)
        
        # Summary
        successful = len([r for r in execution_results if r['success']])
        failed = len([r for r in execution_results if not r['success']])
        
        logger.info(f"Execution completed. Successful: {successful}, Failed: {failed}")
        
        return jsonify({
            'message': f'Processed {len(strategies_to_execute)} strategies',
            'successful': successful,
            'failed': failed,
            'results': execution_results
        })
        
    except Exception as e:
        logger.error(f"Service execution failed: {str(e)}")
        send_alert(f"Spot Buyer Service failed: {str(e)}")
        return jsonify({'error': str(e)}), 500

def get_strategies_ready_for_execution() -> List[Dict]:
    """Get all active strategies that are ready for execution"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                SELECT 
                    us.id as strategy_id,
                    us.wallet_address,
                    us.last_executed_at,
                    us.total_executions,
                    an.strategy_type,
                    an.asset,
                    an.interval_amount,
                    an.interval_days,
                    an.accepted_slippage,
                    an.total_amount
                FROM user_strategies us
                JOIN action_nonces an ON us.action_nonce_id = an.id
                WHERE us.is_active = true 
                  AND us.status = 'ACTIVE'
                ORDER BY us.last_executed_at ASC NULLS FIRST
            """
            
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            strategies = []
            
            for row in cursor.fetchall():
                strategy = dict(zip(columns, row))
                
                # Check if strategy is ready for execution
                if is_strategy_ready_for_execution(strategy):
                    strategies.append(strategy)
            
            return strategies
            
    finally:
        conn.close()

def is_strategy_ready_for_execution(strategy: Dict) -> bool:
    """Check if a strategy is ready for execution based on interval"""
    interval_days = strategy['interval_days']
    last_executed_at = strategy['last_executed_at']
    
    # If never executed, it's ready
    if last_executed_at is None:
        logger.info(f"Strategy {strategy['strategy_id']} ready - never executed")
        return True
    
    # Check if enough days have passed since last execution
    days_since_last = (datetime.now() - last_executed_at).days
    
    if days_since_last >= interval_days:
        logger.info(f"Strategy {strategy['strategy_id']} ready - {days_since_last} days since last execution (interval: {interval_days})")
        return True
    
    logger.debug(f"Strategy {strategy['strategy_id']} not ready - only {days_since_last} days since last execution (need {interval_days})")
    return False

def process_strategy(strategy: Dict) -> Dict:
    """Process a single strategy execution"""
    strategy_id = strategy['strategy_id']
    strategy_type = strategy['strategy_type']
    asset = strategy['asset']
    
    try:
        logger.info(f"Processing strategy {strategy_id} (type: {strategy_type}, asset: {asset})")
        
        # Check execution conditions based on strategy type
        should_execute, trigger_reason = should_execute_strategy(strategy)
        
        if not should_execute:
            logger.info(f"Strategy {strategy_id} conditions not met: {trigger_reason}")
            return {
                'strategy_id': strategy_id,
                'success': True,
                'action': 'skipped',
                'reason': trigger_reason
            }
        
        # Create execution record
        execution_id = create_execution_record(strategy, trigger_reason)
        
        # Call transaction API
        tx_result = call_transaction_api(strategy, execution_id)
        
        if tx_result['success']:
            # Update execution record with transaction hash
            update_execution_record(execution_id, tx_result['tx_hash'], 'EXECUTING')
            
            # Update strategy last executed time
            update_strategy_last_execution(strategy_id)
            
            logger.info(f"Strategy {strategy_id} executed successfully. TX: {tx_result['tx_hash']}")
            
            return {
                'strategy_id': strategy_id,
                'success': True,
                'action': 'executed',
                'tx_hash': tx_result['tx_hash'],
                'execution_id': execution_id,
                'trigger_reason': trigger_reason
            }
        else:
            # Mark execution as failed
            update_execution_record(execution_id, None, 'FAILED', tx_result['error'])
            
            # Log failed transaction
            log_failed_transaction(strategy, execution_id, tx_result['error'])
            
            logger.error(f"Strategy {strategy_id} execution failed: {tx_result['error']}")
            
            return {
                'strategy_id': strategy_id,
                'success': False,
                'action': 'failed',
                'error': tx_result['error'],
                'execution_id': execution_id
            }
            
    except Exception as e:
        logger.error(f"Error processing strategy {strategy_id}: {str(e)}")
        return {
            'strategy_id': strategy_id,
            'success': False,
            'action': 'error',
            'error': str(e)
        }

def should_execute_strategy(strategy: Dict) -> tuple[bool, str]:
    """Determine if strategy should execute based on type and conditions"""
    strategy_type = strategy['strategy_type']
    asset = strategy['asset']
    
    if strategy_type == 'DCA':
        # Simple DCA - execute if interval passed (already checked)
        return True, 'DCA_INTERVAL'
        
    elif strategy_type == 'DCA_WITH_DMA':
        # DMA-based DCA - check if price is below DMA
        dma_status = get_latest_dma_status(asset)
        
        if dma_status is None:
            logger.warning(f"No DMA status found for {asset}")
            return False, 'NO_DMA_DATA'
        
        if dma_status['status'] == 'BELOW':
            return True, 'DMA_BELOW'
        else:
            return False, 'DMA_ABOVE'
    
    return False, 'UNKNOWN_STRATEGY_TYPE'

def get_latest_dma_status(asset: str) -> Optional[Dict]:
    """Get the latest DMA status for an asset"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                SELECT current_price, dma_200, status, calculated_at
                FROM dma_status 
                WHERE asset = %s 
                ORDER BY calculated_at DESC 
                LIMIT 1
            """
            
            cursor.execute(query, (asset,))
            row = cursor.fetchone()
            
            if row:
                return {
                    'current_price': row[0],
                    'dma_200': row[1],
                    'status': row[2],
                    'calculated_at': row[3]
                }
            
            return None
            
    finally:
        conn.close()

def create_execution_record(strategy: Dict, trigger_reason: str) -> str:
    """Create a new strategy execution record"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                INSERT INTO strategy_executions 
                (strategy_id, amount_in, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """
            
            now = datetime.now()
            cursor.execute(query, (
                strategy['strategy_id'],
                strategy['interval_amount'],
                'PENDING',
                now,
                now
            ))
            
            execution_id = cursor.fetchone()[0]
            conn.commit()
            
            logger.info(f"Created execution record {execution_id} for strategy {strategy['strategy_id']}")
            return execution_id
            
    finally:
        conn.close()

def call_transaction_api(strategy: Dict, execution_id: str) -> Dict:
    """Call your transaction broadcasting API"""
    try:
        api_url = get_secret('transaction-api-url')
        api_key = get_secret('transaction-api-key')
        
        if not api_url or api_url == 'your-transaction-api-url':
            # For testing purposes, simulate API response
            import random
            if random.random() > 0.2:  # 80% success rate
                fake_tx_hash = f"0x{''.join([hex(random.randint(0, 15))[2:] for _ in range(64)])}"
                return {
                    'success': True,
                    'tx_hash': fake_tx_hash,
                    'response': {'status': 'broadcasted', 'transaction_hash': fake_tx_hash}
                }
            else:
                return {
                    'success': False,
                    'error': 'Simulated API failure for testing'
                }
        
        payload = {
            'wallet_address': strategy['wallet_address'],
            'asset': strategy['asset'],
            'amount': str(strategy['interval_amount']),
            'slippage': float(strategy['accepted_slippage']),
            'execution_id': execution_id,
            'strategy_id': strategy['strategy_id']
        }
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        logger.info(f"Calling transaction API for execution {execution_id}")
        
        response = requests.post(api_url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return {
                'success': True,
                'tx_hash': result.get('transaction_hash'),
                'response': result
            }
        else:
            return {
                'success': False,
                'error': f'API call failed with status {response.status_code}: {response.text}'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'Transaction API call failed: {str(e)}'
        }

def update_execution_record(execution_id: str, tx_hash: Optional[str], status: str, error_message: Optional[str] = None):
    """Update strategy execution record with transaction details"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                UPDATE strategy_executions 
                SET transaction_hash = %s, status = %s, error_message = %s, updated_at = %s
                WHERE id = %s
            """
            
            cursor.execute(query, (tx_hash, status, error_message, datetime.now(), execution_id))
            conn.commit()
            
    finally:
        conn.close()

def update_strategy_last_execution(strategy_id: str):
    """Update strategy last execution timestamp and increment counters"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                UPDATE user_strategies 
                SET last_executed_at = %s, 
                    total_executions = total_executions + 1,
                    updated_at = %s
                WHERE id = %s
            """
            
            now = datetime.now()
            cursor.execute(query, (now, now, strategy_id))
            conn.commit()
            
    finally:
        conn.close()

def log_failed_transaction(strategy: Dict, execution_id: str, error_message: str):
    """Log failed transaction for monitoring"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                INSERT INTO failed_transaction_logs 
                (wallet_address, strategy_id, execution_id, asset, amount, plan_type, error_message, failed_at, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            now = datetime.now()
            cursor.execute(query, (
                strategy['wallet_address'],
                strategy['strategy_id'],
                execution_id,
                strategy['asset'],
                str(strategy['interval_amount']),
                strategy['strategy_type'],
                error_message,
                now,
                now
            ))
            conn.commit()
            
            # Send immediate alert for failed transaction
            send_alert(f"Transaction failed for user {strategy['wallet_address']}: {error_message}")
            
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
        # subject = "Spot Buyer Alert"
        # content = Content("text/plain", message)
        # mail = Mail(from_email, to_email, subject, content)
        # sg.client.mail.send.post(request_body=mail.get())
        
    except Exception as e:
        logger.error(f"Failed to send alert: {str(e)}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)