from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import content
import os
import shutil
from typing import List, Optional
from datetime import datetime

app = FastAPI()

# CORS - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File System Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILES_DIR = os.path.join(BASE_DIR, "files")

# Ensure files directory exists
if not os.path.exists(FILES_DIR):
    os.makedirs(FILES_DIR)
    with open(os.path.join(FILES_DIR, "projects.txt"), "w") as f:
        f.write(content.PROJECTS_LORE)
    with open(os.path.join(FILES_DIR, "welcome.txt"), "w") as f:
        f.write("WELCOME TO CYBER_OS v2.1\n\nThis is your personal file space.\nYou can create, edit, and delete files here.")
    with open(os.path.join(FILES_DIR, "about_me.enc"), "w") as f:
        f.write(content.ABOUT_ME_LORE)
    with open(os.path.join(FILES_DIR, "contact.hex"), "w") as f:
        f.write(content.CONTACT_LORE)

    docs_dir = os.path.join(FILES_DIR, "documents")
    if not os.path.exists(docs_dir):
        os.makedirs(docs_dir)
        with open(os.path.join(docs_dir, "notes.txt"), "w") as f:
            f.write("Meeting notes: TBD")

    diary_dir = os.path.join(FILES_DIR, "diary")
    if not os.path.exists(diary_dir):
        os.makedirs(diary_dir)
        with open(os.path.join(diary_dir, "entry_001.log"), "w") as f:
            f.write("DATE: 2077-01-12\nThey say the network is secure. I don't believe them. I saw the glimmers in the code today. Something is watching us from the sub-net.")
        with open(os.path.join(diary_dir, "entry_042.log"), "w") as f:
            f.write("DATE: 2077-02-04\nI hid the key in the image file. If they find me, at least the data is safe. 'blue_rabbit' is the trigger.")

    trash_dir = os.path.join(FILES_DIR, "trash")
    if not os.path.exists(trash_dir):
        os.makedirs(trash_dir)
        with open(os.path.join(trash_dir, ".recovered_frag"), "w") as f:
            f.write("...SEGMENT CORRUPTED...\n...override protocol 9...\n...target identified: USER_01...")

    logs_dir = os.path.join(FILES_DIR, "logs")
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
        with open(os.path.join(logs_dir, "system_boot.log"), "w") as f:
            f.write("[INFO] KERNEL LOADED\n[INFO] MOUNTING DRIVES... OK\n[WARN] UNKNOWN DEVICE CONNECTED")

    bin_dir = os.path.join(FILES_DIR, "bin")
    if not os.path.exists(bin_dir):
        os.makedirs(bin_dir)
        with open(os.path.join(bin_dir, "readme.md"), "w") as f:
            f.write("# SYSTEM BINARIES\n\nDo not delete system files.")

    # Secret hidden directory
    secret_dir = os.path.join(FILES_DIR, ".shadow")
    if not os.path.exists(secret_dir):
        os.makedirs(secret_dir)
        with open(os.path.join(secret_dir, "cipher.key"), "w") as f:
            f.write("DECRYPT_KEY: X7-PHANTOM-ECHO-9\nACCESS_TOKEN: ██████████████\nWARNING: If you found this, they already know.")
        with open(os.path.join(secret_dir, "blacklist.dat"), "w") as f:
            f.write("NODE_01: COMPROMISED\nNODE_02: ACTIVE\nNODE_03: [REDACTED]\nNODE_04: OFFLINE SINCE 2076-11-30\nNODE_05: ...listening...")


class FileOperationRequest(BaseModel):
    path: str
    content: Optional[str] = None
    type: Optional[str] = "file"
    destination: Optional[str] = None


# ============================================================
# FILE SYSTEM API
# ============================================================

