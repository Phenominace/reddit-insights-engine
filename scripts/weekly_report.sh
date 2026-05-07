#!/bin/bash

# Reddit Insights Engine - Weekly Cron Job Script
# Run this script weekly via cron to generate automated reports

# ============================================
# SETUP INSTRUCTIONS
# ============================================
# 1. Make this script executable:
#    chmod +x scripts/weekly_report.sh
#
# 2. Add to crontab (runs every Monday at 6 AM):
#    crontab -e
#    0 6 * * 1 /path/to/scripts/weekly_report.sh >> /var/log/reddit-insights.log 2>&1
#
# 3. Or use systemd timer for more control
# ============================================

# Configuration
PROJECT_DIR="/home/z/my-project"
OUTPUT_DIR="$PROJECT_DIR/download"
LOG_FILE="$PROJECT_DIR/logs/weekly_$(date +%Y%m%d).log"
API_URL="http://localhost:3000"

# Create log directory
mkdir -p "$PROJECT_DIR/logs"

echo "========================================" | tee -a "$LOG_FILE"
echo "Reddit Insights Weekly Report" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Ensure server is running
echo "Checking if server is running..." | tee -a "$LOG_FILE"
if ! curl -s "$API_URL" > /dev/null 2>&1; then
    echo "Server not running. Starting..." | tee -a "$LOG_FILE"
    cd "$PROJECT_DIR"
    bun run start &
    sleep 10
fi

# Start scraping job
echo "Starting scraping job..." | tee -a "$LOG_FILE"
RESPONSE=$(curl -s -X POST "$API_URL/api/reddit" \
    -H "Content-Type: application/json" \
    -d '{"action": "start"}')

JOB_ID=$(echo "$RESPONSE" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)
echo "Job ID: $JOB_ID" | tee -a "$LOG_FILE"

if [ -z "$JOB_ID" ]; then
    echo "ERROR: Failed to start job" | tee -a "$LOG_FILE"
    echo "$RESPONSE" | tee -a "$LOG_FILE"
    exit 1
fi

# Wait for job to complete (max 30 minutes)
MAX_WAIT=1800
WAITED=0
echo "Waiting for job to complete..." | tee -a "$LOG_FILE"

while [ $WAITED -lt $MAX_WAIT ]; do
    STATUS=$(curl -s "$API_URL/api/reddit?action=status&jobId=$JOB_ID")
    JOB_STATUS=$(echo "$STATUS" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    PROGRESS=$(echo "$STATUS" | grep -o '"progress":[0-9]*' | cut -d':' -f2)
    
    echo "Status: $JOB_STATUS, Progress: $PROGRESS%" | tee -a "$LOG_FILE"
    
    if [ "$JOB_STATUS" = "completed" ]; then
        echo "Job completed successfully!" | tee -a "$LOG_FILE"
        break
    elif [ "$JOB_STATUS" = "failed" ]; then
        echo "ERROR: Job failed" | tee -a "$LOG_FILE"
        echo "$STATUS" | tee -a "$LOG_FILE"
        exit 1
    fi
    
    sleep 30
    WAITED=$((WAITED + 30))
done

if [ $WAITED -ge $MAX_WAIT ]; then
    echo "WARNING: Job timed out after 30 minutes" | tee -a "$LOG_FILE"
fi

# List generated reports
echo "" | tee -a "$LOG_FILE"
echo "Generated Reports:" | tee -a "$LOG_FILE"
curl -s "$API_URL/api/reddit?action=list" | python3 -m json.tool 2>/dev/null | tee -a "$LOG_FILE"

# Cleanup old reports (keep last 10)
echo "" | tee -a "$LOG_FILE"
echo "Cleaning up old reports..." | tee -a "$LOG_FILE"
cd "$OUTPUT_DIR"
ls -t *.xlsx *.json 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null
echo "Done!" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Weekly report completed: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Optional: Send notification (uncomment and configure)
# curl -X POST "YOUR_WEBHOOK_URL" \
#     -H "Content-Type: application/json" \
#     -d "{\"text\": \"Reddit Insights Weekly Report Complete! Check $OUTPUT_DIR for results.\"}"
