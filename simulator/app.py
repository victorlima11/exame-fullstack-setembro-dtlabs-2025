import os
import requests
import time
import random
from datetime import datetime

API_BASE = "http://host.docker.internal:3000/api/v1"
SNS_URL = f"{API_BASE}/opendevices/sns"
HEARTBEAT_URL = f"{API_BASE}/heartbeats"


def get_devices_with_retry(max_retries=10, delay=5):
    for attempt in range(max_retries):
        try:
            res = requests.get(SNS_URL, timeout=5)
            res.raise_for_status()
            sns = res.json()
            if sns:
                return sns
        except Exception as e:
            print(f"Attempt {attempt+1}/{max_retries} failed: {e}")
            time.sleep(delay)
    return []


def simulate_heartbeat(sn):
    return {
        "device_sn": sn,
        "cpu_usage": round(random.uniform(0, 100), 2),
        "ram_usage": round(random.uniform(0, 100), 2),
        "disk_free": round(random.uniform(0, 100), 2),
        "temperature": round(random.uniform(20, 80), 2),
        "latency": random.randint(10, 200),
        "connectivity": random.choice([0, 1]),
        "boot_time": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


if __name__ == "__main__":
    devices = get_devices_with_retry()
    if not devices:
        print("No devices found. Exiting.")
        exit(1)

    print(f"{len(devices)} devices loaded for simulation.")

    while True:
        for sn in devices:
            data = simulate_heartbeat(sn)
            try:
                res = requests.post(HEARTBEAT_URL, json=data, timeout=5)
                print(f"Heartbeat sent for {sn}: {res.status_code}")
            except Exception as e:
                print(f"Error sending heartbeat for {sn}: {e}")
        time.sleep(60)