@app.get("/api/files/list")
def list_files(path: str = ""):
    target_path = os.path.normpath(os.path.join(FILES_DIR, path.lstrip('/')))
    if not target_path.startswith(FILES_DIR):
        raise HTTPException(status_code=403, detail="Access denied")

    if not os.path.exists(target_path):
        return {"error": "Directory not found"}

    try:
        items = []
        if not os.path.isdir(target_path):
            return {"error": "Not a directory"}

        for entry in os.scandir(target_path):
            items.append({
                "name": entry.name,
                "type": "folder" if entry.is_dir() else "file",
                "size": entry.stat().st_size if entry.is_file() else 0
            })
        return {"files": items}
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/files/read")
def read_file(request: FileOperationRequest):
    target_path = os.path.normpath(os.path.join(FILES_DIR, request.path.lstrip('/')))
    if not target_path.startswith(FILES_DIR):
        raise HTTPException(status_code=403, detail="Access denied")
    try:
        if not os.path.exists(target_path):
            return {"error": "File not found"}
        with open(target_path, "r") as f:
            file_content = f.read()
        return {"content": file_content}
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/files/write")
def write_file(request: FileOperationRequest):
    target_path = os.path.normpath(os.path.join(FILES_DIR, request.path.lstrip('/')))
    if not target_path.startswith(FILES_DIR):
        raise HTTPException(status_code=403, detail="Access denied")
    try:
        with open(target_path, "w") as f:
            f.write(request.content or "")
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/files/create")
def create_item(request: FileOperationRequest):
    target_path = os.path.normpath(os.path.join(FILES_DIR, request.path.lstrip('/')))
    if not target_path.startswith(FILES_DIR):
        raise HTTPException(status_code=403, detail="Access denied")
    try:
        if request.type == "folder":
            os.makedirs(target_path, exist_ok=True)
        else:
            # Ensure parent directory exists
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            with open(target_path, "w") as f:
                f.write(request.content or "")
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/files/delete")
def delete_item(request: FileOperationRequest):
    target_path = os.path.normpath(os.path.join(FILES_DIR, request.path.lstrip('/')))
    if not target_path.startswith(FILES_DIR):
        raise HTTPException(status_code=403, detail="Access denied")
    try:
        if os.path.isdir(target_path):
            shutil.rmtree(target_path)
        else:
            os.remove(target_path)
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/files/move")
def move_item(request: FileOperationRequest):
    src = os.path.normpath(os.path.join(FILES_DIR, request.path.lstrip('/')))
    dst = os.path.normpath(os.path.join(FILES_DIR, request.destination.lstrip('/')))
    if not src.startswith(FILES_DIR) or not dst.startswith(FILES_DIR):
        raise HTTPException(status_code=403, detail="Access denied")
    try:
        shutil.move(src, dst)
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/files/copy")
def copy_item(request: FileOperationRequest):
    src = os.path.normpath(os.path.join(FILES_DIR, request.path.lstrip('/')))
    dst = os.path.normpath(os.path.join(FILES_DIR, request.destination.lstrip('/')))
    if not src.startswith(FILES_DIR) or not dst.startswith(FILES_DIR):
        raise HTTPException(status_code=403, detail="Access denied")
    try:
        if os.path.isdir(src):
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}


# ============================================================
# TERMINAL COMMAND API
# ============================================================

class CommandRequest(BaseModel):
    command: str


@app.get("/")
def read_root():
    return {"status": "System Online", "version": "v2.1.0-CYBER"}


