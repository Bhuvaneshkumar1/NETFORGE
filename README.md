# ⚡ NETFORGE IP TOOLKIT
### *Professional Client-Side IP & Network Engineering Utility*

[![License: MIT](https://img.shields.io/badge/License-MIT-00f2fe.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JS%20(ES6+)-orange.svg)]()
[![Build](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Vanilla)-success.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Web%20%2F%20Offline%20First-blue.svg)]()

**NETFORGE IP TOOLKIT** is a high-performance, dark-themed, zero-dependency browser application engineered for Network Engineers, Cybersecurity Analysts, Systems Administrators, and DevOps professionals.

Designed as an all-in-one client-side suite, NetForge delivers instant subnetting calculations, CIDR aggregation, VLSM design, binary bitwise visualizations, IPv6 notation utilities, MAC address normalization, and searchable reference databases—with **zero external server calls** or latency.

---

## 📽️ Application Walkthrough Demo

<div align="center">

https://github.com/user-attachments/assets/80547052-a25b-4030-93c1-eb81f3357e56

  NetForge IP Toolkit Interactive Demo
  </video>
</div>

---

## ✨ Key Features & Tool Suite

### 📡 IPv4 Subnetting & CIDR Engine
- **IPv4 Subnet Calculator**: Calculates Network Address, Broadcast, Usable Range, Mask, Wildcard, Block Size, and Usable Hosts (`/0` to `/32`). Includes real-time 32-bit binary octet visualization.
- **CIDR Aggregator & Supernetting**: Aggregates contiguous CIDR blocks into optimized supernets and detects sub-network overlaps.
- **VLSM Calculator (Variable Length Subnet Masking)**: Generates optimal subnet allocations ranked by host capacity with interactive space utilization bars and preset scenarios (Enterprise Branch Office, AWS VPC 3-Tier).
- **IP Range-to-CIDR Converter**: Takes any Start & End IPv4 address span and derives the minimal exact set of matching CIDR subnets.
- **Wildcard Mask & Cisco ACL Generator**: Converts subnet masks to inverse wildcard masks and generates copyable Cisco IOS Standard & Extended ACL syntax (`access-list 100 permit ip ...`).

### 🔄 Multi-Format Converters & IPv6 Suite
- **Universal Cross-Converter**: Instant multi-way conversion across Dotted Decimal IPv4, 32-Bit Binary, Hexadecimal, 32-Bit Unsigned Integer, Octal, and IPv6-Mapped IPv4.
- **IPv6 Calculator & RFC 5952 Engine**: Zero-compression/expansion, syntax validation, SLAAC EUI-64 Link-Local IPv6 generation (`fe80::...`), and multicast scope inspection.
- **MAC Address Tools**: Normalizes MAC strings across IEEE Colon (`00:11:22:33:44:55`), Hyphen (`00-11-22-33-44-55`), and Cisco Dot (`0011.2233.4455`) formats, extracts OUI, checks Unicast/Multicast, and calculates SLAAC IPv6 addresses.

### 📚 Integrated Searchable Reference Databases
- **Port Reference Database**: Instant filtering across common TCP/UDP service ports (FTP, SSH, DNS, HTTPS, BGP, WireGuard, etc.).
- **IP Protocol Reference**: OSI layer transport protocol matrix (ICMP, IGMP, TCP, UDP, GRE, ESP, OSPF).
- **CIDR Cheat Sheet Table**: Complete matrix from `/0` through `/32` displaying mask, wildcard, total capacity, usable hosts, and block sizes.
- **Subnetting Architectural Guides**: Visual cheat sheet cards for quick network design reference.

### 🚀 Productivity & UX Capabilities
- **Export Data**: One-click export of Subnet, CIDR, and VLSM calculations as structured **JSON**, **CSV**, or **TSV** text files.
- **Global Search (`Ctrl + K`)**: Modal search index to launch any of the 22 tools instantly.
- **Offline First & Zero Latency**: Pure client-side JavaScript bitwise math—runs locally without internet connection or API keys.
- **Dark/Light Mode & History**: Theme switcher with `localStorage` persistence and calculation history log.

---

## 🛠️ Architecture & Tech Stack

```
NetForge-IP-Toolkit/
├── index.html       # Single-Page Application (SPA) architecture & 22 tool views
├── style.css        # Modern technical dark theme CSS variables & responsive layout
├── script.js        # Strict-mode JS bitwise math engine & event delegation
├── favicon.svg      # SVG vector favicon icon
|── demo_video/      # A demo video to showcase the use of the tool
├── LICENSE          # MIT Open Source License
└── README.md        # Documentation
```

- **Frontend**: Vanilla HTML5, CSS3 Custom Properties, Vanilla JavaScript (ES6+ Strict Mode).
- **Icons**: FontAwesome 6.4 (CDN).
- **Typography**: Inter & JetBrains Mono (Google Fonts).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Open Global Tool Search Modal |
| `Escape` | Close active modal or mobile drawer |
| `Enter` | Trigger calculation on active input field |

---

## 💻 Quick Start & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Bhuvaneshkumar1/NETFORGE.git
   cd NetForge-IP-Toolkit
   ```

2. **Run locally**:
   - Simply double-click `index.html` or open it in any web browser.
   - Alternatively, serve with VS Code Live Server or Python HTTP Server:
     ```bash
     python -m http.server 8000
     ```
   - Open `http://localhost:8000` in your browser.

---



## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
