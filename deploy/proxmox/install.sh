#!/usr/bin/env bash
# Run on the Proxmox host as root. Creates a NEW Debian LXC; never reuses guests.
set -Eeuo pipefail
umask 077
SOURCE_COMMIT='e6f777c3f3d1cc983d210b821de18a2c12f99a8d'
NODE_VERSION='v24.22.0'
STORAGE='HDD2TB'
TEMPLATE='local:vztmpl/debian-12-standard_12.12-1_amd64.tar.zst'
CTID=''
CREATED=0
WORKDIR=''
cleanup() {
  local result=$?
  trap - EXIT
  if (( result != 0 )); then
    printf '\nINSTALASI DIHENTIKAN (exit %s).\n' "$result" >&2
    if (( CREATED == 1 )); then
      pct stop "$CTID" >/dev/null 2>&1 || true
      printf 'LXC baru %s dihentikan, tidak dihapus. Container lain tidak diubah.\n' "$CTID" >&2
      printf 'Periksa log: /root/guyub10-install-%s.log\n' "$CTID" >&2
    fi
  fi
  if [[ -n "$WORKDIR" && -d "$WORKDIR" ]]; then rm -rf -- "$WORKDIR"; fi
  exit "$result"
}
trap cleanup EXIT
trap 'printf "Gagal pada baris %s.\n" "$LINENO" >&2' ERR
fail() { printf 'STOP: %s\n' "$*" >&2; exit 1; }
[[ $EUID -eq 0 ]] || fail 'Jalankan dari Shell Proxmox sebagai root.'
for tool in pct qm pvesh pvesm curl python3 sha256sum mountpoint awk tee; do
  command -v "$tool" >/dev/null || fail "Perintah $tool tidak tersedia pada host."
done
[[ $(uname -m) == x86_64 ]] || fail 'Skrip ini memerlukan host x86_64.'
WORKDIR=$(mktemp -d /tmp/guyub10-install.XXXXXXXX)
printf '[1/7] Memeriksa storage, template, resource, dan source...\n'
pvesh get "/storage/$STORAGE" --output-format json > "$WORKDIR/storage.json"
STORAGE_PATH=$(python3 - "$WORKDIR/storage.json" <<'PY'
import json,sys
s=json.load(open(sys.argv[1]))
assert s.get('type')=='dir', 'Storage harus bertipe dir'
assert 'rootdir' in s.get('content','').split(','), 'Storage tidak mendukung rootdir'
assert s.get('path'), 'Lokasi storage kosong'
print(s['path'])
PY
)
mountpoint -q "$STORAGE_PATH" || fail "Storage $STORAGE_PATH tidak ter-mount; tidak membuat disk pada filesystem host."
pvesm status --content rootdir | awk -v storage="$STORAGE" '$1==storage && $3=="active" {ok=1} END {exit !ok}' || fail 'Storage HDD2TB tidak aktif.'
AVAILABLE_MB=$(awk '/^MemAvailable:/ {print int($2/1024)}' /proc/meminfo)
(( AVAILABLE_MB >= 2048 )) || fail "RAM tersedia hanya ${AVAILABLE_MB} MB. Diperlukan 2048 MB tersedia sebelum instalasi; hentikan sementara guest yang tidak diperlukan lalu jalankan ulang."
FREE_DISK_MB=$(df -Pm "$STORAGE_PATH" | awk 'NR==2 {print $4}')
(( FREE_DISK_MB >= 20480 )) || fail 'Storage membutuhkan ruang kosong minimal 20 GB.'
TEMPLATE_PATH=$(pvesm path "$TEMPLATE")
[[ -r "$TEMPLATE_PATH" ]] || fail "Template $TEMPLATE belum tersedia."
CTID=$(pvesh get /cluster/nextid --output-format json | python3 -c 'import json,sys; value=json.load(sys.stdin); text=str(value); assert text.isdecimal(); print(text)')
[[ "$CTID" =~ ^[1-9][0-9]*$ ]] || fail 'Tidak mendapatkan ID guest yang valid.'
# BEGIN GUEST_ID_SELECTION
while [[ -e "/var/lib/lxc/$CTID" || -L "/var/lib/lxc/$CTID" || -e "$STORAGE_PATH/images/$CTID" || -e "/root/guyub10-install-${CTID}.log" ]] || pct status "$CTID" >/dev/null 2>&1 || qm status "$CTID" >/dev/null 2>&1; do
  printf 'Melewati ID %s: ada konfigurasi, direktori, disk, atau log sebelumnya.\n' "$CTID"
  CTID=$((CTID + 1))
  (( CTID <= 999999999 )) || fail 'Tidak menemukan ID guest kosong.'