@app.post("/api/terminal/command")
def execute_command(request: CommandRequest):
    cmd = request.command.strip()
    parts = cmd.split()
    operation = parts[0].lower() if parts else ""

    # ---- ECHO ----
    if operation == "echo":
        if ">" in parts:
            idx = parts.index(">")
            text_parts = parts[1:idx]
            filename = parts[idx + 1] if len(parts) > idx + 1 else None
            text = " ".join(text_parts).strip('"').strip("'")
            if filename:
                target_path = os.path.normpath(os.path.join(FILES_DIR, filename.lstrip('/')))
                if not target_path.startswith(FILES_DIR):
                    return {"type": "error", "content": "Access denied"}
                try:
                    with open(target_path, "w") as f:
                        f.write(text)
                    return {"type": "text", "content": f"Wrote to {filename}"}
                except Exception as e:
                    return {"type": "error", "content": str(e)}
            else:
                return {"type": "error", "content": "Usage: echo 'text' > filename"}
        else:
            text = " ".join(parts[1:]).strip('"').strip("'")
            return {"type": "text", "content": text}

    # ---- WHOAMI ----
    elif operation == "whoami":
        return {
            "type": "text",
            "content": "ID: USER_01\nROLE: GHOST_ADMIN\nACCESS_LEVEL: 7\nLOCATION: PROXY_CHAIN_ACTIVE\nCLEARANCE: ██████████\nSTATUS: UNDETECTED"
        }

    # ---- NEOFETCH ----
    elif operation == "neofetch":
        return {
            "type": "text",
            "content": (
                "  ██████╗██╗   ██╗██████╗ ███████╗██████╗ \n"
                " ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗\n"
                " ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝\n"
                " ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗\n"
                " ╚██████╗   ██║   ██████╔╝███████╗██║  ██║\n"
                "  ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝\n"
                "──────────────────────────────────\n"
                f"  OS:       CYBER_OS v2.1 [QUANTUM]\n"
                f"  Kernel:   4.19.0-PHANTOM\n"
                f"  Shell:    ghost-sh 3.2.1\n"
                f"  CPU:      Quantum Core i9 @ 8.2 GHz\n"
                f"  GPU:      NV-CORTEX RTX 9090\n"
                f"  RAM:      65536 MB DDR6\n"
                f"  Disk:     2.1 TB / 4 TB (52%)\n"
                f"  Network:  DR_NET [ENCRYPTED]\n"
                f"  Uptime:   4209h 37m\n"
                f"  Packages: 1337 (apt)\n"
                f"  User:     USER_01@SECTOR-7G"
            )
        }

    # ---- SCAN ----
    elif operation == "scan":
        target = parts[1] if len(parts) > 1 else "LOCAL_NETWORK"
        ports = sorted(random.sample(range(20, 9999), 6))
        port_lines = "\n".join([
            f"  PORT {p:>5}  {'OPEN' if random.random() > 0.3 else 'FILTERED'}  {random.choice(['ssh','http','https','ftp','smtp','telnet','unknown','dark-relay'])}"
            for p in ports
        ])
        return {
            "type": "text",
            "content": (
                f"SCANNING TARGET: {target}\n"
                f"{'─' * 40}\n"
                f"  Host: {target}\n"
                f"  Status: UP (latency: {random.randint(1, 50)}ms)\n"
                f"  Ports discovered:\n"
                f"{port_lines}\n"
                f"{'─' * 40}\n"
                f"  {random.randint(2, 6)} services detected.\n"
                f"  ⚠ CAUTION: Scan may have been logged."
            )
        }

    # ---- PING ----
    elif operation == "ping":
        target = parts[1] if len(parts) > 1 else "localhost"
        lines = [f"PING {target} ({random.randint(10, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)})"]
        for i in range(4):
            ms = round(random.uniform(0.5, 120.0), 1)
            lines.append(f"  seq={i} ttl={random.randint(48, 128)} time={ms}ms")
        avg = round(random.uniform(5.0, 80.0), 1)
        lines.append(f"--- {target} ping statistics ---")
        lines.append(f"  4 packets transmitted, {random.choice([4, 4, 4, 3])} received, avg={avg}ms")
        return {"type": "text", "content": "\n".join(lines)}

    # ---- TRACEROUTE ----
    elif operation in ("traceroute", "tracert"):
        target = parts[1] if len(parts) > 1 else "ghost.onion"
        hops = random.randint(6, 14)
        lines = [f"traceroute to {target}, {hops} hops max"]
        locations = ["LOCAL_GW", "ISP_NODE", "PROXY_01", "TOR_ENTRY", "RELAY_ALPHA", "DARK_NODE", "GHOST_RELAY",
                     "SECTOR_7G", "QUANTUM_BRIDGE", "MIRROR_NODE", "EXIT_NODE", "FINAL_HOP", "TARGET", "???"]
        for i in range(hops):
            ms = round(random.uniform(1.0, 300.0), 1)
            loc = locations[i] if i < len(locations) else f"NODE_{random.randint(100, 999)}"
            if random.random() > 0.85:
                lines.append(f"  {i + 1}  * * * [REQUEST TIMED OUT]")
            else:
                lines.append(f"  {i + 1}  {loc}  {ms}ms")
        lines.append(f"  Trace complete. Route {'SECURE' if random.random() > 0.3 else '⚠ POTENTIALLY COMPROMISED'}.")
        return {"type": "text", "content": "\n".join(lines)}

    # ---- PS (processes) ----
    elif operation == "ps":
        processes = [
            {"pid": 1, "name": "systemd", "cpu": 0.1, "mem": 2.3},
            {"pid": 42, "name": "kernel_watchdog", "cpu": 0.0, "mem": 0.8},
            {"pid": 137, "name": "ghost-shell", "cpu": 1.2, "mem": 4.1},
            {"pid": 256, "name": "network_monitor", "cpu": round(random.uniform(0.5, 8.0), 1), "mem": 3.2},
            {"pid": 314, "name": "crypto_miner", "cpu": round(random.uniform(15.0, 45.0), 1), "mem": 12.4},
            {"pid": 404, "name": "shadow_daemon", "cpu": round(random.uniform(0.1, 2.0), 1), "mem": 1.7},
            {"pid": 512, "name": "firewall_v3", "cpu": 0.3, "mem": 5.6},
            {"pid": 666, "name": "UNKNOWN_PROCESS", "cpu": round(random.uniform(5.0, 25.0), 1), "mem": round(random.uniform(3.0, 15.0), 1)},
            {"pid": 777, "name": "data_exfil_agent", "cpu": round(random.uniform(1.0, 5.0), 1), "mem": 2.1},
            {"pid": 1024, "name": "proxy_chain", "cpu": 0.8, "mem": 3.0},
        ]
        header = f"{'PID':>6}  {'PROCESS':<22}  {'CPU%':>6}  {'MEM%':>6}"
        lines = [header, "─" * 48]
        for p in processes:
            warn = " ⚠" if p["cpu"] > 10 else ""
            lines.append(f"{p['pid']:>6}  {p['name']:<22}  {p['cpu']:>5.1f}%  {p['mem']:>5.1f}%{warn}")
        lines.append(f"\n  Total: {len(processes)} processes | CPU: {sum(p['cpu'] for p in processes):.1f}%")
        return {"type": "text", "content": "\n".join(lines)}

    # ---- UPTIME ----
    elif operation == "uptime":
        hours = 4209 + random.randint(0, 100)
        return {
            "type": "text",
            "content": (
                f"  System Uptime: {hours}h {random.randint(0, 59)}m {random.randint(0, 59)}s\n"
                f"  Load Average:  {round(random.uniform(0.1, 2.5), 2)} {round(random.uniform(0.1, 3.0), 2)} {round(random.uniform(0.2, 4.0), 2)}\n"
                f"  Users Online:  {random.randint(1, 7)}\n"
                f"  Last Reboot:   2077-01-01 00:00:00 [FORCED]"
            )
        }

    # ---- IFCONFIG ----
    elif operation in ("ifconfig", "ip"):
        return {
            "type": "text",
            "content": (
                "eth0:\n"
                f"  inet  10.0.{random.randint(0, 255)}.{random.randint(1, 254)}  mask 255.255.255.0\n"
                f"  inet6 fe80::{random.randint(1000, 9999)}:{random.randint(1000, 9999)}::{random.randint(1, 99)}\n"
                f"  ether AA:BB:CC:{random.randint(10, 99)}:{random.randint(10, 99)}:{random.randint(10, 99)}\n"
                f"  RX packets: {random.randint(10000, 999999)}  TX packets: {random.randint(10000, 999999)}\n\n"
                "ghost0 (STEALTH ADAPTER):\n"
                f"  inet  192.168.{random.randint(0, 255)}.{random.randint(1, 254)}  [MASKED]\n"
                "  status: CLOAKED\n"
                "  encryption: AES-512-QUANTUM"
            )
        }

    # ---- NMAP ----
    elif operation == "nmap":
        target = parts[1] if len(parts) > 1 else "192.168.1.0/24"
        hosts = random.randint(3, 12)
        lines = [
            f"Starting Nmap 7.94 ( https://nmap.org )",
            f"Scanning {target}...",
            f"Discovered {hosts} live hosts:",
            "─" * 40,
        ]
        for i in range(min(hosts, 8)):
            ip = f"192.168.1.{random.randint(1, 254)}"
            hostname = random.choice(["ROUTER", "DESKTOP-01", "UNKNOWN", "PRINTER", "NAS_VAULT",
                                      "IOT_DEVICE", "CAMERA_03", "GHOST_NODE", "SMART_LOCK"])
            lines.append(f"  {ip:<16} {hostname:<16} {'UP' if random.random() > 0.1 else 'FILTERED'}")
        lines.append("─" * 40)
        lines.append(f"Nmap done: {hosts} hosts up. Scan took {random.randint(2, 30)}s.")
        lines.append("⚠ Some hosts may have detected your scan.")
        return {"type": "text", "content": "\n".join(lines)}

    # ---- DECRYPT ----
    elif operation == "decrypt":
        target = parts[1] if len(parts) > 1 else None
        if not target:
            return {"type": "error", "content": "Usage: decrypt [filename]\n  Attempts to decrypt an encrypted file."}
        stages = [
            f"Analyzing {target}...",
            "Identifying encryption: AES-256-CBC",
            "Attempting key rotation...",
            "Brute-forcing key space: ████████████░░░░ 76%",
            "Key fragment found: X7-PH4NT0M",
            "Applying decryption matrix...",
        ]
        if random.random() > 0.4:
            stages.append(f"✓ SUCCESS: {target} decrypted.")
            stages.append(f"  Decrypted content saved to {target}.dec")
        else:
            stages.append(f"✗ PARTIAL FAILURE: Only 63% recovered.")
            stages.append("  Try running with --force flag.")
        return {"type": "text", "content": "\n".join(stages)}

    # ---- STATUS ----
    elif operation == "status":
        return {
            "type": "text",
            "content": (
                "╔══════════════════════════════════╗\n"
                "║       SYSTEM STATUS REPORT       ║\n"
                "╠══════════════════════════════════╣\n"
                f"║  CPU Load:    {random.randint(5, 45)}%               ║\n"
                f"║  Memory:      {random.randint(20, 70)}% used          ║\n"
                f"║  Disk:        52% capacity          ║\n"
                f"║  Network:     ENCRYPTED             ║\n"
                f"║  Firewall:    ACTIVE                ║\n"
                f"║  Threats:     {random.randint(0, 3)} detected          ║\n"
                f"║  VPN:         MULTI-HOP             ║\n"
                "╠══════════════════════════════════╣\n"
                "║  All systems operational.        ║\n"
                "╚══════════════════════════════════╝"
            )
        }

    # ---- USERS ----
    elif operation == "users":
        users = [
            {"name": "USER_01", "status": "ACTIVE", "role": "GHOST_ADMIN"},
            {"name": "PHANTOM_X", "status": "IDLE", "role": "OPERATOR"},
            {"name": "NULL_BYTE", "status": random.choice(["ACTIVE", "AWAY"]), "role": "ANALYST"},
            {"name": "D4RK_ECHO", "status": "OFFLINE", "role": "UNKNOWN"},
            {"name": "ROOT", "status": "LOCKED", "role": "SYSTEM"},
        ]
        lines = [f"{'USER':<14} {'STATUS':<10} {'ROLE':<14}", "─" * 38]
        for u in users:
            lines.append(f"{u['name']:<14} {u['status']:<10} {u['role']:<14}")
        lines.append(f"\n  {sum(1 for u in users if u['status'] == 'ACTIVE')} active users on DR_NET.")
        return {"type": "text", "content": "\n".join(lines)}

    # ---- SUDO ----
    elif operation == "sudo":
        subcmd = " ".join(parts[1:]) if len(parts) > 1 else ""
        if not subcmd:
            return {"type": "error", "content": "Usage: sudo [command]\n  Execute with elevated privileges."}
        return {
            "type": "text",
            "content": (
                f"[SUDO] Escalating privileges for: {subcmd}\n"
                f"[SUDO] Access Level: ROOT\n"
                f"[SUDO] Executing: {subcmd}\n"
                f"[SUDO] ✓ Command completed with elevated access."
            )
        }

    # ---- SSH ----
    elif operation == "ssh":
        target = parts[1] if len(parts) > 1 else None
        if not target:
            return {"type": "error", "content": "Usage: ssh [user@host]\n  Connect to remote system."}
        return {
            "type": "text",
            "content": (
                f"Connecting to {target}...\n"
                f"Establishing encrypted tunnel...\n"
                f"Fingerprint: SHA256:{''.join(random.choices('0123456789abcdef', k=40))}\n"
                f"Authentication: KEY_EXCHANGE\n"
                f"Connection established.\n"
                f"WARNING: This session is being monitored.\n"
                f"Type 'exit' to disconnect."
            )
        }

    # ---- HISTORY ----
    elif operation == "history":
        cmds = [
            "ls -la /shadow",
            "cat diary/entry_042.log",
            "scan 192.168.1.0/24",
            "decrypt about_me.enc",
            "ssh phantom@dark-node",
            "nmap TARGET_BRAVO",
            "echo 'key found' > notes.txt",
            "whoami",
            "ps aux",
            "neofetch",
        ]
        lines = [f"  {i + 1:>4}  {c}" for i, c in enumerate(cmds)]
        return {"type": "text", "content": "Command History:\n" + "\n".join(lines)}

    # ---- DATE ----
    elif operation == "date":
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return {"type": "text", "content": f"SERVER_TIME: {now}\nTIMEZONE: UTC+0 [QUANTUM_SYNC]"}

    # ---- HOSTNAME ----
    elif operation == "hostname":
        return {"type": "text", "content": "CYBER_NODE_7G.DR_NET.ONION"}

    # ---- UNAME ----
    elif operation == "uname":
        return {
            "type": "text",
            "content": "CYBER_OS 4.19.0-PHANTOM x86_64 QUANTUM_CORE GNU/Linux"
        }

    # ---- DF (disk usage) ----
    elif operation == "df":
        return {
            "type": "text",
            "content": (
                "Filesystem      Size  Used  Avail  Use%  Mounted on\n"
                "/dev/cyber0     4.0T  2.1T  1.9T   52%   /\n"
                "/dev/ghost1     512G  128G  384G   25%   /shadow\n"
                "tmpfs           32G   1.2G  30.8G   4%   /tmp\n"
                "/dev/vault0     1.0T  890G  110G   89%   /vault  ⚠ HIGH"
            )
        }

    # ---- CLEAR (handled in frontend, but also support here) ----
    elif operation == "clear":
        return {"type": "clear", "content": ""}

    # ---- HELP (fallback) ----
    elif operation == "help":
        return {
            "type": "text",
            "content": (
                "Available Commands:\n"
                "──────────────────────────────────\n"
                "  FILE SYSTEM:\n"
                "    ls [path]       List files\n"
                "    cd [path]       Change directory\n"
                "    pwd             Working directory\n"
                "    cat [file]      Read file\n"
                "    touch [file]    Create file\n"
                "    mkdir [dir]     Create folder\n"
                "    rm [file]       Delete file/dir\n"
                "    cp [src] [dst]  Copy\n"
                "    mv [src] [dst]  Move\n"
                "    echo [text]     Print text\n"
                "  NETWORK:\n"
                "    scan [target]   Port scan\n"
                "    ping [host]     Ping host\n"
                "    traceroute [h]  Trace route\n"
                "    nmap [target]   Network map\n"
                "    ssh [user@host] Remote connect\n"
                "  SYSTEM:\n"
                "    whoami          Identity\n"
                "    neofetch        System info\n"
                "    ps              Processes\n"
                "    uptime          System uptime\n"
                "    status          Status report\n"
                "    users           Online users\n"
                "    ifconfig        Network config\n"
                "    df              Disk usage\n"
                "    hostname        Host name\n"
                "    uname           OS info\n"
                "    date            Server time\n"
                "    history         Command log\n"
                "    decrypt [file]  Decrypt file\n"
                "    sudo [cmd]      Root access\n"
                "    clear           Clear screen\n"
                "    hack            Start minigame\n"
                "    theme           Switch theme\n"
                "    matrix          Toggle matrix\n"
            )
        }

    # ---- LS fallback ----
    elif operation == "ls":
        return {"type": "list", "content": []}

    # ---- UNKNOWN COMMAND ----
    else:
        suggestions = ["help", "scan", "neofetch", "whoami", "status"]
        return {
            "type": "error",
            "content": f"'{operation}': command not found\n  Try: {', '.join(suggestions)}"
        }
