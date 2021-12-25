# 3cx-tools

Collection of several tools for 3CX.

## Related projects

* 3cx REST API: https://github.com/adroste/3cx-api


# Tools / Features

## 3cx-tools-server

Features:
* automatic phonebook generation - generates IP phone compatible phonebooks including multiple saved phone numbers
  * supported manufacturers (yet): yealink, fanvil, snom
  * *Background: 3CX only generates phonebooks including the 'mobile' number*
* automatic install of realtime call overview panel

---

## Webclient Realtime Call Overview Panel

This is a plugin for the official webclient. 

Features:
* self-updating call history
* show the call chain
* show all active calls
* 3cx phonebook integration (caller name resolving, add new contact, edit existing contact)
* call integration (make call via button from history)

Supports internationalization. Included languages:
* English 🇺🇸🇬🇧
* German / Deutsch 🇩🇪

Tested on: v18.0.2.307

![](./webclient-realtime-call-overview-panel/screenshot-webclient.png)


# Installation

### 1. Install nodejs v16 on the 3CX machine:

```bash
curl -sSL https://deb.nodesource.com/setup_16.x | sudo bash -
sudo apt install -y nodejs
```

Verify that it's working with `node --version`.

### 2. Install git

```bash
sudo apt install -y git
```

### 3. Clone the repo and jump into the cloned dir

```bash
git clone https://github.com/adroste/3cx-tools.git
cd 3cx-tools
```

### 4. Install dependencies

```bash
npm install --only=production
```

### 5. Install the service

```bash
sudo chown root .
sudo npm run start -- install
```

# Development hints

Forward your 3CX ports to your dev machine, e.g. using ssh:
```bash
ssh -L 5432:127.0.0.1:5432 \
  -L 5000:127.0.0.1:5000 \
  -L 5001:127.0.0.1:5001 \
  root@my3cxInstance
```
Ports:
* 5432 Postgres
* 5000 Http Backend
* 5001 Https Backend