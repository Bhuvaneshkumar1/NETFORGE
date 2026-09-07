"use strict";

/* =========================================================
   NETFORGE IP TOOLKIT - MASTER ENGINE & SPA ARCHITECTURE
   ========================================================= */

const APP = {
    history: JSON.parse(localStorage.getItem("netforge_history") || "[]"),
    theme: localStorage.getItem("netforge_theme") || "dark",
    vlsmRequirements: [
        { name: "Engineering", hosts: 50 },
        { name: "Sales & Support", hosts: 25 },
        { name: "Management", hosts: 10 },
        { name: "P2P Serial Link", hosts: 2 }
    ],
    vlsmResults: []
};


/* =========================================================
   01. DOM HELPERS
   ========================================================= */

function $(id) {
    if (typeof id !== "string") return id;
    return document.getElementById(id.replace(/^#/, ""));
}

function qs(selector) {
    return document.querySelector(selector);
}

function qsa(selector) {
    return document.querySelectorAll(selector);
}

function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
}

function valueOf(id) {
    const el = $(id);
    return el ? el.value.trim() : "";
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatNumber(num) {
    return Number(num).toLocaleString("en-US");
}

function openModal(modalId) {
    const modal = $(modalId);
    if (modal) {
        modal.classList.add("active");
    }
}

function closeModal(modal) {
    if (typeof modal === "string") modal = $(modal);
    if (modal) {
        modal.classList.remove("active");
    }
}

function closeAllModals() {
    qsa(".modal").forEach(m => m.classList.remove("active"));
}

function copyToClipboard(text) {
    if (!text) return Promise.reject(new Error("No text to copy"));
    text = text.trim();
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        return new Promise((resolve, reject) => {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            textarea.style.top = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                const ok = document.execCommand("copy");
                document.body.removeChild(textarea);
                if (ok) resolve();
                else reject(new Error("Copy command failed"));
            } catch (err) {
                document.body.removeChild(textarea);
                reject(err);
            }
        });
    }
}


/* =========================================================
   02. SINGLE SOURCE OF TRUTH PAGE NAVIGATION
   ========================================================= */

function navigateTo(pageName) {
    if (!pageName) return;

    pageName = String(pageName).replace("#", "").replace(/^page-/, "").trim();

    // 1. Hide every .page
    qsa(".page").forEach(page => {
        page.classList.remove("active");
    });

    // 2. Find target page
    const targetId = "page-" + pageName;
    const targetPage = $(targetId);

    if (targetPage) {
        targetPage.classList.add("active");
    } else {
        const dashboard = $("#page-dashboard");
        if (dashboard) dashboard.classList.add("active");
        pageName = "dashboard";
    }

    // 3. Update active sidebar item
    qsa(".nav-item").forEach(item => {
        item.classList.remove("active");
        const attrPage = item.getAttribute("data-page");
        if (attrPage === pageName) {
            item.classList.add("active");
        }
    });

    // 4. Update breadcrumb
    updateBreadcrumb(pageName);

    // 5. Trigger live calculation update for target page
    updatePageContent(pageName);

    // 6. Scroll main container to top & close mobile drawer / modals
    const main = qs(".main-content");
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);

    const sidebar = $("#sidebar");
    const overlay = $("#sidebarOverlay");
    if (sidebar) sidebar.classList.remove("mobile-open");
    if (overlay) overlay.classList.remove("active");

    closeAllModals();
}

function updateBreadcrumb(pageName) {
    const breadcrumb = $("#breadcrumbCurrent");
    if (!breadcrumb) return;

    const names = {
        "dashboard": "Dashboard",
        "subnet-calculator": "Subnet Calculator",
        "cidr-calculator": "CIDR Calculator",
        "vlsm-calculator": "VLSM Calculator",
        "supernetting": "Supernetting",
        "ip-range": "IP Range",
        "wildcard": "Wildcard Mask",
        "ip-classifier": "IP Classifier",
        "ip-validator": "IP Validator",
        "ip-converter": "IP Converter",
        "binary-converter": "Binary Converter",
        "decimal-converter": "Decimal Converter",
        "hex-converter": "Hex Converter",
        "integer-converter": "Integer Converter",
        "ipv6-calculator": "IPv6 Calculator",
        "ipv6-compression": "IPv6 Compress / Expand",
        "ipv6-validator": "IPv6 Validator",
        "mac-tools": "MAC Tools",
        "port-reference": "Port Reference",
        "protocol-reference": "Protocol Reference",
        "cidr-reference": "CIDR Reference",
        "subnet-reference": "Subnet Reference"
    };

    breadcrumb.textContent = names[pageName] || "Dashboard";
}

function updatePageContent(pageName) {
    switch (pageName) {
        case "subnet-calculator": runSubnetCalculator(false); break;
        case "cidr-calculator": runCIDRCalculator(false); break;
        case "vlsm-calculator": renderReqList(); break;
        case "supernetting": runSupernetCalculator(false); break;
        case "ip-range": runRangeCalculator(false); break;
        case "wildcard": runWildcardCalculator(false); break;
        case "ip-classifier": runClassifier(false); break;
        case "ip-validator": runValidator(false); break;
        case "ip-converter": runIPConverter(false); break;
        case "binary-converter": runBinaryConverter(false); break;
        case "decimal-converter": runDecimalConverter(false); break;
        case "hex-converter": runHexConverter(false); break;
        case "integer-converter": runIntegerConverter(false); break;
        case "ipv6-calculator": runIPv6Calculator(false); break;
        case "ipv6-compression": runIPv6CompressExpand(false); break;
        case "ipv6-validator": runIPv6Validator(false); break;
        case "mac-tools": runMACTools(false); break;
    }
}


/* =========================================================
   03. SIDEBAR & THEME MANAGEMENT
   ========================================================= */

function toggleMobileSidebar() {
    const sidebar = $("#sidebar");
    const overlay = $("#sidebarOverlay");
    if (sidebar) sidebar.classList.toggle("mobile-open");
    if (overlay) overlay.classList.toggle("active");
}

function initTheme() {
    applyTheme();
    const themeToggle = $("#themeToggle");
    if (themeToggle) {
        themeToggle.onclick = toggleTheme;
    }
}

function toggleTheme() {
    APP.theme = APP.theme === "dark" ? "light" : "dark";
    applyTheme();
}

function applyTheme() {
    document.documentElement.setAttribute("data-theme", APP.theme);
    if (APP.theme === "light") {
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.remove("light-theme");
    }
    localStorage.setItem("netforge_theme", APP.theme);

    const themeToggle = $("#themeToggle");
    if (themeToggle) {
        themeToggle.innerHTML = APP.theme === "dark" ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    }
}


/* =========================================================
   04. CORE NETWORKING ALGORITHMS
   ========================================================= */

function isValidIPv4(ip) {
    if (!ip) return false;
    const parts = ip.trim().split(".");
    if (parts.length !== 4) return false;
    return parts.every(part => {
        if (!/^\d+$/.test(part)) return false;
        const n = Number(part);
        return n >= 0 && n <= 255;
    });
}

function isValidIPv6(ip) {
    if (!ip) return false;
    ip = ip.trim();
    if (ip.includes("/")) ip = ip.split("/")[0];
    if ((ip.match(/::/g) || []).length > 1) return false;

    if (ip.includes("::")) {
        const parts = ip.split("::");
        return parts.every(side => {
            if (!side) return true;
            const groups = side.split(":");
            return groups.every(g => /^[0-9a-fA-F]{1,4}$/.test(g));
        });
    }
    const groups = ip.split(":");
    return groups.length === 8 && groups.every(g => /^[0-9a-fA-F]{1,4}$/.test(g));
}

function ipToInteger(ip) {
    if (!isValidIPv4(ip)) throw new Error("Invalid IPv4 address format");
    const parts = ip.split(".").map(Number);
    return (parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + parts[3]) >>> 0;
}

function integerToIP(number) {
    number = Number(number);
    if (isNaN(number) || number < 0 || number > 4294967295) {
        throw new Error("Integer must be between 0 and 4294967295");
    }
    return [
        Math.floor(number / 16777216) % 256,
        Math.floor(number / 65536) % 256,
        Math.floor(number / 256) % 256,
        number % 256
    ].join(".");
}

function ipToBinary(ip) {
    if (!isValidIPv4(ip)) throw new Error("Invalid IPv4 address format");
    return ip.split(".")
        .map(octet => Number(octet).toString(2).padStart(8, "0"))
        .join(".");
}

