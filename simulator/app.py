import os
import requests
import time
import random
from datetime import datetime

API_BASE = "http://host.docker.internal:3000/api/v1"
REGISTER_URL = f"{API_BASE}/users/register"
DEVICES_URL = f"{API_BASE}/devices"
RULES_URL = f"{API_BASE}/notifications/rules"
SNS_URL = f"{API_BASE}/opendevices/sns"
HEARTBEAT_URL = f"{API_BASE}/heartbeats"

def register_user(name, email, password):
    body = {"name": name, "email": email, "password": password}
    res = requests.post(REGISTER_URL, json=body, timeout=5)
    res.raise_for_status()
    data = res.json()
    print(f"User created: {data['user']}")
    return data["token"]

def create_device(token, name, location, sn, description):
    headers = {"Authorization": f"Bearer {token}"}
    body = {"name": name, "location": location, "sn": sn, "description": description}
    res = requests.post(DEVICES_URL, json=body, headers=headers, timeout=5)
    res.raise_for_status()
    print(f"Device created: {sn}")
    return sn

def create_rule(token, device_sn, metric, operator, value):
    headers = {"Authorization": f"Bearer {token}"}
    body = {
        "device_sn": device_sn,
        "condition": {"metric": metric, "operator": operator, "value": value},
    }
    res = requests.post(RULES_URL, json=body, headers=headers, timeout=5)
    res.raise_for_status()
    print(f"Rule created for {device_sn}: {metric} {operator} {value}")

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
    print("Script iniciado. Aguardando 40 segundos para o serviço estar pronto...")
    time.sleep(30)
    token = register_user("admin", "admin@admin", "admin123")

    sns_list = []
    for i in range(3):
        sn = f"{random.randint(100000000000, 999999999999)}"
        device_sn = create_device(
            token,
            name=f"Sensor {i+1}",
            location=random.choice(["São Paulo", "Rio de Janeiro", "Curitiba"]),
            sn=sn,
            description=f"Dispositivo IoT número {i+1}",
        )
        sns_list.append(device_sn)

        create_rule(token, device_sn, "temperature", ">", 70)
        create_rule(token, device_sn, "cpu_usage", ">", 60)

    print("Setup concluído. Agora enviando heartbeats...")

    while True:
        devices = get_devices_with_retry()
        if not devices:
            print("No devices found. Retrying...")
        else:
            print(f"{len(devices)} devices encontrados. Enviando heartbeats...")
            for sn in devices:
                data = simulate_heartbeat(sn)
                try:
                    res = requests.post(HEARTBEAT_URL, json=data, timeout=5)
                    print(f"Heartbeats enviados para: {sn}: {res.status_code}")
                except Exception as e:
                    print(f"Erro ao enviar heartbeats: {sn}: {e}")
        time.sleep(60)
