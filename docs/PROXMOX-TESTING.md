# Installer Guyub10 untuk pengujian LAN di Proxmox

Entry point: `deploy/proxmox/install.sh`, dijalankan dari Shell Proxmox sebagai root. Installer ini disiapkan berdasarkan Proxmox 9.1.5 pada node inkamlab, storage dir HDD2TB di /mnt/pve/HDD2TB, bridge vmbr0, dan template Debian 12.12-1 yang sudah tersedia.

## Perilaku

- Membaca ID kosong dari cluster dan membuat LXC unprivileged baru. Tidak menghapus, menggunakan ulang, atau mengonfigurasi guest yang sudah ada. Menjalankannya lagi membuat guest tambahan, bukan melakukan update.
- Memastikan storage mendukung rootdir, berstatus aktif, dan benar-benar mounted. Memerlukan minimal RAM host tersedia 2048 MB dan storage kosong 20 GB sebelum memulai.
- Guest menggunakan disk 16 GB, satu vCPU, RAM 1536 MB/swap 1024 MB selama instalasi. Setelah build selesai: RAM 1024 MB/swap 512 MB.
- Jaringan DHCP pada vmbr0. Jika DHCP/DNS tidak tersedia, installer berhenti; tidak mengubah router atau jaringan host.
- Source dipin ke commit aplikasi yang telah diuji. Node 24.22.0 diunduh melalui HTTPS dari nodejs.org dan diperiksa terhadap SHASUMS256.txt resminya. Verifikasi TLS/checksum tidak dinonaktifkan.
- Dependensi dipasang dengan npm ci. Tes, lint kode lokal, dan build webpack satu worker dijalankan sebagai user service guyub10, bukan root.
- Systemd menjalankan aplikasi pada port 3000 di guest untuk akses LAN. Container diatur auto-start hanya setelah pemeriksaan berhasil. Tidak membuat reverse proxy, DNS, port forwarding, koneksi Supabase, atau layanan perangkat nyata.
- Data sintetis disimpan di /var/lib/guyub10/data; source di /opt/guyub10. Akun demo rw@guyub.test / Guyub10-Lokal! hanya untuk pengujian. Jangan membuka port ini ke Internet atau memasukkan data warga nyata.
- Pemeriksaan akhir meliputi homepage 200, API lama 410, data warga anonim 401, keberadaan file data, dan restart service.

## Kegagalan dan log

Log host: /root/guyub10-install-<ID>.log. Jika gagal setelah guest dibuat, installer menghentikan guest tersebut tetapi tidak menghapusnya. Tinjau log sebelum mencoba ulang untuk menghindari guest uji tambahan. Tidak ada janji bebas error: jaringan, storage, resource dan konfigurasi DHCP mesin pengguna belum dapat diuji langsung dari sesi ini.

## Validasi yang telah dilakukan

Sintaks host dan skrip guest yang tertanam diperiksa dengan bash -n dan ShellCheck. Build aplikasi dengan GUYUB_BUILD_CPUS=1, NODE_OPTIONS=--max-old-space-size=1024 dan npm run build -- --webpack berhasil di cloud. Download source GitHub publik telah diuji tanpa token. Instalasi pct/apt/systemd pada Proxmox pengguna belum dijalankan atau diverifikasi karena tidak ada akses langsung ke host.

## GitHub

Source diunduh dari GitHub agar instalasi satu langkah tidak memerlukan upload ZIP. Tidak ada token atau deploy key yang diminta. Ini bukan sinkronisasi Git/CI/CD otomatis. Koneksi pengembangan dan mekanisme update GitHub dapat disiapkan setelah instalasi berhasil.