function binaryToIP(binary) {
    binary = binary.trim();
    if (binary.includes(".")) {
        const parts = binary.split(".");
        if (parts.length !== 4 || parts.some(x => !/^[01]{8}$/.test(x.trim()))) {
            throw new Error("Enter four 8-bit binary octets (e.g. 11000000.10101000.00000001.00000001)");
        }
        return parts.map(x => parseInt(x.trim(), 2)).join(".");
    }
    binary = binary.replace(/\s/g, "");
    if (!/^[01]{32}$/.test(binary)) {
        throw new Error("Enter exactly 32 binary bits");
    }
    const parts = [];
    for (let i = 0; i < 32; i += 8) {
        parts.push(parseInt(binary.substring(i, i + 8), 2));
    }
    return parts.join(".");
}

function cidrToMask(prefix) {
    prefix = Number(prefix);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) {
        throw new Error("CIDR prefix must be between 0 and 32");
    }
    if (prefix === 0) return "0.0.0.0";
    const mask = (0xffffffff << (32 - prefix)) >>> 0;
    return [
        (mask >>> 24) & 255,
        (mask >>> 16) & 255,
        (mask >>> 8) & 255,
        mask & 255
    ].join(".");
}

function maskToCIDR(mask) {
    if (!isValidIPv4(mask)) throw new Error("Invalid subnet mask syntax");
    const binary = mask.split(".").map(x => Number(x).toString(2).padStart(8, "0")).join("");
    if (!/^1*0*$/.test(binary)) throw new Error("Invalid subnet mask bit structure");
    return (binary.match(/1/g) || []).length;
}

function getWildcard(mask) {
    return mask.split(".").map(x => 255 - Number(x)).join(".");
}

function getMaskFromWildcard(wildcard) {
    return wildcard.split(".").map(x => 255 - Number(x)).join(".");
}

function ipRangeToCIDRBlocks(startIp, endIp) {
    let start = ipToInteger(startIp);
    let end = ipToInteger(endIp);
    if (start > end) {
        const tmp = start; start = end; end = tmp;
    }
    const blocks = [];
    while (end >= start) {
        let maxSize = 32;
        while (maxSize > 0) {
            const mask = (0xffffffff << (32 - (maxSize - 1))) >>> 0;
            if ((start & mask) !== start) break;
            if ((start | (~mask >>> 0)) > end) break;
            maxSize--;
        }
        const count = Math.pow(2, 32 - maxSize);
        blocks.push(`${integerToIP(start)}/${maxSize}`);
        start += count;
    }
    return blocks;
}

function macToEUI64(macStr) {
    const clean = macStr.replace(/[^0-9a-fA-F]/g, "");
    if (clean.length !== 12) throw new Error("Enter a valid 12-digit hex MAC address");
    let byte1 = parseInt(clean.substring(0, 2), 16);
    byte1 ^= 0x02;
    const b1Hex = byte1.toString(16).padStart(2, "0");
    const eui = `${b1Hex}${clean.substring(2, 6)}fffe${clean.substring(6, 12)}`;
    const formatted = `${eui.substring(0, 4)}:${eui.substring(4, 8)}:${eui.substring(8, 12)}:${eui.substring(12, 16)}`;
    return `fe80::${formatted}`;
}

function generateCiscoACL(ip, wildcard) {
    const cidr = maskToCIDR(getMaskFromWildcard(wildcard));
    const net = calculateSubnet(ip, cidr);
    return `! Cisco IOS Access Control List (ACL) Snippet
access-list 100 permit ip ${net.network} ${wildcard} any
! Extended Named ACL Syntax
ip access-list extended NETFORGE_FILTER
  permit ip ${net.network} ${wildcard} any
  deny ip any any log`;
}

function downloadTextFile(filename, text, mimeType = "text/plain") {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportSubnetResults(format = "json") {
    try {
        const ip = valueOf("subnetIp") || "192.168.1.100";
        const slider = $("#subnetPrefix");
        const prefix = slider ? slider.value : "24";
        const res = calculateSubnet(ip, prefix);

        if (format === "json") {
            downloadTextFile(`subnet_${res.network}_${prefix}.json`, JSON.stringify(res, null, 2), "application/json");
            toast("Subnet exported as JSON", "success");
        } else if (format === "csv") {
            const keys = Object.keys(res).join(",");
            const vals = Object.values(res).map(v => `"${v}"`).join(",");
            downloadTextFile(`subnet_${res.network}_${prefix}.csv`, `${keys}\n${vals}`, "text/csv");
            toast("Subnet exported as CSV", "success");
        } else if (format === "summary") {
            const summary = `NETFORGE IP TOOLKIT - SUBNET SUMMARY
=======================================
CIDR Notation:     ${res.network}/${res.prefix}
Network Address:   ${res.network}
Broadcast Address: ${res.broadcast}
Subnet Mask:       ${res.mask}
Wildcard Mask:     ${res.wildcard}
First Host:        ${res.firstHost}
Last Host:         ${res.lastHost}
Total Addresses:   ${formatNumber(res.total)}
Usable Hosts:      ${formatNumber(res.usable)}
IP Class:          ${res.class}
Scope:             ${res.type}
Block Size:        ${res.blockSize}`;
            copyToClipboard(summary)
                .then(() => toast("Subnet summary copied to clipboard", "success"))
                .catch(() => toast("Failed to copy summary", "error"));
        }
    } catch (err) {
        toast(err.message, "error");
    }
}

function loadVLSMPreset(presetName) {
    if (presetName === "branch") {
        APP.vlsmRequirements = [
            { name: "Voice VLAN", hosts: 60 },
            { name: "Corporate Data", hosts: 120 },
            { name: "Guest Wi-Fi", hosts: 30 },
            { name: "Server Farm", hosts: 12 },
            { name: "Management", hosts: 8 }
        ];
        const base = $("#vlsmBase");
        if (base) base.value = "192.168.10.0/24";
        renderReqList();
        runVLSMCalculator();
        toast("Loaded Enterprise Branch Office Preset", "info");
    } else if (presetName === "vpc") {
        APP.vlsmRequirements = [
            { name: "Public App Subnet A", hosts: 500 },
            { name: "Public App Subnet B", hosts: 500 },
            { name: "Private DB Subnet A", hosts: 250 },
            { name: "Private DB Subnet B", hosts: 250 },
            { name: "Spare Buffer", hosts: 100 }
        ];
        const base = $("#vlsmBase");
        if (base) base.value = "10.0.0.0/20";
        renderReqList();
        runVLSMCalculator();
        toast("Loaded AWS VPC 3-Tier Preset", "info");
    }
}

function exportTableToCSV(tableId, filename = "export.csv") {
    const table = $(tableId);
    if (!table) return;
    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length === 0) return;
    const csv = rows.map(r => {
        const cells = Array.from(r.querySelectorAll("th, td"));
        return cells.map(c => `"${c.textContent.trim().replace(/"/g, '""')}"`).join(",");
    }).join("\n");
    downloadTextFile(filename, csv, "text/csv");
    toast(`Exported ${filename}`, "success");
}

function getIPClass(ip) {
    if (!isValidIPv4(ip)) return "Invalid";
    const first = Number(ip.split(".")[0]);
    if (first >= 1 && first <= 126) return "Class A";
    if (first === 127) return "Class A (Loopback)";
    if (first >= 128 && first <= 191) return "Class B";
    if (first >= 192 && first <= 223) return "Class C";
    if (first >= 224 && first <= 239) return "Class D (Multicast)";
    if (first >= 240 && first <= 255) return "Class E (Experimental)";
    return "Reserved";
}

function getIPType(ip) {
    if (!isValidIPv4(ip)) return "Invalid";
    const p = ip.split(".").map(Number);
    if (p[0] === 10) return "Private (RFC 1918)";
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return "Private (RFC 1918)";
    if (p[0] === 192 && p[1] === 168) return "Private (RFC 1918)";
    if (p[0] === 127) return "Loopback";
    if (p[0] === 169 && p[1] === 254) return "Link-Local (APIPA)";
    if (p[0] >= 224 && p[0] <= 239) return "Multicast";
    if (p[0] === 0) return "Current Network";
    if (ip === "255.255.255.255") return "Limited Broadcast";
    return "Public Internet";
}

function getIPScope(ip) {
    const type = getIPType(ip);
    if (type.includes("Private")) return "Local Area Network (LAN)";
    if (type.includes("Public")) return "Global Internet Scope";
    if (type.includes("Loopback")) return "Host Self-Loopback";
    if (type.includes("Link-Local")) return "Auto-IP Link Local";
    return "Special / Reserved Scope";
}

