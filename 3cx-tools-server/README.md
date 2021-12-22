# 3cx-tools-helper

## Installation

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

### 3. Clone the repo and jump into the 3cx-tools-server dir

```bash
git clone https://github.com/adroste/3cx-tools.git
cd 3cx-tools/3cx-tools-server/
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