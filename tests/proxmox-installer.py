"""Regression checks for host-side permission and orphan-directory failures.
No Proxmox commands, mount, root access, or guest installation are performed.
"""
import pathlib
import subprocess
import tempfile
import unittest

SOURCE = (pathlib.Path(__file__).resolve().parents[1] / 'deploy/proxmox/install.sh').read_text()

def block(name):
    return SOURCE.split('# BEGIN ' + name + '\n', 1)[1].split('# END ' + name, 1)[0]

class InstallerChecks(unittest.TestCase):
    def test_orphan_directories_and_existing_guests_are_preserved(self):
        with tempfile.TemporaryDirectory(prefix='guyub-proxmox-test-') as directory:
            root = pathlib.Path(directory)
            (root / 'lxc/104/rootfs').mkdir(parents=True)
            (root / 'storage/images/106').mkdir(parents=True)
            (root / 'lxc/104/rootfs/keep').write_text('preserve')
            script = block('GUEST_ID_SELECTION').replace('/var/lib/lxc/', str(root / 'lxc') + '/').replace('/root/guyub10-install-', str(root / 'log-'))
            result = subprocess.run(['bash', '-c', '''set -euo pipefail
CTID=104
STORAGE_PATH="$1/storage"
pct() { [[ "$1" == status && "$2" == 105 ]]; }
qm() { return 1; }
fail() { exit 1; }
''' + script + '\nprintf "SELECTED=%s\\n" "$CTID"', 'test', directory], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn('SELECTED=107', result.stdout)
            self.assertEqual((root / 'lxc/104/rootfs/keep').read_text(), 'preserve')

    def test_creation_is_traversable_without_weakening_host_umask(self):
        with tempfile.TemporaryDirectory(prefix='guyub-proxmox-test-') as directory:
            script = '''set -euo pipefail
umask 077
CTID=107
TEMPLATE=test
STORAGE=HDD2TB
TEST_ROOT="$1"
pct() { [[ "$1" == create ]]; mkdir -p "$TEST_ROOT/guest/rootfs"; }
''' + block('GUEST_CREATION') + '''
[[ $(stat -c %a "$TEST_ROOT/guest") == 755 ]]
[[ $(stat -c %a "$TEST_ROOT/guest/rootfs") == 755 ]]
[[ $(umask) == 0077 ]]
'''
            result = subprocess.run(['bash', '-c', script, 'test', directory], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)

    def test_guest_setup_explicitly_uses_standard_umask(self):
        guest = SOURCE.split("<<'GUEST'\n", 1)[1].split('\nGUEST\n', 1)[0]
        self.assertIn('set -Eeuo pipefail\numask 022\n', guest)

if __name__ == '__main__':
    unittest.main()