function calculateSubnet(ip, prefix) {
    if (!isValidIPv4(ip)) throw new Error("Enter a valid IPv4 address (e.g. 192.168.1.100)");
    prefix = Number(prefix);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) throw new Error("CIDR prefix must be between 0 and 32");

    const mask = cidrToMask(prefix);
    const ipNumber = ipToInteger(ip);
    const maskNumber = ipToInteger(mask);
    const networkNumber = (ipNumber & maskNumber) >>> 0;
    const total = Math.pow(2, 32 - prefix);
    const broadcastNumber = (networkNumber + total - 1) >>> 0;

    let firstHost, lastHost, usable;
    if (prefix === 32) {
        firstHost = networkNumber;
        lastHost = networkNumber;
        usable = 1;
    } else if (prefix === 31) {
        firstHost = networkNumber;
        lastHost = broadcastNumber;
        usable = 2;
    } else {
        firstHost = (networkNumber + 1) >>> 0;
        lastHost = (broadcastNumber - 1) >>> 0;
        usable = Math.max(0, total - 2);
    }

    const blockSize = Math.pow(2, 32 - prefix);

    return {
        ip,
        prefix,
        cidr: `${ip}/${prefix}`,
        mask,
        wildcard: getWildcard(mask),
        network: integerToIP(networkNumber),
        broadcast: integerToIP(broadcastNumber),
        firstHost: integerToIP(firstHost),
        lastHost: integerToIP(lastHost),
        total,
        usable,
        class: getIPClass(ip),
        type: getIPType(ip),
        scope: getIPScope(ip),
        binaryIP: ipToBinary(ip),
        binaryMask: ipToBinary(mask),
        blockSize
    };
}

function ipToHex(ip) {
    if (!isValidIPv4(ip)) throw new Error("Invalid IPv4 address");
    return ip.split(".")
        .map(x => Number(x).toString(16).padStart(2, "0").toUpperCase())
        .join(".");
}

function hexToIP(hex) {
    hex = hex.replace(/^0x/i, "").replace(/[:\s-]/g, "");
    if (!/^[0-9a-fA-F]{8}$/.test(hex)) {
        throw new Error("Enter exactly 8 hexadecimal digits (e.g. C0A80101)");
    }
    const result = [];
    for (let i = 0; i < 8; i += 2) {
        result.push(parseInt(hex.substring(i, i + 2), 16));
    }
    return result.join(".");
}

function expandIPv6(ip) {
    if (!ip) throw new Error("Enter IPv6 address");
    if (ip.includes("/")) ip = ip.split("/")[0];
    if (!isValidIPv6(ip)) throw new Error("Invalid IPv6 address syntax");

    if (!ip.includes("::")) {
        return ip.split(":").map(x => x.padStart(4, "0")).join(":");
    }
    const sides = ip.split("::");
    const left = sides[0] ? sides[0].split(":") : [];
    const right = sides[1] ? sides[1].split(":") : [];
    const missing = 8 - left.length - right.length;
    return [
        ...left,
        ...Array(missing).fill("0"),
        ...right
    ].map(x => x.padStart(4, "0")).join(":");
}

function compressIPv6(ip) {
    const expanded = expandIPv6(ip);
    const groups = expanded.split(":").map(x => x.replace(/^0+/, "") || "0");

    let bestStart = -1, bestLength = 0;
    let currentStart = -1, currentLength = 0;

    for (let i = 0; i < groups.length; i++) {
        if (groups[i] === "0") {
            if (currentStart === -1) {
                currentStart = i;
                currentLength = 1;
            } else {
                currentLength++;
            }
            if (currentLength > bestLength) {
                bestStart = currentStart;
                bestLength = currentLength;
            }
        } else {
            currentStart = -1;
            currentLength = 0;
        }
    }

    if (bestLength > 1) {
        groups.splice(bestStart, bestLength, "");
        if (bestStart === 0) groups.unshift("");
        if (bestStart + bestLength === 8) groups.push("");
    }
    return groups.join(":");
}

function normalizeMAC(mac) {
    mac = mac.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
    if (mac.length !== 12) throw new Error("Enter a valid 12-digit hexadecimal MAC address");

    const colon = mac.match(/.{1,2}/g).join(":");
    const hyphen = mac.match(/.{1,2}/g).join("-");
    const dot = mac.match(/.{1,4}/g).join(".");
    const oui = mac.substring(0, 6).match(/.{1,2}/g).join(":");
    const firstByte = parseInt(mac.substring(0, 2), 16);
    const isMulticast = Boolean(firstByte & 1);
    const isLocal = Boolean(firstByte & 2);

    return {
        raw: mac,
        colon,
        hyphen,
        dot,
        oui,
        cast: isMulticast ? "Multicast" : "Unicast",
        admin: isLocal ? "Locally Administered" : "Globally Unique (IEEE)"
    };
}


/* =========================================================
   05. CALCULATOR ISOLATED ENGINES
   ========================================================= */