done
# END GUEST_ID_SELECTION
SOURCE_URL="https://github.com/Edwinmohamad/Guyub10/archive/${SOURCE_COMMIT}.zip"
curl --proto '=https' --tlsv1.2 -fL --retry 3 --connect-timeout 20 --max-time 180 "$SOURCE_URL" -o "$WORKDIR/source.zip"
python3 - "$WORKDIR/source.zip" <<'PY'
import sys,zipfile
from pathlib import PurePosixPath
with zipfile.ZipFile(sys.argv[1]) as z:
 assert z.testzip() is None, 'Arsip source rusak'
 roots=set()
 for n in z.namelist():
  p=PurePosixPath(n)
  assert not p.is_absolute() and '..' not in p.parts, 'Path arsip tidak aman'
  roots.add(p.parts[0])
 assert len(roots)==1, 'Struktur arsip tidak sesuai'
 root=next(iter(roots))
 assert root+'/package-lock.json' in z.namelist(), 'Lockfile tidak ditemukan'
 assert root+'/src/lib/local/store.ts' in z.namelist(), 'Source simulator tidak sesuai'
PY
SOURCE_SHA256=$(sha256sum "$WORKDIR/source.zip" | awk '{print $1}')
LOG="/root/guyub10-install-${CTID}.log"
[[ ! -e "$LOG" ]] || fail "File log $LOG sudah ada; simpan log tersebut sebelum mencoba kembali."
exec > >(tee "$LOG") 2>&1
printf '[2/7] Membuat LXC baru %s, tanpa mengubah guest lain...\n' "$CTID"
# BEGIN GUEST_CREATION
# The mapped extraction uid must traverse pct-created directories. Keep the
# private host umask, but do NOT pass it to pct's directory creation.
(
  umask 022
  pct create "$CTID" "$TEMPLATE" --hostname "guyub10-test-${CTID}" --ostype debian --rootfs "${STORAGE}:16" --cores 1 --memory 1536 --swap 1024 --net0 name=eth0,bridge=vmbr0,ip=dhcp --unprivileged 1 --onboot 0
)
# END GUEST_CREATION
CREATED=1
pct start "$CTID"
printf '[3/7] Menunggu jaringan DHCP di dalam LXC...\n'
GUEST_IP=''
for _attempt in $(seq 1 45); do
  GUEST_IP=$(pct exec "$CTID" -- bash -c "ip -o -4 addr show dev eth0 scope global | awk '{print \$4}' | cut -d/ -f1" 2>/dev/null || true)
  if [[ "$GUEST_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] && pct exec "$CTID" -- getent ahostsv4 deb.debian.org >/dev/null 2>&1; then break; fi
  GUEST_IP=''
  sleep 2
done
[[ -n "$GUEST_IP" ]] || fail 'DHCP atau DNS guest belum tersedia. Periksa jaringan vmbr0/router; tidak mengubah konfigurasi jaringan host.'
pct push "$CTID" "$WORKDIR/source.zip" /tmp/guyub10-source.zip
printf '[4/7] Memasang Node terverifikasi dan dependensi aplikasi di LXC...\n'
pct exec "$CTID" -- env NODE_VERSION="$NODE_VERSION" SOURCE_SHA256="$SOURCE_SHA256" bash -s <<'GUEST'
set -Eeuo pipefail
umask 022
trap 'printf "Langkah di dalam LXC gagal pada baris %s.\n" "$LINENO" >&2' ERR
export DEBIAN_FRONTEND=noninteractive
apt-get -o Acquire::Retries=3 update
apt-get -o Acquire::Retries=3 install -y --no-install-recommends ca-certificates curl xz-utils unzip python3 libstdc++6 libatomic1
printf '%s  %s\n' "$SOURCE_SHA256" /tmp/guyub10-source.zip | sha256sum -c -
NODE_ARCHIVE="node-${NODE_VERSION}-linux-x64.tar.xz"
mkdir -p /tmp/guyub10-node
cd /tmp/guyub10-node
curl --proto '=https' --tlsv1.2 -fL --retry 3 --connect-timeout 20 --max-time 300 "https://nodejs.org/dist/${NODE_VERSION}/${NODE_ARCHIVE}" -o "$NODE_ARCHIVE"
curl --proto '=https' --tlsv1.2 -fL --retry 3 --connect-timeout 20 --max-time 120 "https://nodejs.org/dist/${NODE_VERSION}/SHASUMS256.txt" -o SHASUMS256.txt
awk -v archive="$NODE_ARCHIVE" '$2==archive {print}' SHASUMS256.txt > node.sha256
[[ -s node.sha256 ]]
sha256sum -c node.sha256
tar -xJf "$NODE_ARCHIVE" -C /opt
NODE_DIR="/opt/node-${NODE_VERSION}-linux-x64"
for command in node npm npx; do ln -s "$NODE_DIR/bin/$command" "/usr/local/bin/$command"; done
node --version
[[ $(node -p 'process.versions.node.split(".")[0]') == 24 ]]
useradd --system --create-home --home-dir /var/lib/guyub10 --shell /usr/sbin/nologin guyub10
chmod 700 /var/lib/guyub10
mkdir -p /opt/guyub10 /tmp/guyub10-source
unzip -q /tmp/guyub10-source.zip -d /tmp/guyub10-source
SOURCE_DIR=$(find /tmp/guyub10-source -mindepth 1 -maxdepth 1 -type d)
[[ -f "$SOURCE_DIR/package-lock.json" ]]
cp -a "$SOURCE_DIR/." /opt/guyub10/
chown -R guyub10:guyub10 /opt/guyub10
cd /opt/guyub10
runuser -u guyub10 -- npm ci --cache /var/lib/guyub10/npm-cache --no-audit --no-fund
printf '[5/7] Menjalankan tes dan build satu worker; proses ini dapat memakan beberapa menit...\n'
runuser -u guyub10 -- npm test
runuser -u guyub10 -- npm run lint:local
runuser -u guyub10 -- env GUYUB_BUILD_CPUS=1 NODE_OPTIONS=--max-old-space-size=1024 NEXT_TELEMETRY_DISABLED=1 npm run build -- --webpack
cat > /etc/systemd/system/guyub10-test.service <<UNIT
[Unit]
Description=Guyub10 LAN testing without Supabase
After=network.target
[Service]
Type=simple
User=guyub10
Group=guyub10
WorkingDirectory=/opt/guyub10
Environment=NODE_ENV=production
Environment=NEXT_TELEMETRY_DISABLED=1
Environment=GUYUB_LOCAL_DATA_DIR=/var/lib/guyub10/data
ExecStart=${NODE_DIR}/bin/node /opt/guyub10/node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port 3000
Restart=on-failure
RestartSec=5
StateDirectory=guyub10
StateDirectoryMode=0700
UMask=0077
NoNewPrivileges=true
[Install]
WantedBy=multi-user.target
UNIT
systemd-analyze verify /etc/systemd/system/guyub10-test.service
systemctl daemon-reload
systemctl enable guyub10-test
rm -rf /tmp/guyub10-node /tmp/guyub10-source /tmp/guyub10-source.zip
GUEST
printf '[6/7] Mengatur RAM runtime 1 GB dan menjalankan layanan...\n'
pct set "$CTID" --memory 1024 --swap 512
pct exec "$CTID" -- systemctl start guyub10-test
READY=0
for _attempt in $(seq 1 30); do
  HTTP_STATUS=$(pct exec "$CTID" -- curl -sS --max-time 5 -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ 2>/dev/null || true)
  if [[ "$HTTP_STATUS" == 200 ]]; then READY=1; break; fi
  sleep 2
done
if (( READY != 1 )); then
  pct exec "$CTID" -- journalctl -u guyub10-test -n 50 --no-pager || true
  fail 'Layanan belum memberikan respons HTTP 200.'
fi
pct exec "$CTID" -- bash -s <<'CHECK'
set -euo pipefail
[[ $(curl -sS --max-time 15 -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/api/setup-akun) == 410 ]]
[[ $(curl -sS --max-time 15 -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/api/local/residents) == 401 ]]
test -s /var/lib/guyub10/data/database.json
systemctl restart guyub10-test
for _attempt in $(seq 1 15); do
  if curl -fsS --max-time 5 http://127.0.0.1:3000/api/local/public -o /dev/null; then exit 0; fi
  sleep 2
done
exit 1
CHECK
pct set "$CTID" --onboot 1
printf '[7/7] SELESAI.\nLXC: %s\nBuka dari LAN: http://%s:3000\nLogin: rw@guyub.test\nPassword demo: Guyub10-Lokal!\nLog instalasi: %s\n' "$CTID" "$GUEST_IP" "$LOG"
printf 'Tanpa Supabase. Jangan port-forward ke Internet. Akun ini hanya untuk pengujian.\n'
printf 'Untuk masuk console: pct enter %s\n' "$CTID"
printf 'Menjalankan skrip lagi akan membuat LXC baru, bukan memperbarui instalasi ini.\n'
