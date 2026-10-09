from pathlib import Path
import base64
import os
import re
import runpy
import shutil
import subprocess
import tarfile
import tempfile
import urllib.request

# Start from the stable v5.5 app: exact Tiko, working cloud fallback, clean UI.
runpy.run_path('android-app/prepare_v55.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'
RIVE_PROJECT = ROOT / 'tiko-rive'
RIVE_CLI = Path(os.environ.get('RIVE_CLI', '/tmp/rive'))

if not RIVE_CLI.exists():
    raise SystemExit(f'Rive CLI not found at {RIVE_CLI}')

# Extract the exact approved Tiko artwork already embedded in tiko-original.svg.
svg = (ASSETS / 'tiko-original.svg').read_text(encoding='utf-8')
m = re.search(r'data:image/webp;base64,([^\"\']+)', svg)
if not m:
    raise SystemExit('Embedded original Tiko WebP not found')
(RIVE_PROJECT / 'tiko.webp').write_bytes(base64.b64decode(m.group(1)))

# Compile the real Rive file. The .riv contains the exact Tiko image plus a Rive state machine:
# mode 0 idle, 1 thinking, 2 talking, 3 happy; blink runs independently.
subprocess.run([str(RIVE_CLI), str(RIVE_PROJECT), '--once'], check=True)
riv_path = RIVE_PROJECT / 'build/tiko.riv'
if not riv_path.exists() or riv_path.stat().st_size < 1000:
    raise SystemExit('Tiko Rive build did not produce a valid .riv file')
shutil.copy2(riv_path, ASSETS / 'tiko.riv')

# Embed the .riv bytes in JS so Android WebView never needs to fetch a file:// resource.
riv_b64 = base64.b64encode(riv_path.read_bytes()).decode('ascii')
(ASSETS / 'tiko-riv-data.js').write_text(
    "window.TIKO_RIV_BASE64='" + riv_b64 + "';\n",
    encoding='utf-8'
)

# Bundle Rive Canvas Single locally. Its WASM is inline, so Tiko also works without a CDN.
RUNTIME_VERSION = '2.44.1'
RUNTIME_URL = f'https://registry.npmjs.org/@rive-app/canvas-single/-/canvas-single-{RUNTIME_VERSION}.tgz'
with tempfile.TemporaryDirectory() as td:
    td = Path(td)
    tgz = td / 'rive-canvas-single.tgz'
    urllib.request.urlretrieve(RUNTIME_URL, tgz)
    with tarfile.open(tgz, 'r:gz') as tf:
        member = tf.getmember('package/rive.js')
        src = tf.extractfile(member)
        if src is None:
            raise SystemExit('Rive web runtime missing rive.js')
        (ASSETS / 'rive.js').write_bytes(src.read())

# v5.6 replaces the temporary DOM facial-overlay controller from v5.5.
index = ASSETS / 'index.html'
h = index.read_text(encoding='utf-8')
h = h.replace('<link rel="stylesheet" href="v55.css">', '')
h = h.replace('<script src="v55.js"></script>', '')
if '<link rel="stylesheet" href="v56.css">' not in h:
    h = h.replace('</head>', '<link rel="stylesheet" href="v56.css"></head>')
for script in ['rive.js', 'tiko-riv-data.js', 'v56.js']:
    tag = f'<script src="{script}"></script>'
    if tag not in h:
        h = h.replace('</body>', tag + '</body>')
index.write_text(h, encoding='utf-8')

# Version metadata.
main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/5.5','PratikoAIAndroid/5.6').replace('android-5.5','android-5.6')
main.write_text(s, encoding='utf-8')

appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8').replace("version:'5.5'", "version:'5.6'")
appjs.write_text(a, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 22','versionCode 23').replace("versionName '5.5.0'", "versionName '5.6.0'")
gradle.write_text(g, encoding='utf-8')

print(f'Pratiko AI v5.6 prepared with Rive {RUNTIME_VERSION}; tiko.riv={riv_path.stat().st_size} bytes')
