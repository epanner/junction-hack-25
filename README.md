
# ⚡ ChargeID — Your AI Passport to the Grid  
### **AI-Optimized EV Charging with Decentralized Identity — secured by Solana**

> Built in 48 hours at **Junction 2025** by Khai Minh Mai, Mai Phan, Tuan Kiet, and Elias Panner.  
> “Plug in, power up, glide on.”

---

## 🚗 Problem: EV Charging is Still a Mess  
Today’s EV charging ecosystem is fundamentally fragmented:

- **238+ charging providers in Europe** with incompatible systems  
- **7 different charging types** with varying plugs, speeds, and pricing  
- **3.5M charging points expected by 2030** → even more chaos coming  

And yet:

- Chargers don’t know who the driver or vehicle is  
- Vehicles can’t express real needs (battery, schedule, grid constraints)  
- No transparency about pricing, speed, or prioritization  
- Workplaces, fleets, and semi-public locations remain completely **unsmart**  
- No negotiation between driver ⇄ vehicle ⇄ charger

---

## ✅ Solution: ChargeID  
**ChargeID** is a universal smart-charging layer that connects **driver, vehicle, and charger** through secure decentralized identities — while an AI agent negotiates the best charging option in real time.  

From the slides:

- Smart EV Charging Across All Vendors  
- Full Transparency  
- AI-powered Negotiation & Optimization  
- Secure DID-based information exchange (Solana)

---

## 🔐 How It Works  
### 1. **DID-Based Authentication (Solana)**  
Driver, vehicle, and charger instantly authenticate:  
- No apps  
- No RFID cards  
- No accounts  
- No manual steps  
Just **secure decentralized IDs**.

### 2. **AI-Negotiated Charging**  
An optimization agent (Meta Llama 3.1 8B Instruct) balances:  
- Price  
- Speed  
- Distance  
- Grid conditions  
- Driver’s schedule  

This results in the **best possible charging plan** — displayed with full transparency.

### 3. **Real-Time Charging Intelligence**  
- Live price / speed comparisons  
- Recommended station match percentage  
- Charging speed, time remaining, and costs  
- Future roadmap: anomaly detection, demand forecasting, operator dashboards

---

## 📱 App Flow
1. Driver sets **target battery** & **ready-by time**  
2. Driver selects priority: **Cheapest / Fastest / Balanced**  
3. AI negotiates with station operators  
4. Best match found (with match score)  
5. Charging session overview  
6. Real-time charging metrics  

---

## 🧠 Architecture  
```
Driver ⇄ Vehicle ⇄ Charger
        ↓        ↓
   Solana DIDs & Audit Trails
        ↓
   Meta Llama 3.1 8B (Optimization)
        ↓
    Charging APIs (public + private)
        ↓
        UI Dashboard (Figma Make)
```

---

## 🛠 Tech Stack

### **Backend / Optimization**
- **TypeScript**
- **Meta Llama 3.1 8B Instruct** (local optimization agent)
- **Solana** (DID + audit trails)
- Charger APIs (data collection / negotiation logic)

### **Frontend**
- **Figma Make** (for fast UI prototyping)
- **Cursor** (AI-assisted code generation)

---

## 🚀 Features

### ✔ Universal Charging Discovery  
Works **across all providers** — not locked to any ecosystem.

### ✔ AI-Optimized Charging Plans  
Personalized optimization based on driver preferences & constraints.

### ✔ Fully Transparent  
Breakdown of:  
- Original station price  
- Negotiated price  
- Expected savings  
- Charging time  
- Match percentage

### ✔ Secure, Private, Decentralized  
Authentication flow entirely powered by Solana DID.

### ✔ Operator Insights (Up Next)  
- Real-time anomaly detection  
- Dynamic demand forecasting  
- Usage analytics

---

## 👥 Team  
- **Khai** – Hochschule Bonn-Rhein-Sieg  
- **Mai** – TU Darmstadt  
- **Tuan** – University of Cologne  
- **Elias** – TU Wien  

---

## 📄 License  
MIT