// 1. SUBNET CALCULATOR
function runSubnetCalculator(showToast = true) {
    try {
        const ip = valueOf("subnetIp") || "192.168.1.100";
        const prefixSlider = $("#subnetPrefix");
        const prefix = prefixSlider ? prefixSlider.value : "24";

        setText("subnetPrefixVal", `/${prefix}`);

        // Update active prefix pill
        qsa("#commonPrefixes button").forEach(btn => {
            if (btn.getAttribute("data-prefix") === String(prefix)) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        const res = calculateSubnet(ip, prefix);

        setText("resSubnetCidr", `${res.network}/${res.prefix}`);
        setText("resSubnetNet", res.network);
        setText("resSubnetBcast", res.broadcast);
        setText("resSubnetMask", res.mask);
        setText("resSubnetWildcard", res.wildcard);
        setText("resSubnetFirst", res.firstHost);
        setText("resSubnetLast", res.lastHost);
        setText("resSubnetTotal", formatNumber(res.total));
        setText("resSubnetUsable", formatNumber(res.usable));
        setText("resSubnetClass", res.class);
        setText("resSubnetScope", res.type);
        setText("resSubnetBlock", formatNumber(res.blockSize));

        renderSubnetBinaryViz(res);

        if (showToast) {
            addHistory("Subnet Calculator", `${ip}/${prefix}`);
            toast("Subnet calculated successfully", "success");
        }
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

function renderSubnetBinaryViz(res) {
    const container = $("#subnetBinaryViz");
    if (!container) return;

    const binIP = res.binaryIP.split(".");
    const prefix = res.prefix;
    let bitCounter = 0;

    let html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:12px;">';
    binIP.forEach((octet, idx) => {
        html += `<div style="background:var(--bg-primary);padding:10px;border:1px solid var(--border);border-radius:6px;text-align:center;">`;
        html += `<small style="color:var(--text-muted);display:block;margin-bottom:6px;font-size:9px;">Octet ${idx + 1}</small>`;
        html += `<div style="display:flex;gap:2px;justify-content:center;">`;
        octet.split("").forEach(bit => {
            bitCounter++;
            const isNet = bitCounter <= prefix;
            const bg = isNet ? "var(--accent-soft)" : "var(--blue-soft)";
            const color = isNet ? "var(--accent)" : "var(--blue)";
            const border = isNet ? "1px solid var(--accent)" : "1px solid var(--blue)";
            html += `<span style="display:inline-block;width:16px;height:22px;line-height:20px;background:${bg};color:${color};border:${border};border-radius:3px;font-family:monospace;font-weight:bold;font-size:10px;">${bit}</span>`;
        });
        html += `</div></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

// 2. CIDR CALCULATOR
function runCIDRCalculator(showToast = true) {
    try {
        let str = valueOf("cidrInput") || "10.0.0.1/8";
        let ip = str, prefix = 8;
        if (str.includes("/")) {
            const parts = str.split("/");
            ip = parts[0];
            prefix = Number(parts[1]);
        }
        const res = calculateSubnet(ip, prefix);

        setText("resCidrPrefix", `/${res.prefix}`);
        setText("resCidrMask", res.mask);
        setText("resCidrWildcard", res.wildcard);
        setText("resCidrNet", res.network);
        setText("resCidrBcast", res.broadcast);
        setText("resCidrFirst", res.firstHost);
        setText("resCidrLast", res.lastHost);
        setText("resCidrUsable", formatNumber(res.usable));
        setText("resCidrHostBits", `${32 - res.prefix} bits`);
        setText("resCidrSubnetBits", `${res.prefix} bits`);

        if (showToast) {
            addHistory("CIDR Calculator", str);
            toast("CIDR analyzed", "success");
        }
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

// 3. VLSM CALCULATOR
function renderReqList() {
    const container = $("#vlsmReqList");
    if (!container) return;

    if (APP.vlsmRequirements.length === 0) {
        container.innerHTML = `<div style="color:var(--text-muted);font-size:11px;padding:10px;">No subnet requirements added.</div>`;
        return;
    }

    container.innerHTML = APP.vlsmRequirements.map((req, idx) => `
        <div class="req-item">
            <strong>${escapeHTML(req.name)}</strong>
            <span>${formatNumber(req.hosts)} hosts</span>
            <button type="button" class="btn-icon danger remove-vlsm-req" data-idx="${idx}"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join("");

    container.querySelectorAll(".remove-vlsm-req").forEach(btn => {
        btn.onclick = () => {
            const idx = Number(btn.getAttribute("data-idx"));
            APP.vlsmRequirements.splice(idx, 1);
            renderReqList();
        };
    });
}

function runVLSMCalculator() {
    try {
        const baseCIDR = valueOf("vlsmBase") || "192.168.10.0/24";
        if (APP.vlsmRequirements.length === 0) {
            toast("Add at least one subnet requirement", "error");
            return;
        }

        const results = calculateVLSM(baseCIDR, APP.vlsmRequirements);
        APP.vlsmResults = results;
        renderVLSMTable(results);
        addHistory("VLSM Calculator", baseCIDR);
        toast("VLSM allocation plan generated", "success");
    } catch (e) {
        toast(e.message, "error");
    }
}

function calculateVLSM(baseCIDR, requirements) {
    if (!baseCIDR.includes("/")) throw new Error("Enter base network in CIDR format (e.g. 192.168.10.0/24)");
    const parts = baseCIDR.split("/");
    const baseIP = parts[0];
    const basePrefix = Number(parts[1]);

    const base = calculateSubnet(baseIP, basePrefix);
    const baseStart = ipToInteger(base.network);
    const baseEnd = ipToInteger(base.broadcast);

    const sorted = [...requirements].sort((a, b) => b.hosts - a.hosts);
    let current = baseStart;
    const results = [];

    for (const req of sorted) {
        let hostBits = Math.ceil(Math.log2(req.hosts + 2));
        if (hostBits < 2) hostBits = 2;
        const prefix = 32 - hostBits;
        const size = Math.pow(2, hostBits);

        const network = Math.ceil(current / size) * size;
        const broadcast = network + size - 1;

        if (broadcast > baseEnd) {
            throw new Error(`Insufficient address space in ${baseCIDR} for requirement "${req.name}" (${req.hosts} hosts)`);
        }

        results.push({
            name: req.name,
            reqHosts: req.hosts,
            allocHosts: size - 2,
            cidr: `${integerToIP(network)}/${prefix}`,
            mask: cidrToMask(prefix),
            network: integerToIP(network),
            firstHost: integerToIP(network + 1),
            lastHost: integerToIP(broadcast - 1),
            broadcast: integerToIP(broadcast)
        });

        current = broadcast + 1;
    }
    return results;
}

function renderVLSMTable(results) {
    const tbody = $("#vlsmTableBody");
    if (!tbody) return;
    tbody.innerHTML = results.map(r => `
        <tr>
            <td><strong>${escapeHTML(r.name)}</strong></td>
            <td>${formatNumber(r.reqHosts)}</td>
            <td><strong>${formatNumber(r.allocHosts)}</strong></td>
            <td class="mono">${r.cidr}</td>
            <td class="mono">${r.mask}</td>
            <td class="mono">${r.network}</td>
            <td class="mono">${r.firstHost}</td>
            <td class="mono">${r.lastHost}</td>
            <td class="mono">${r.broadcast}</td>
        </tr>
    `).join("");
}

function exportVLSMPlan() {
    if (!APP.vlsmResults || APP.vlsmResults.length === 0) {
        toast("Generate VLSM plan before exporting", "error");
        return;
    }
    const headers = ["Name", "Req. Hosts", "Alloc. Hosts", "CIDR", "Subnet Mask", "Network", "First Host", "Last Host", "Broadcast"];
    const rows = APP.vlsmResults.map(r => [
        r.name, r.reqHosts, r.allocHosts, r.cidr, r.mask, r.network, r.firstHost, r.lastHost, r.broadcast
    ]);
    const tsv = [headers.join("\t"), ...rows.map(row => row.join("\t"))].join("\n");
    copyToClipboard(tsv)
        .then(() => toast("VLSM table copied to clipboard", "success"))
        .catch(() => toast("Failed to copy table", "error"));
}

// 4. SUPERNETTING
function runSupernetCalculator(showToast = true) {
    try {
        const inputs = qsa(".supernet-input");
        const networks = [...inputs].map(inp => inp.value.trim()).filter(Boolean);
        if (networks.length < 2) throw new Error("Enter at least two CIDR networks to summarize");

        const res = calculateSupernet(networks);
        setText("resSupernetCidr", res.supernetCIDR);
        setText("resSupernetMask", res.mask);
        setText("resSupernetWildcard", getWildcard(res.mask));
        setText("resSupernetCount", networks.length);
        setText("resSupernetTotal", formatNumber(res.total) + " addresses");

        if (showToast) toast("Supernet calculated", "success");
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

function calculateSupernet(networks) {
    const parsed = networks.map(cidr => {
        if (!cidr.includes("/")) throw new Error(`Invalid CIDR format: ${cidr}`);
        const parts = cidr.split("/");
        if (!isValidIPv4(parts[0])) throw new Error(`Invalid IPv4 address in ${cidr}`);
        return { ip: parts[0], prefix: Number(parts[1]) };
    });

    const numbers = parsed.map(n => {
        const sub = calculateSubnet(n.ip, n.prefix);
        return ipToInteger(sub.network);
    });

    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const xor = (min ^ max) >>> 0;

    let prefix = 32;
    for (let bit = 31; bit >= 0; bit--) {
        if (((xor >>> bit) & 1) === 1) {
            prefix = 31 - bit;
            break;
        }
    }

    const res = calculateSubnet(integerToIP(min), prefix);
    return {
        supernetCIDR: `${res.network}/${prefix}`,
        network: res.network,
        mask: res.mask,
        total: res.total
    };
}

// 5. IP RANGE
function runRangeCalculator(showToast = true) {
    try {
        const start = valueOf("rangeStartIp") || "192.168.1.10";
        const end = valueOf("rangeEndIp") || "192.168.1.50";

        if (!isValidIPv4(start) || !isValidIPv4(end)) throw new Error("Enter valid start and end IPv4 addresses");

        const first = ipToInteger(start);
        const last = ipToInteger(end);

        if (first > last) throw new Error("Start IP must be less than or equal to End IP");

        const count = last - first + 1;

        setText("resRangeCount", formatNumber(count));
        setText("resRangeStartInt", formatNumber(first));
        setText("resRangeEndInt", formatNumber(last));
        setText("resRangeValid", "Valid Address Range");

        // CIDR List Generation
        const cidrBlocks = ipRangeToCIDRBlocks(start, end);
        const cidrListEl = $("#resRangeCidrList");
        if (cidrListEl) {
            cidrListEl.innerHTML = `
                <div class="card-title" style="margin-bottom:8px;"><span class="kicker">MATCHING SUBNETS</span><h3>Minimal CIDR Block Allocation (${cidrBlocks.length} ${cidrBlocks.length === 1 ? "block" : "blocks"})</h3></div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${cidrBlocks.map(b => `<span class="badge primary mono" style="font-size:13px;padding:6px 10px;">${b}</span>`).join("")}
                </div>
            `;
        }

        if (showToast) toast("IP range calculated", "success");
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

// 6. WILDCARD
function runWildcardCalculator(showToast = true) {
    try {
        let val = valueOf("wildcardInput") || "255.255.255.0";
        let mask = val;
        if (val.startsWith("/")) {
            mask = cidrToMask(val.replace("/", ""));
        } else if (!val.includes(".")) {
            mask = cidrToMask(val);
        }

        const cidr = maskToCIDR(mask);
        const wildcard = getWildcard(mask);
        const bin = ipToBinary(wildcard);

        setText("resWildcardMask", wildcard);
        setText("resWildcardSubnet", mask);
        setText("resWildcardPrefix", `/${cidr}`);
        setText("resWildcardBin", bin);

        const aclEl = $("#resWildcardAcl");
        if (aclEl) {
            aclEl.textContent = generateCiscoACL("192.168.1.0", wildcard);
        }

        if (showToast) toast("Wildcard mask calculated", "success");
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

// 7. IP CLASSIFIER
function runClassifier(showToast = true) {
    try {
        const ip = valueOf("classifyInput") || "192.168.1.100";
        if (!isValidIPv4(ip)) throw new Error("Enter a valid IPv4 address");

        const cls = getIPClass(ip);
        const type = getIPType(ip);
        const scope = getIPScope(ip);
        const defaultMask = cls.startsWith("Class A") ? "255.0.0.0" : cls.startsWith("Class B") ? "255.255.0.0" : cls.startsWith("Class C") ? "255.255.255.0" : "N/A";

        setText("resClassClass", cls);
        setText("resClassType", type);
        setText("resClassScope", scope);
        setText("resClassMask", defaultMask);

        if (showToast) toast("IP classified", "success");
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

// 8. IP VALIDATOR
function runValidator(showToast = true) {
    const ip = valueOf("validateIpInput") || "192.168.1.1";
    const box = $("#validateResultBox");
    if (!box) return;

    if (isValidIPv4(ip)) {
        const num = ipToInteger(ip);
        const bin = ipToBinary(ip);
        const cls = getIPClass(ip);
        const type = getIPType(ip);

        box.innerHTML = `
            <div class="card" style="border-left:4px solid var(--accent);">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                    <i class="fa-solid fa-circle-check" style="color:var(--accent);font-size:20px;"></i>
                    <div><strong style="color:var(--accent);">Valid IPv4 Address</strong><br><span class="mono">${ip}</span></div>
                </div>
                <div class="metrics-grid">
                    <div class="metric-card"><span>CLASS</span><strong>${cls}</strong></div>
                    <div class="metric-card"><span>DESIGNATION</span><strong>${type}</strong></div>
                    <div class="metric-card"><span>BINARY</span><strong class="mono">${bin}</strong></div>
                    <div class="metric-card"><span>INTEGER</span><strong class="mono">${formatNumber(num)}</strong></div>
                </div>
            </div>
        `;
        if (showToast) toast("Valid IPv4 address", "success");
    } else {
        box.innerHTML = `
            <div class="card" style="border-left:4px solid var(--red);">
                <div style="display:flex;align-items:center;gap:10px;">
                    <i class="fa-solid fa-circle-xmark" style="color:var(--red);font-size:20px;"></i>
                    <div><strong style="color:var(--red);">Invalid IPv4 Address Syntax</strong><br><span>"${escapeHTML(ip)}" is not a valid 32-bit dotted-decimal IPv4 address.</span></div>
                </div>
            </div>
        `;
        if (showToast) toast("Invalid IPv4 address", "error");
    }
}

// 9. IP CONVERTER
function runIPConverter(showToast = true) {
    try {
        const ip = valueOf("convertIpInput") || "192.168.1.1";
        if (!isValidIPv4(ip)) throw new Error("Enter a valid IPv4 address");

        const bin = ipToBinary(ip);
        const hex = ipToHex(ip);
        const num = ipToInteger(ip);

        setText("resConvDec", ip);
        setText("resConvBin", bin);
        setText("resConvHex", hex);
        setText("resConvInt", formatNumber(num));

        if (showToast) toast("IP converted to all formats", "success");
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

// 10. BINARY CONVERTER
function runBinaryConverter(showToast = true) {
    try {
        const binIp = valueOf("binIpInput") || "11000000.10101000.00000001.00000001";
        const binOctet = valueOf("binOctetInput") || "11000000";

        if (binIp) {
            const ip = binaryToIP(binIp);
            setText("resBinIp", ip);
        }
        if (binOctet) {
            const num = parseInt(binOctet, 2);
            if (!isNaN(num) && num >= 0 && num <= 255) {
                setText("resBinOctet", num);
            }
        }
        if (showToast) toast("Binary converted", "success");
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

// 11. DECIMAL CONVERTER
function runDecimalConverter(showToast = true) {
    try {
        const val = valueOf("decimalValInput") || "192";
        if (val.includes(".")) {
            if (!isValidIPv4(val)) throw new Error("Invalid IPv4 decimal syntax");
            const bin = ipToBinary(val);
            const hex = ipToHex(val);
            setText("resDecBin", bin);
            setText("resDecHex", hex);
            setText("resDecVal", val);
        } else {
            const num = Number(val);
            if (isNaN(num) || num < 0 || num > 255) throw new Error("Decimal octet must be between 0 and 255");
            const bin = num.toString(2).padStart(8, "0");
            const hex = num.toString(16).toUpperCase().padStart(2, "0");
            setText("resDecBin", bin);
            setText("resDecHex", hex);
            setText("resDecVal", num);
        }
        if (showToast) toast("Decimal converted", "success");
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

// 12. HEX CONVERTER
function runHexConverter(showToast = true) {
    try {
        const hex = valueOf("hexValInput") || "C0A80101";
        const ip = hexToIP(hex);
        const bin = ipToBinary(ip);
        const num = ipToInteger(ip);

        setText("resHexIp", ip);
        setText("resHexBin", bin);
        setText("resHexInt", formatNumber(num));

        if (showToast) toast("Hex converted to IPv4", "success");
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

// 13. INTEGER CONVERTER
function runIntegerConverter(showToast = true) {
    try {
        const num = valueOf("intValInput") || "3232235777";
        const ip = integerToIP(num);
        const bin = ipToBinary(ip);
        const hex = ipToHex(ip);

        setText("resIntIp", ip);
        setText("resIntBin", bin);
        setText("resIntHex", hex);

        if (showToast) toast("Integer converted to IPv4", "success");
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

// 14. IPv6 CALCULATOR
function runIPv6Calculator(showToast = true) {
    try {
        let input = valueOf("ipv6CalcInput") || "2001:db8::1/64";
        let ip = input, prefix = "64";
        if (input.includes("/")) {
            const parts = input.split("/");
            ip = parts[0];
            prefix = parts[1];
        }

        const comp = compressIPv6(ip);
        const exp = expandIPv6(ip);

        setText("resIpv6Comp", comp);
        setText("resIpv6Exp", exp);
        setText("resIpv6Prefix", `/${prefix}`);
        setText("resIpv6Scope", comp.startsWith("2001:db8") ? "Documentation Range (RFC 3849)" : "Global Unicast IPv6");

        if (showToast) toast("IPv6 address analyzed", "success");
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

// 15. IPv6 COMPRESSION & EXPANSION
function runIPv6CompressExpand(showToast = true) {
    try {
        const comp = valueOf("ipv6CompInput") || "2001:db8::ff00:42:8329";
        const expInput = valueOf("ipv6ExpInput") || "2001:0db8:0000:0000:0000:ff00:0042:8329";

        if (comp) {
            const expanded = expandIPv6(comp);
            setText("resIpv6Expanded", expanded);
        }
        if (expInput) {
            const compressed = compressIPv6(expInput);
            setText("resIpv6Compressed", compressed);
        }
        if (showToast) toast("IPv6 notation processed", "success");
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}

// 16. IPv6 VALIDATOR
function runIPv6Validator(showToast = true) {
    const ip = valueOf("ipv6ValInput") || "2001:db8::1";
    const box = $("#ipv6ValResultBox");
    if (!box) return;

    if (isValidIPv6(ip)) {
        const exp = expandIPv6(ip);
        const comp = compressIPv6(ip);
        box.innerHTML = `
            <div class="card" style="border-left:4px solid var(--accent);">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                    <i class="fa-solid fa-circle-check" style="color:var(--accent);font-size:20px;"></i>
                    <div><strong style="color:var(--accent);">Valid IPv6 Address</strong><br><span class="mono">${comp}</span></div>
                </div>
                <div class="metrics-grid">
                    <div class="metric-card"><span>EXPANDED FORM</span><strong class="mono">${exp}</strong></div>
                    <div class="metric-card"><span>COMPRESSED FORM</span><strong class="mono">${comp}</strong></div>
                </div>
            </div>
        `;
        if (showToast) toast("Valid IPv6 address", "success");
    } else {
        box.innerHTML = `
            <div class="card" style="border-left:4px solid var(--red);">
                <div style="display:flex;align-items:center;gap:10px;">
                    <i class="fa-solid fa-circle-xmark" style="color:var(--red);font-size:20px;"></i>
                    <div><strong style="color:var(--red);">Invalid IPv6 Address Syntax</strong><br><span>"${escapeHTML(ip)}" is not a valid 128-bit IPv6 address.</span></div>
                </div>
            </div>
        `;
        if (showToast) toast("Invalid IPv6 address", "error");
    }
}

// 17. MAC TOOLS
function runMACTools(showToast = true) {
    try {
        const raw = valueOf("macInput") || "001122334455";
        const mac = normalizeMAC(raw);

        setText("resMacColon", mac.colon);
        setText("resMacHyphen", mac.hyphen);
        setText("resMacDot", mac.dot);
        setText("resMacOui", mac.oui);
        setText("resMacCast", mac.cast);
        setText("resMacAdmin", mac.admin);

        const eui64 = macToEUI64(raw);
        setText("resMacEui64", eui64);

        if (showToast) toast("MAC address normalized", "success");
    } catch (e) {
        if (showToast) toast(e.message, "error");
    }
}


/* =========================================================
   06. REFERENCE TABLES ENGINE
   ========================================================= */

function initReferenceTables() {
    renderPortTable();
    renderProtocolTable();
    renderCIDRReferenceTable();
    renderSubnetReferenceCards();
}

function renderPortTable(query = "") {
    const tbody = $("#portTableBody");
    if (!tbody) return;

    const ports = [
        { port: 20, proto: "TCP", service: "FTP-DATA", desc: "File Transfer Protocol (Data Transfer)" },
        { port: 21, proto: "TCP", service: "FTP", desc: "File Transfer Protocol (Control Command)" },
        { port: 22, proto: "TCP", service: "SSH / SFTP", desc: "Secure Shell / Secure File Transfer" },
        { port: 23, proto: "TCP", service: "Telnet", desc: "Unencrypted Text Terminal Communications" },
        { port: 25, proto: "TCP", service: "SMTP", desc: "Simple Mail Transfer Protocol (Email Dispatch)" },
        { port: 53, proto: "TCP/UDP", service: "DNS", desc: "Domain Name System Name Resolution" },
        { port: 67, proto: "UDP", service: "DHCP Server", desc: "Dynamic Host Configuration Protocol Server" },
        { port: 68, proto: "UDP", service: "DHCP Client", desc: "Dynamic Host Configuration Protocol Client" },
        { port: 80, proto: "TCP", service: "HTTP", desc: "Hypertext Transfer Protocol (Unencrypted Web)" },
        { port: 110, proto: "TCP", service: "POP3", desc: "Post Office Protocol Version 3" },
        { port: 123, proto: "UDP", service: "NTP", desc: "Network Time Protocol Synchronization" },
        { port: 143, proto: "TCP", service: "IMAP", desc: "Internet Message Access Protocol" },
        { port: 161, proto: "UDP", service: "SNMP", desc: "Simple Network Management Protocol" },
        { port: 389, proto: "TCP/UDP", service: "LDAP", desc: "Lightweight Directory Access Protocol" },
        { port: 443, proto: "TCP", service: "HTTPS", desc: "HTTP Secure (TLS Encrypted Web)" },
        { port: 445, proto: "TCP", service: "SMB", desc: "Server Message Block (Windows File Sharing)" },
        { port: 465, proto: "TCP", service: "SMTPS", desc: "SMTP over TLS Encrypted Email" },
        { port: 587, proto: "TCP", service: "SMTP Submission", desc: "Email Message Submission Port" },
        { port: 636, proto: "TCP", service: "LDAPS", desc: "LDAP over TLS Encrypted Directory" },
        { port: 993, proto: "TCP", service: "IMAPS", desc: "IMAP over TLS Secure Mail Access" },
        { port: 995, proto: "TCP", service: "POP3S", desc: "POP3 over TLS Secure Mail Access" },
        { port: 3306, proto: "TCP", service: "MySQL", desc: "MySQL Database System Port" },
        { port: 3389, proto: "TCP", service: "RDP", desc: "Remote Desktop Protocol" },
        { port: 5432, proto: "TCP", service: "PostgreSQL", desc: "PostgreSQL Database Engine" },
        { port: 6379, proto: "TCP", service: "Redis", desc: "Redis In-Memory Key-Value Store" },
        { port: 8080, proto: "TCP", service: "HTTP Alt Proxy", desc: "Alternative HTTP Proxy / Admin UI" }
    ];

    query = query.toLowerCase().trim();
    const filtered = ports.filter(p =>
        !query || String(p.port).includes(query) || p.proto.toLowerCase().includes(query) || p.service.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query)
    );

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td class="mono"><strong>${p.port}</strong></td>
            <td><span class="nav-badge">${p.proto}</span></td>
            <td><strong>${p.service}</strong></td>
            <td style="color:var(--text-secondary);">${p.desc}</td>
        </tr>
    `).join("");
}

function renderProtocolTable(query = "") {
    const tbody = $("#protocolTableBody");
    if (!tbody) return;

    const protocols = [
        { name: "ARP", layer: "Link (Layer 2)", purpose: "Address Resolution Protocol (IPv4 to MAC resolution)", port: "N/A", transport: "Ethernet Frame" },
        { name: "IPv4", layer: "Network (Layer 3)", purpose: "32-bit connectionless Internet Protocol", port: "N/A", transport: "IP Packet" },
        { name: "IPv6", layer: "Network (Layer 3)", purpose: "128-bit next-generation Internet Protocol", port: "N/A", transport: "IP Packet" },
        { name: "ICMP", layer: "Network Control", purpose: "Error reporting and network diagnostics (Ping)", port: "N/A", transport: "IP Protocol 1" },
        { name: "TCP", layer: "Transport (Layer 4)", purpose: "Reliable connection-oriented byte stream transport", port: "Various", transport: "IP Protocol 6" },
        { name: "UDP", layer: "Transport (Layer 4)", purpose: "Low-latency connectionless datagram transport", port: "Various", transport: "IP Protocol 17" },
        { name: "DNS", layer: "Application (Layer 7)", purpose: "Domain name resolution to IP addresses", port: "53", transport: "UDP / TCP" },
        { name: "DHCP", layer: "Application (Layer 7)", purpose: "Automated network host IP configuration", port: "67 / 68", transport: "UDP" },
        { name: "HTTP", layer: "Application (Layer 7)", purpose: "Hypertext Web page transfer protocol", port: "80", transport: "TCP" },
        { name: "HTTPS", layer: "Application (Layer 7)", purpose: "Encrypted web communications via TLS", port: "443", transport: "TCP" },
        { name: "SSH", layer: "Application (Layer 7)", purpose: "Encrypted remote terminal access and SFTP", port: "22", transport: "TCP" },
        { name: "BGP", layer: "Routing Protocol", purpose: "Border Gateway Protocol routing across Autonomous Systems", port: "179", transport: "TCP" },
        { name: "OSPF", layer: "Routing Protocol", purpose: "Open Shortest Path First interior link-state routing", port: "N/A", transport: "IP Protocol 89" }
    ];

    query = query.toLowerCase().trim();
    const filtered = protocols.filter(p =>
        !query || p.name.toLowerCase().includes(query) || p.layer.toLowerCase().includes(query) || p.purpose.toLowerCase().includes(query)
    );

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td class="mono"><strong>${p.name}</strong></td>
            <td><span class="nav-badge">${p.layer}</span></td>
            <td style="color:var(--text-secondary);">${p.purpose}</td>
            <td class="mono">${p.port}</td>
            <td>${p.transport}</td>
        </tr>
    `).join("");
}

function renderCIDRReferenceTable(query = "") {
    const tbody = $("#cidrTableBody");
    if (!tbody) return;

    const rows = [];
    for (let p = 0; p <= 32; p++) {
        const mask = cidrToMask(p);
        const wildcard = getWildcard(mask);
        const total = Math.pow(2, 32 - p);
        const usable = p === 32 ? 1 : p === 31 ? 2 : Math.max(0, total - 2);

        rows.push({ prefix: `/${p}`, mask, wildcard, total, usable, blockSize: total });
    }

    query = query.toLowerCase().trim();
    const filtered = rows.filter(r => !query || r.prefix.includes(query) || r.mask.includes(query) || r.wildcard.includes(query));

    tbody.innerHTML = filtered.map(r => `
        <tr>
            <td class="mono"><strong>${r.prefix}</strong></td>
            <td class="mono">${r.mask}</td>
            <td class="mono">${r.wildcard}</td>
            <td>${formatNumber(r.total)}</td>
            <td><strong>${formatNumber(r.usable)}</strong></td>
            <td class="mono">${formatNumber(r.blockSize)}</td>
        </tr>
    `).join("");
}

function renderSubnetReferenceCards() {
    const container = $("#subnetGuidesGrid");
    if (!container) return;

    const guides = [
        { title: "/32 Subnet (Single Host)", details: "Mask: 255.255.255.255 • Total: 1 • Usable: 1. Used for loopback interfaces and host routes." },
        { title: "/30 Subnet (Point-to-Point)", details: "Mask: 255.255.255.252 • Total: 4 • Usable: 2. Ideal for router-to-router point-to-point links." },
        { title: "/29 Subnet (Small WAN Link)", details: "Mask: 255.255.255.248 • Total: 8 • Usable: 6. Common for WAN assignments with multiple static IPs." },
        { title: "/28 Subnet (Small Branch)", details: "Mask: 255.255.255.240 • Total: 16 • Usable: 14. Designed for management VLANs or small servers." },
        { title: "/24 Subnet (Standard LAN)", details: "Mask: 255.255.255.0 • Total: 256 • Usable: 254. The ubiquitous default corporate LAN subnet block." },
        { title: "/20 Subnet (Enterprise Pod)", details: "Mask: 255.255.240.0 • Total: 4,096 • Usable: 4,094. Designed for enterprise data centers and campus networks." },
        { title: "/16 Subnet (Class B Block)", details: "Mask: 255.255.0.0 • Total: 65,536 • Usable: 65,534. Enterprise regional network allocation blocks." },
        { title: "/8 Subnet (Class A Supernet)", details: "Mask: 255.0.0.0 • Total: 16,777,216 • Usable: 16,777,214. Global corporate backbone supernet block." }
    ];

    container.innerHTML = guides.map(g => `
        <div class="card">
            <h3 style="color:var(--accent);margin-bottom:6px;">${g.title}</h3>
            <p style="color:var(--text-secondary);font-size:11px;">${g.details}</p>
        </div>
    `).join("");
}


/* =========================================================
   07. GLOBAL SEARCH & MODALS
   ========================================================= */

function renderSearchModal(query = "") {
    const list = $("#searchResultsList");
    if (!list) return;

    const tools = [
        { name: "Subnet Calculator", page: "subnet-calculator", desc: "Calculate network, broadcast, host ranges and masks" },
        { name: "CIDR Calculator", page: "cidr-calculator", desc: "Analyze CIDR prefix lengths and capacity" },
        { name: "VLSM Calculator", page: "vlsm-calculator", desc: "Design variable-length subnet mask allocations" },
        { name: "Supernetting", page: "supernetting", desc: "Summarize contiguous CIDR networks" },
        { name: "IP Range Calculator", page: "ip-range", desc: "Calculate host capacity between IP endpoints" },
        { name: "Wildcard Mask Calculator", page: "wildcard", desc: "Generate inverse wildcard masks for ACLs" },
        { name: "IP Classifier", page: "ip-classifier", desc: "Determine Class A/B/C/D/E and Public/Private scope" },
        { name: "IP Validator", page: "ip-validator", desc: "Validate IPv4 address syntax and properties" },
        { name: "IP Converter", page: "ip-converter", desc: "Convert IP to binary, hex, 32-bit int" },
        { name: "Binary Converter", page: "binary-converter", desc: "Dotted binary conversion & single octets" },
        { name: "Decimal Converter", page: "decimal-converter", desc: "Convert decimal numbers into binary & hex" },
        { name: "Hex Converter", page: "hex-converter", desc: "Convert hex string to IPv4 dotted decimal" },
        { name: "Integer Converter", page: "integer-converter", desc: "Convert 32-bit unsigned int to IPv4 address" },
        { name: "IPv6 Calculator", page: "ipv6-calculator", desc: "Analyze IPv6 address prefix and scope" },
        { name: "IPv6 Compress / Expand", page: "ipv6-compression", desc: "Convert between full and RFC 5952 compressed IPv6" },
        { name: "IPv6 Validator", page: "ipv6-validator", desc: "Validate IPv6 address syntax" },
        { name: "MAC Tools", page: "mac-tools", desc: "MAC address normalization, OUI and multicast analysis" },
        { name: "Port Reference", page: "port-reference", desc: "Searchable database of TCP/UDP ports" },
        { name: "Protocol Reference", page: "protocol-reference", desc: "Networking protocols reference" },
        { name: "CIDR Reference", page: "cidr-reference", desc: "Complete /0 to /32 CIDR prefix table" },
        { name: "Subnet Reference", page: "subnet-reference", desc: "Subnet sizing guides and architectural reference" }
    ];

    query = query.toLowerCase().trim();
    const filtered = tools.filter(t => !query || t.name.toLowerCase().includes(query) || t.desc.toLowerCase().includes(query));

    if (filtered.length === 0) {
        list.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:11px;">No matching tools found</div>`;
        return;
    }

    list.innerHTML = filtered.map(t => `
        <div class="search-item" data-page="${t.page}">
            <div class="search-item-icon"><i class="fa-solid fa-wrench"></i></div>
            <div class="search-item-info">
                <strong>${escapeHTML(t.name)}</strong>
                <small>${escapeHTML(t.desc)}</small>
            </div>
        </div>
    `).join("");
}


/* =========================================================
   08. HISTORY & TOAST NOTIFICATIONS
   ========================================================= */

function addHistory(tool, input) {
    APP.history.unshift({
        tool,
        input,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    APP.history = APP.history.slice(0, 50);
    localStorage.setItem("netforge_history", JSON.stringify(APP.history));
    renderHistory();
}

function renderHistory() {
    const modalList = $("#modalHistoryList");
    if (!modalList) return;

    if (APP.history.length === 0) {
        modalList.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:11px;">No history recorded yet.</div>`;
        return;
    }

    modalList.innerHTML = APP.history.map(item => `
        <div class="history-item" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
            <div>
                <strong>${escapeHTML(item.tool)}</strong>
                <span class="mono" style="color:var(--accent);margin-left:8px;">${escapeHTML(item.input)}</span>
            </div>
            <small style="color:var(--text-muted);">${escapeHTML(item.date)}</small>
        </div>
    `).join("");
}

function toast(message, type = "info") {
    let container = $("#toastContainer");
    if (!container) return;

    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${escapeHTML(message)}</span>`;
    container.appendChild(t);

    setTimeout(() => {
        t.style.opacity = "0";
        t.style.transition = "opacity 200ms ease";
        setTimeout(() => t.remove(), 200);
    }, 2800);
}


/* =========================================================
   09. INITIALIZATION & GLOBAL DELEGATION
   ========================================================= */

function calculateAllDefaults() {
    runSubnetCalculator(false);
    runCIDRCalculator(false);
    runIPConverter(false);
    runValidator(false);
    runClassifier(false);
    runRangeCalculator(false);
    runWildcardCalculator(false);
    runSupernetCalculator(false);
    runIPv6Calculator(false);
    runIPv6Validator(false);
    runMACTools(false);
    runDecimalConverter(false);
    runHexConverter(false);
    runIntegerConverter(false);
}

function initEvents() {
    // 1. Single Central Navigation Delegation
    document.addEventListener("click", e => {
        const target = e.target;
        if (!target) return;

        // Navigation elements
        const navItem = target.closest("[data-page]");
        if (navItem) {
            const page = navItem.getAttribute("data-page");
            if (page) {
                e.preventDefault();
                navigateTo(page);
                return;
            }
        }

        // Modals close
        if (target.closest("[data-modal-close]") || target.classList.contains("modal-backdrop")) {
            closeAllModals();
            return;
        }

        // Copy buttons
        const copyBtn = target.closest("[data-copy-target]");
        if (copyBtn) {
            const targetId = copyBtn.getAttribute("data-copy-target");
            const el = $(targetId);
            if (el) {
                const text = el.value || el.textContent;
                copyToClipboard(text)
                    .then(() => toast("Copied to clipboard", "success"))
                    .catch(() => toast("Failed to copy", "error"));
            }
            return;
        }

        // Mobile drawer toggle
        if (target.closest("#sidebarOpen, #sidebarClose, #sidebarOverlay")) {
            toggleMobileSidebar();
            return;
        }

        // Global search button
        if (target.closest("#globalSearchBtn")) {
            openModal("searchModal");
            const input = $("#modalSearchInput");
            if (input) { input.value = ""; input.focus(); renderSearchModal(""); }
            return;
        }

        // History modal button
        if (target.closest("#historyBtn")) {
            renderHistory();
            openModal("historyModal");
            return;
        }

        // Clear history button
        if (target.closest("#clearHistoryBtn")) {
            APP.history = [];
            localStorage.setItem("netforge_history", "[]");
            renderHistory();
            toast("History cleared", "info");
            return;
        }

        // Dashboard reset
        if (target.closest("#dashboardReset")) {
            calculateAllDefaults();
            toast("Workbench reset to default calculations", "info");
            return;
        }

        // Specific Tool Action Buttons
        if (target.closest("#calcSubnetBtn")) { runSubnetCalculator(true); return; }
        if (target.closest('[data-action="reset-subnet"]')) {
            const ipInp = $("#subnetIp");
            const slider = $("#subnetPrefix");
            if (ipInp) ipInp.value = "192.168.1.100";
            if (slider) slider.value = "24";
            runSubnetCalculator(false);
            toast("Subnet parameters reset", "info");
            return;
        }
        if (target.closest("#commonPrefixes button")) {
            const p = target.closest("#commonPrefixes button").getAttribute("data-prefix");
            const slider = $("#subnetPrefix");
            if (slider) slider.value = p;
            runSubnetCalculator(false);
            return;
        }

        if (target.closest("#calcCidrBtn")) { runCIDRCalculator(true); return; }
        if (target.closest("#vlsmAddBtn")) {
            const name = valueOf("vlsmReqName") || `Subnet ${APP.vlsmRequirements.length + 1}`;
            const hosts = Number(valueOf("vlsmReqHosts"));
            if (isNaN(hosts) || hosts <= 0) {
                toast("Enter valid host count", "error");
                return;
            }
            APP.vlsmRequirements.push({ name, hosts });
            const nameInp = $("#vlsmReqName");
            const hostsInp = $("#vlsmReqHosts");
            if (nameInp) nameInp.value = "";
            if (hostsInp) hostsInp.value = "";
            renderReqList();
            toast(`Added requirement: ${name}`, "success");
            return;
        }
        if (target.closest("#vlsmCalcBtn")) { runVLSMCalculator(); return; }
        if (target.closest("#vlsmExportBtn")) { exportVLSMPlan(); return; }

        if (target.closest("#exportSubnetJsonBtn")) { exportSubnetResults("json"); return; }
        if (target.closest("#exportSubnetCsvBtn")) { exportSubnetResults("csv"); return; }
        if (target.closest("#copySubnetSummaryBtn")) { exportSubnetResults("summary"); return; }
        if (target.closest("#vlsmPresetBranch")) { loadVLSMPreset("branch"); return; }
        if (target.closest("#vlsmPresetVpc")) { loadVLSMPreset("vpc"); return; }
        if (target.closest("#exportPortCsvBtn")) { exportTableToCSV("portTableBody", "port_reference.csv"); return; }
        if (target.closest("#exportProtoCsvBtn")) { exportTableToCSV("protocolTableBody", "protocol_reference.csv"); return; }
        if (target.closest("#exportCidrCsvBtn")) { exportTableToCSV("cidrTableBody", "cidr_reference.csv"); return; }

        if (target.closest("#addSupernetRowBtn")) {
            const list = $("#supernetInputsList");
            if (list) {
                const div = document.createElement("div");
                div.className = "input-row";
                div.innerHTML = `
                    <input class="text-input mono supernet-input" type="text" value="192.168.4.0/24">
                    <button class="btn-icon danger remove-supernet-row" type="button"><i class="fa-solid fa-trash"></i></button>
                `;
                list.appendChild(div);
            }
            return;
        }
        if (target.closest(".remove-supernet-row")) {
            target.closest(".input-row")?.remove();
            return;
        }
        if (target.closest("#calcSupernetBtn")) { runSupernetCalculator(true); return; }

        if (target.closest("#calcRangeBtn")) { runRangeCalculator(true); return; }
        if (target.closest("#calcWildcardBtn")) { runWildcardCalculator(true); return; }
        if (target.closest("#calcClassifyBtn")) { runClassifier(true); return; }
        if (target.closest("#calcValidateBtn")) { runValidator(true); return; }
        if (target.closest("#calcConvertBtn")) { runIPConverter(true); return; }

        if (target.closest("#calcBinIpBtn")) {
            try {
                const bin = valueOf("binIpInput");
                const ip = binaryToIP(bin);
                setText("resBinIp", ip);
                toast("Binary converted to IPv4", "success");
            } catch (err) { toast(err.message, "error"); }
            return;
        }
        if (target.closest("#calcBinOctetBtn")) {
            try {
                const bin = valueOf("binOctetInput");
                const num = parseInt(bin, 2);
                if (isNaN(num) || num < 0 || num > 255) throw new Error("Enter an 8-bit binary string (00000000 - 11111111)");
                setText("resBinOctet", num);
                toast("Binary octet converted", "success");
            } catch (err) { toast(err.message, "error"); }
            return;
        }
        if (target.closest("#calcDecBtn")) { runDecimalConverter(true); return; }
        if (target.closest("#calcHexBtn")) { runHexConverter(true); return; }
        if (target.closest("#calcIntBtn")) { runIntegerConverter(true); return; }

        if (target.closest("#calcIpv6Btn")) { runIPv6Calculator(true); return; }
        if (target.closest("#expandIpv6Btn")) {
            try {
                const comp = valueOf("ipv6CompInput");
                const exp = expandIPv6(comp);
                setText("resIpv6Expanded", exp);
                toast("IPv6 expanded", "success");
            } catch (err) { toast(err.message, "error"); }
            return;
        }
        if (target.closest("#compressIpv6Btn")) {
            try {
                const exp = valueOf("ipv6ExpInput");
                const comp = compressIPv6(exp);
                setText("resIpv6Compressed", comp);
                toast("IPv6 compressed", "success");
            } catch (err) { toast(err.message, "error"); }
            return;
        }
        if (target.closest("#calcIpv6ValBtn")) { runIPv6Validator(true); return; }
        if (target.closest("#calcMacBtn")) { runMACTools(true); return; }
    });

    // 2. Input Listeners for Live Calculations
    const subnetIp = $("#subnetIp");
    const subnetPrefix = $("#subnetPrefix");
    if (subnetIp) subnetIp.oninput = () => runSubnetCalculator(false);
    if (subnetPrefix) subnetPrefix.oninput = () => runSubnetCalculator(false);

    const cidrInput = $("#cidrInput");
    if (cidrInput) cidrInput.oninput = () => runCIDRCalculator(false);

    const convertIpInput = $("#convertIpInput");
    if (convertIpInput) convertIpInput.oninput = () => runIPConverter(false);

    const validateIpInput = $("#validateIpInput");
    if (validateIpInput) validateIpInput.oninput = () => runValidator(false);

    const classifyInput = $("#classifyInput");
    if (classifyInput) classifyInput.oninput = () => runClassifier(false);

    const rangeStartIp = $("#rangeStartIp");
    const rangeEndIp = $("#rangeEndIp");
    if (rangeStartIp) rangeStartIp.oninput = () => runRangeCalculator(false);
    if (rangeEndIp) rangeEndIp.oninput = () => runRangeCalculator(false);

    const wildcardInput = $("#wildcardInput");
    if (wildcardInput) wildcardInput.oninput = () => runWildcardCalculator(false);

    const ipv6CalcInput = $("#ipv6CalcInput");
    if (ipv6CalcInput) ipv6CalcInput.oninput = () => runIPv6Calculator(false);

    const ipv6ValInput = $("#ipv6ValInput");
    if (ipv6ValInput) ipv6ValInput.oninput = () => runIPv6Validator(false);

    const macInput = $("#macInput");
    if (macInput) macInput.oninput = () => runMACTools(false);

    const binIpInput = $("#binIpInput");
    const binOctetInput = $("#binOctetInput");
    if (binIpInput) binIpInput.oninput = () => runBinaryConverter(false);
    if (binOctetInput) binOctetInput.oninput = () => runBinaryConverter(false);

    const ipv6CompInput = $("#ipv6CompInput");
    const ipv6ExpInput = $("#ipv6ExpInput");
    if (ipv6CompInput) ipv6CompInput.oninput = () => runIPv6CompressExpand(false);
    if (ipv6ExpInput) ipv6ExpInput.oninput = () => runIPv6CompressExpand(false);

    const decimalValInput = $("#decimalValInput");
    if (decimalValInput) decimalValInput.oninput = () => runDecimalConverter(false);

    const hexValInput = $("#hexValInput");
    if (hexValInput) hexValInput.oninput = () => runHexConverter(false);

    const intValInput = $("#intValInput");
    if (intValInput) intValInput.oninput = () => runIntegerConverter(false);

    const portTableSearch = $("#portTableSearch");
    if (portTableSearch) portTableSearch.oninput = (e) => renderPortTable(e.target.value);

    const protocolTableSearch = $("#protocolTableSearch");
    if (protocolTableSearch) protocolTableSearch.oninput = (e) => renderProtocolTable(e.target.value);

    const cidrTableSearch = $("#cidrTableSearch");
    if (cidrTableSearch) cidrTableSearch.oninput = (e) => renderCIDRReferenceTable(e.target.value);

    const modalSearchInput = $("#modalSearchInput");
    if (modalSearchInput) modalSearchInput.oninput = (e) => renderSearchModal(e.target.value);

    // Sidebar Live Filter
    const toolSearch = $("#toolSearch");
    if (toolSearch) {
        toolSearch.oninput = (e) => {
            const query = e.target.value.toLowerCase().trim();
            qsa(".sidebar .nav-item").forEach(item => {
                const label = item.querySelector(".nav-label");
                const text = label ? label.textContent.toLowerCase() : "";
                if (!query || text.includes(query)) {
                    item.style.display = "flex";
                } else {
                    item.style.display = "none";
                }
            });
        };
    }

    // 3. Keyboard Shortcuts
    document.addEventListener("keydown", e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            openModal("searchModal");
            const input = $("#modalSearchInput");
            if (input) { input.value = ""; input.focus(); renderSearchModal(""); }
        }
        if (e.key === "Escape") {
            closeAllModals();
            const sidebar = $("#sidebar");
            if (sidebar) sidebar.classList.remove("mobile-open");
        }
        if (e.key === "Enter" && document.activeElement && document.activeElement.tagName === "INPUT") {
            const activePage = qs(".page.active");
            if (activePage) {
                const pageId = activePage.id.replace("page-", "");
                updatePageContent(pageId);
            }
        }
    });
}

function initApp() {
    initTheme();
    initEvents();
    initReferenceTables();

    navigateTo("dashboard");
    calculateAllDefaults();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

// Global API export
window.NetForge = {
    isValidIPv4,
    isValidIPv6,
    ipToInteger,
    integerToIP,
    ipToBinary,
    binaryToIP,
    cidrToMask,
    maskToCIDR,
    calculateSubnet,
    calculateVLSM,
    navigateTo,
    copyToClipboard
};