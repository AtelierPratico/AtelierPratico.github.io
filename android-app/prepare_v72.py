from pathlib import Path
import base64
import os
import re
import runpy
import shutil
import subprocess

# Start from the full v7.1 product: AI, images, voice, premium UI and segmented Rive Tiko.
runpy.run_path('android-app/prepare_v71.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'
RIVE_PROJECT = ROOT / 'tiko-rive'
RIVE_CLI = Path(os.environ.get('RIVE_CLI', '/tmp/rive'))

if not RIVE_CLI.exists():
    raise SystemExit(f'Rive CLI not found at {RIVE_CLI}')

scene_path = RIVE_PROJECT / 'scene.rml'
scene = scene_path.read_text(encoding='utf-8')


def replace_animation(name: str, block: str):
    global scene
    pattern = rf'<LinearAnimation\b[^>]*\bname="{re.escape(name)}"[^>]*>.*?</LinearAnimation>'
    scene, count = re.subn(pattern, block.strip(), scene, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f'v7.2 could not replace Rive animation: {name}')


# The segmented rig IDs created by prepare_v58.py are:
# 0:10 body, 0:30 pointing arm/hand, 0:31 head, 0:32 lower jaw.
# v7.2 deliberately makes those independent motions visible rather than merely bobbing the whole mascot.

replace_animation('Idle', r'''
<LinearAnimation fps="60" duration="240" loopValue="loop" name="Idle" id="0:70">
    <KeyedObject objectId="0:10">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="178.8" frame="72"/><KeyFrameDouble value="179.5" frame="156"/><KeyFrameDouble value="180" frame="240"/></KeyedProperty>
        <KeyedProperty propertyKey="17"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.005" frame="72"/><KeyFrameDouble value="1.002" frame="156"/><KeyFrameDouble value="1" frame="240"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:30">
        <KeyedProperty propertyKey="13"><KeyFrameDouble value="111" frame="0"/><KeyFrameDouble value="113.2" frame="58"/><KeyFrameDouble value="109.5" frame="132"/><KeyFrameDouble value="112" frame="196"/><KeyFrameDouble value="111" frame="240"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="177.6" frame="58"/><KeyFrameDouble value="180.8" frame="132"/><KeyFrameDouble value="178.6" frame="196"/><KeyFrameDouble value="180" frame="240"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0.030" frame="58"/><KeyFrameDouble value="-0.020" frame="132"/><KeyFrameDouble value="0.016" frame="196"/><KeyFrameDouble value="0" frame="240"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:31">
        <KeyedProperty propertyKey="13"><KeyFrameDouble value="111" frame="0"/><KeyFrameDouble value="108.5" frame="78"/><KeyFrameDouble value="113.5" frame="154"/><KeyFrameDouble value="110" frame="205"/><KeyFrameDouble value="111" frame="240"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="177.5" frame="78"/><KeyFrameDouble value="179" frame="154"/><KeyFrameDouble value="178.3" frame="205"/><KeyFrameDouble value="180" frame="240"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.008" frame="0"/><KeyFrameDouble value="0.026" frame="78"/><KeyFrameDouble value="-0.022" frame="154"/><KeyFrameDouble value="0.012" frame="205"/><KeyFrameDouble value="-0.008" frame="240"/></KeyedProperty>
        <KeyedProperty propertyKey="16"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="0.975" frame="78"/><KeyFrameDouble value="1.018" frame="154"/><KeyFrameDouble value="0.988" frame="205"/><KeyFrameDouble value="1" frame="240"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:32">
        <KeyedProperty propertyKey="13"><KeyFrameDouble value="111" frame="0"/><KeyFrameDouble value="108.5" frame="78"/><KeyFrameDouble value="113.5" frame="154"/><KeyFrameDouble value="110" frame="205"/><KeyFrameDouble value="111" frame="240"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="177.5" frame="78"/><KeyFrameDouble value="179" frame="154"/><KeyFrameDouble value="178.3" frame="205"/><KeyFrameDouble value="180" frame="240"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.008" frame="0"/><KeyFrameDouble value="0.026" frame="78"/><KeyFrameDouble value="-0.022" frame="154"/><KeyFrameDouble value="0.012" frame="205"/><KeyFrameDouble value="-0.008" frame="240"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:22"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="240"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:23"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="240"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:24"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="240"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:25"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="240"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:26"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="240"/></KeyedProperty></KeyedObject>
</LinearAnimation>
''')

replace_animation('Thinking', r'''
<LinearAnimation fps="60" duration="130" loopValue="pingPong" name="Thinking" id="0:71">
    <KeyedObject objectId="0:10">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="179" frame="65"/><KeyFrameDouble value="180" frame="130"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:30">
        <KeyedProperty propertyKey="13"><KeyFrameDouble value="111" frame="0"/><KeyFrameDouble value="106.5" frame="65"/><KeyFrameDouble value="111" frame="130"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="183.2" frame="65"/><KeyFrameDouble value="180" frame="130"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="0.012" frame="0"/><KeyFrameDouble value="-0.065" frame="65"/><KeyFrameDouble value="0.012" frame="130"/></KeyedProperty>
        <KeyedProperty propertyKey="16"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="0.975" frame="65"/><KeyFrameDouble value="1" frame="130"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:31">
        <KeyedProperty propertyKey="13"><KeyFrameDouble value="111" frame="0"/><KeyFrameDouble value="105.5" frame="65"/><KeyFrameDouble value="111" frame="130"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="179.5" frame="0"/><KeyFrameDouble value="175" frame="65"/><KeyFrameDouble value="179.5" frame="130"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.025" frame="0"/><KeyFrameDouble value="-0.078" frame="65"/><KeyFrameDouble value="-0.025" frame="130"/></KeyedProperty>
        <KeyedProperty propertyKey="16"><KeyFrameDouble value="0.99" frame="0"/><KeyFrameDouble value="0.94" frame="65"/><KeyFrameDouble value="0.99" frame="130"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:32">
        <KeyedProperty propertyKey="13"><KeyFrameDouble value="111" frame="0"/><KeyFrameDouble value="105.5" frame="65"/><KeyFrameDouble value="111" frame="130"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="179.5" frame="0"/><KeyFrameDouble value="176.2" frame="65"/><KeyFrameDouble value="179.5" frame="130"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.025" frame="0"/><KeyFrameDouble value="-0.078" frame="65"/><KeyFrameDouble value="-0.025" frame="130"/></KeyedProperty>
        <KeyedProperty propertyKey="16"><KeyFrameDouble value="0.99" frame="0"/><KeyFrameDouble value="0.94" frame="65"/><KeyFrameDouble value="0.99" frame="130"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:22"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0.55" frame="0"/><KeyFrameDouble value="0.78" frame="65"/><KeyFrameDouble value="0.55" frame="130"/></KeyedProperty><KeyedProperty propertyKey="14"><KeyFrameDouble value="158.5" frame="0"/><KeyFrameDouble value="156" frame="65"/><KeyFrameDouble value="158.5" frame="130"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:23"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0.55" frame="0"/><KeyFrameDouble value="0.78" frame="65"/><KeyFrameDouble value="0.55" frame="130"/></KeyedProperty><KeyedProperty propertyKey="14"><KeyFrameDouble value="150.5" frame="0"/><KeyFrameDouble value="148" frame="65"/><KeyFrameDouble value="150.5" frame="130"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:24"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0.72" frame="0"/><KeyFrameDouble value="0.94" frame="65"/><KeyFrameDouble value="0.72" frame="130"/></KeyedProperty><KeyedProperty propertyKey="15"><KeyFrameDouble value="0.16" frame="0"/><KeyFrameDouble value="0.31" frame="65"/><KeyFrameDouble value="0.16" frame="130"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:25"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0.72" frame="0"/><KeyFrameDouble value="0.94" frame="65"/><KeyFrameDouble value="0.72" frame="130"/></KeyedProperty><KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.16" frame="0"/><KeyFrameDouble value="-0.31" frame="65"/><KeyFrameDouble value="-0.16" frame="130"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:26"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="130"/></KeyedProperty></KeyedObject>
</LinearAnimation>
''')

replace_animation('Talking', r'''
<LinearAnimation fps="60" duration="72" loopValue="loop" name="Talking" id="0:72">
    <KeyedObject objectId="0:10">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="178.8" frame="18"/><KeyFrameDouble value="179.7" frame="36"/><KeyFrameDouble value="178.4" frame="54"/><KeyFrameDouble value="180" frame="72"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:30">
        <KeyedProperty propertyKey="13"><KeyFrameDouble value="111" frame="0"/><KeyFrameDouble value="117" frame="12"/><KeyFrameDouble value="108" frame="27"/><KeyFrameDouble value="118.5" frame="43"/><KeyFrameDouble value="110" frame="58"/><KeyFrameDouble value="111" frame="72"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="173.5" frame="12"/><KeyFrameDouble value="179" frame="27"/><KeyFrameDouble value="171.5" frame="43"/><KeyFrameDouble value="177" frame="58"/><KeyFrameDouble value="180" frame="72"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.012" frame="0"/><KeyFrameDouble value="0.082" frame="12"/><KeyFrameDouble value="-0.052" frame="27"/><KeyFrameDouble value="0.095" frame="43"/><KeyFrameDouble value="0.018" frame="58"/><KeyFrameDouble value="-0.012" frame="72"/></KeyedProperty>
        <KeyedProperty propertyKey="16"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.035" frame="12"/><KeyFrameDouble value="0.985" frame="27"/><KeyFrameDouble value="1.045" frame="43"/><KeyFrameDouble value="1.01" frame="58"/><KeyFrameDouble value="1" frame="72"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:31">
        <KeyedProperty propertyKey="13"><KeyFrameDouble value="111" frame="0"/><KeyFrameDouble value="107.5" frame="13"/><KeyFrameDouble value="114" frame="28"/><KeyFrameDouble value="108.5" frame="45"/><KeyFrameDouble value="113" frame="59"/><KeyFrameDouble value="111" frame="72"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="176.5" frame="13"/><KeyFrameDouble value="179" frame="28"/><KeyFrameDouble value="175.8" frame="45"/><KeyFrameDouble value="178.2" frame="59"/><KeyFrameDouble value="180" frame="72"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.012" frame="0"/><KeyFrameDouble value="0.042" frame="13"/><KeyFrameDouble value="-0.038" frame="28"/><KeyFrameDouble value="0.035" frame="45"/><KeyFrameDouble value="-0.024" frame="59"/><KeyFrameDouble value="-0.012" frame="72"/></KeyedProperty>
        <KeyedProperty propertyKey="16"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="0.955" frame="13"/><KeyFrameDouble value="1.028" frame="28"/><KeyFrameDouble value="0.965" frame="45"/><KeyFrameDouble value="1.018" frame="59"/><KeyFrameDouble value="1" frame="72"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:32">
        <KeyedProperty propertyKey="13"><KeyFrameDouble value="111" frame="0"/><KeyFrameDouble value="107.5" frame="13"/><KeyFrameDouble value="114" frame="28"/><KeyFrameDouble value="108.5" frame="45"/><KeyFrameDouble value="113" frame="59"/><KeyFrameDouble value="111" frame="72"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="184.5" frame="7"/><KeyFrameDouble value="181.5" frame="14"/><KeyFrameDouble value="185.2" frame="22"/><KeyFrameDouble value="180.8" frame="31"/><KeyFrameDouble value="183.8" frame="40"/><KeyFrameDouble value="181.3" frame="50"/><KeyFrameDouble value="184.6" frame="60"/><KeyFrameDouble value="180" frame="72"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.012" frame="0"/><KeyFrameDouble value="0.042" frame="13"/><KeyFrameDouble value="-0.038" frame="28"/><KeyFrameDouble value="0.035" frame="45"/><KeyFrameDouble value="-0.024" frame="59"/><KeyFrameDouble value="-0.012" frame="72"/></KeyedProperty>
        <KeyedProperty propertyKey="16"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="0.955" frame="13"/><KeyFrameDouble value="1.028" frame="28"/><KeyFrameDouble value="0.965" frame="45"/><KeyFrameDouble value="1.018" frame="59"/><KeyFrameDouble value="1" frame="72"/></KeyedProperty>
        <KeyedProperty propertyKey="17"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.055" frame="7"/><KeyFrameDouble value="0.985" frame="14"/><KeyFrameDouble value="1.070" frame="22"/><KeyFrameDouble value="0.99" frame="31"/><KeyFrameDouble value="1.045" frame="40"/><KeyFrameDouble value="1.065" frame="60"/><KeyFrameDouble value="1" frame="72"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:22"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="72"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:23"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="72"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:24"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="72"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:25"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="72"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:26">
        <KeyedProperty propertyKey="18"><KeyFrameDouble value="0.45" frame="0"/><KeyFrameDouble value="0.82" frame="10"/><KeyFrameDouble value="0.55" frame="22"/><KeyFrameDouble value="0.86" frame="37"/><KeyFrameDouble value="0.58" frame="55"/><KeyFrameDouble value="0.45" frame="72"/></KeyedProperty>
        <KeyedProperty propertyKey="16"><KeyFrameDouble value="0.92" frame="0"/><KeyFrameDouble value="1.05" frame="10"/><KeyFrameDouble value="0.96" frame="22"/><KeyFrameDouble value="1.08" frame="37"/><KeyFrameDouble value="0.95" frame="55"/><KeyFrameDouble value="0.92" frame="72"/></KeyedProperty>
        <KeyedProperty propertyKey="17"><KeyFrameDouble value="0.65" frame="0"/><KeyFrameDouble value="1.28" frame="10"/><KeyFrameDouble value="0.78" frame="22"/><KeyFrameDouble value="1.38" frame="37"/><KeyFrameDouble value="0.82" frame="55"/><KeyFrameDouble value="0.65" frame="72"/></KeyedProperty>
    </KeyedObject>
</LinearAnimation>
''')

replace_animation('Happy', r'''
<LinearAnimation fps="60" duration="46" loopValue="pingPong" name="Happy" id="0:73">
    <KeyedObject objectId="0:10">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="173.5" frame="23"/><KeyFrameDouble value="180" frame="46"/></KeyedProperty>
        <KeyedProperty propertyKey="16"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.018" frame="23"/><KeyFrameDouble value="1" frame="46"/></KeyedProperty>
        <KeyedProperty propertyKey="17"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.018" frame="23"/><KeyFrameDouble value="1" frame="46"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:30">
        <KeyedProperty propertyKey="13"><KeyFrameDouble value="111" frame="0"/><KeyFrameDouble value="119" frame="23"/><KeyFrameDouble value="111" frame="46"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="169.5" frame="23"/><KeyFrameDouble value="180" frame="46"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0.11" frame="23"/><KeyFrameDouble value="0" frame="46"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:31">
        <KeyedProperty propertyKey="13"><KeyFrameDouble value="111" frame="0"/><KeyFrameDouble value="114.5" frame="23"/><KeyFrameDouble value="111" frame="46"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="173" frame="23"/><KeyFrameDouble value="180" frame="46"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.01" frame="0"/><KeyFrameDouble value="0.045" frame="23"/><KeyFrameDouble value="-0.01" frame="46"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:32">
        <KeyedProperty propertyKey="13"><KeyFrameDouble value="111" frame="0"/><KeyFrameDouble value="114.5" frame="23"/><KeyFrameDouble value="111" frame="46"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="174" frame="23"/><KeyFrameDouble value="180" frame="46"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.01" frame="0"/><KeyFrameDouble value="0.045" frame="23"/><KeyFrameDouble value="-0.01" frame="46"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:22"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="46"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:23"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="46"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:24"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="46"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:25"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="46"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:26"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="46"/></KeyedProperty></KeyedObject>
</LinearAnimation>
''')

scene_path.write_text(scene, encoding='utf-8')

# Recompile the Rive character and re-embed it for Android WebView/offline loading.
subprocess.run([str(RIVE_CLI), str(RIVE_PROJECT), '--once'], check=True)
riv_path = RIVE_PROJECT / 'build/tiko.riv'
if not riv_path.exists() or riv_path.stat().st_size < 1000:
    raise SystemExit('v7.2 Rive build did not produce a valid tiko.riv')
shutil.copy2(riv_path, ASSETS / 'tiko.riv')
riv_b64 = base64.b64encode(riv_path.read_bytes()).decode('ascii')
(ASSETS / 'tiko-riv-data.js').write_text("window.TIKO_RIV_BASE64='" + riv_b64 + "';\n", encoding='utf-8')

# Add the v7.2 presentation override after v7.1.
index = ASSETS / 'index.html'
h = index.read_text(encoding='utf-8')
if '<link rel="stylesheet" href="v72.css">' not in h:
    h = h.replace('</head>', '<link rel="stylesheet" href="v72.css"></head>')
index.write_text(h, encoding='utf-8')

appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8').replace("version:'7.1'", "version:'7.2'")
appjs.write_text(a, encoding='utf-8')

main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/7.1','PratikoAIAndroid/7.2').replace('android-7.1','android-7.2')
main.write_text(s, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 32','versionCode 33').replace("versionName '7.1.0'", "versionName '7.2.0'")
gradle.write_text(g, encoding='utf-8')

print(f'Pratiko AI v7.2 prepared — visible independent hand/arm gestures, head turns, jaw motion; tiko.riv={riv_path.stat().st_size} bytes')
