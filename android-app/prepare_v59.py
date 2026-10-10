from pathlib import Path
import base64
import os
import re
import runpy
import shutil
import subprocess

# Start from the segmented v5.8 Rive rig: exact approved Tiko with independent
# body / pointing arm / head / jaw layers.
runpy.run_path('android-app/prepare_v58.py', run_name='__main__')

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
        raise SystemExit(f'Could not replace Rive animation: {name}')


# Human idle: slow breathing, tiny head motion and a barely perceptible hand drift.
replace_animation('Idle', r'''
<LinearAnimation fps="60" duration="180" loopValue="loop" name="Idle" id="0:70">
    <KeyedObject objectId="0:10">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="178.9" frame="62"/><KeyFrameDouble value="179.5" frame="126"/><KeyFrameDouble value="180" frame="180"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.003" frame="0"/><KeyFrameDouble value="0.004" frame="62"/><KeyFrameDouble value="-0.002" frame="126"/><KeyFrameDouble value="-0.003" frame="180"/></KeyedProperty>
        <KeyedProperty propertyKey="17"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.005" frame="62"/><KeyFrameDouble value="1.002" frame="126"/><KeyFrameDouble value="1" frame="180"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:30">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="179.1" frame="54"/><KeyFrameDouble value="180.3" frame="118"/><KeyFrameDouble value="179.5" frame="154"/><KeyFrameDouble value="180" frame="180"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="0.004" frame="0"/><KeyFrameDouble value="-0.009" frame="54"/><KeyFrameDouble value="0.006" frame="118"/><KeyFrameDouble value="-0.003" frame="154"/><KeyFrameDouble value="0.004" frame="180"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:31">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="178.5" frame="58"/><KeyFrameDouble value="179.3" frame="121"/><KeyFrameDouble value="178.9" frame="151"/><KeyFrameDouble value="180" frame="180"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.007" frame="0"/><KeyFrameDouble value="0.010" frame="58"/><KeyFrameDouble value="-0.004" frame="121"/><KeyFrameDouble value="0.006" frame="151"/><KeyFrameDouble value="-0.007" frame="180"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:32">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="178.5" frame="58"/><KeyFrameDouble value="179.3" frame="121"/><KeyFrameDouble value="178.9" frame="151"/><KeyFrameDouble value="180" frame="180"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.007" frame="0"/><KeyFrameDouble value="0.010" frame="58"/><KeyFrameDouble value="-0.004" frame="121"/><KeyFrameDouble value="0.006" frame="151"/><KeyFrameDouble value="-0.007" frame="180"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:22"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="180"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:23"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="180"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:24"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="180"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:25"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="180"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:26"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="180"/></KeyedProperty></KeyedObject>
</LinearAnimation>
''')

# Thinking: stronger brow furrow, eyes glance slightly upward, head tilt and restrained hand.
replace_animation('Thinking', r'''
<LinearAnimation fps="60" duration="112" loopValue="pingPong" name="Thinking" id="0:71">
    <KeyedObject objectId="0:10">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="179.1" frame="54"/><KeyFrameDouble value="180" frame="112"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.006" frame="0"/><KeyFrameDouble value="0.003" frame="54"/><KeyFrameDouble value="-0.006" frame="112"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:30">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="181.4" frame="55"/><KeyFrameDouble value="180.6" frame="84"/><KeyFrameDouble value="180" frame="112"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="0.012" frame="0"/><KeyFrameDouble value="0.025" frame="55"/><KeyFrameDouble value="0.017" frame="84"/><KeyFrameDouble value="0.012" frame="112"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:31">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="179.4" frame="0"/><KeyFrameDouble value="176.5" frame="52"/><KeyFrameDouble value="177.4" frame="82"/><KeyFrameDouble value="179.4" frame="112"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.030" frame="0"/><KeyFrameDouble value="-0.047" frame="52"/><KeyFrameDouble value="-0.036" frame="82"/><KeyFrameDouble value="-0.030" frame="112"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:32">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="179.7" frame="0"/><KeyFrameDouble value="177.2" frame="52"/><KeyFrameDouble value="178.0" frame="82"/><KeyFrameDouble value="179.7" frame="112"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.030" frame="0"/><KeyFrameDouble value="-0.047" frame="52"/><KeyFrameDouble value="-0.036" frame="82"/><KeyFrameDouble value="-0.030" frame="112"/></KeyedProperty>
        <KeyedProperty propertyKey="17"><KeyFrameDouble value="0.985" frame="0"/><KeyFrameDouble value="0.965" frame="52"/><KeyFrameDouble value="0.980" frame="82"/><KeyFrameDouble value="0.985" frame="112"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:22">
        <KeyedProperty propertyKey="18"><KeyFrameDouble value="0.48" frame="0"/><KeyFrameDouble value="0.62" frame="52"/><KeyFrameDouble value="0.50" frame="112"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="158.4" frame="0"/><KeyFrameDouble value="156.4" frame="52"/><KeyFrameDouble value="158.4" frame="112"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:23">
        <KeyedProperty propertyKey="18"><KeyFrameDouble value="0.48" frame="0"/><KeyFrameDouble value="0.62" frame="52"/><KeyFrameDouble value="0.50" frame="112"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="150.4" frame="0"/><KeyFrameDouble value="148.5" frame="52"/><KeyFrameDouble value="150.4" frame="112"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:24">
        <KeyedProperty propertyKey="18"><KeyFrameDouble value="0.62" frame="0"/><KeyFrameDouble value="0.86" frame="45"/><KeyFrameDouble value="0.70" frame="112"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="143" frame="0"/><KeyFrameDouble value="145.1" frame="45"/><KeyFrameDouble value="143.6" frame="112"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="0.14" frame="0"/><KeyFrameDouble value="0.27" frame="45"/><KeyFrameDouble value="0.18" frame="112"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:25">
        <KeyedProperty propertyKey="18"><KeyFrameDouble value="0.62" frame="0"/><KeyFrameDouble value="0.86" frame="45"/><KeyFrameDouble value="0.70" frame="112"/></KeyedProperty>
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="135" frame="0"/><KeyFrameDouble value="137.1" frame="45"/><KeyFrameDouble value="135.6" frame="112"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.14" frame="0"/><KeyFrameDouble value="-0.27" frame="45"/><KeyFrameDouble value="-0.18" frame="112"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:26"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="112"/></KeyedProperty></KeyedObject>
</LinearAnimation>
''')

# Talking: non-metronomic jaw shapes, gentle hand gestures and asynchronous head nods.
replace_animation('Talking', r'''
<LinearAnimation fps="60" duration="54" loopValue="loop" name="Talking" id="0:72">
    <KeyedObject objectId="0:10">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="179.1" frame="13"/><KeyFrameDouble value="179.7" frame="24"/><KeyFrameDouble value="178.8" frame="38"/><KeyFrameDouble value="180" frame="54"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:30">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="176.7" frame="11"/><KeyFrameDouble value="179.0" frame="22"/><KeyFrameDouble value="175.8" frame="35"/><KeyFrameDouble value="177.8" frame="44"/><KeyFrameDouble value="180" frame="54"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.008" frame="0"/><KeyFrameDouble value="0.028" frame="11"/><KeyFrameDouble value="-0.012" frame="22"/><KeyFrameDouble value="0.034" frame="35"/><KeyFrameDouble value="0.006" frame="44"/><KeyFrameDouble value="-0.008" frame="54"/></KeyedProperty>
        <KeyedProperty propertyKey="16"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.012" frame="11"/><KeyFrameDouble value="1" frame="22"/><KeyFrameDouble value="1.016" frame="35"/><KeyFrameDouble value="1.006" frame="44"/><KeyFrameDouble value="1" frame="54"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:31">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="178.1" frame="9"/><KeyFrameDouble value="179.0" frame="18"/><KeyFrameDouble value="177.1" frame="31"/><KeyFrameDouble value="178.6" frame="43"/><KeyFrameDouble value="180" frame="54"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.010" frame="0"/><KeyFrameDouble value="0.008" frame="9"/><KeyFrameDouble value="-0.014" frame="18"/><KeyFrameDouble value="0.013" frame="31"/><KeyFrameDouble value="-0.004" frame="43"/><KeyFrameDouble value="-0.010" frame="54"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:32">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="183.2" frame="5"/><KeyFrameDouble value="181.0" frame="10"/><KeyFrameDouble value="184.0" frame="16"/><KeyFrameDouble value="180.8" frame="22"/><KeyFrameDouble value="182.7" frame="29"/><KeyFrameDouble value="181.2" frame="36"/><KeyFrameDouble value="183.7" frame="43"/><KeyFrameDouble value="180.6" frame="49"/><KeyFrameDouble value="180" frame="54"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.010" frame="0"/><KeyFrameDouble value="0.003" frame="5"/><KeyFrameDouble value="-0.008" frame="10"/><KeyFrameDouble value="0.007" frame="16"/><KeyFrameDouble value="-0.005" frame="22"/><KeyFrameDouble value="0.005" frame="29"/><KeyFrameDouble value="-0.004" frame="36"/><KeyFrameDouble value="0.006" frame="43"/><KeyFrameDouble value="-0.007" frame="49"/><KeyFrameDouble value="-0.010" frame="54"/></KeyedProperty>
        <KeyedProperty propertyKey="16"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.018" frame="16"/><KeyFrameDouble value="0.992" frame="22"/><KeyFrameDouble value="1.012" frame="43"/><KeyFrameDouble value="1" frame="54"/></KeyedProperty>
        <KeyedProperty propertyKey="17"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.035" frame="5"/><KeyFrameDouble value="1.015" frame="10"/><KeyFrameDouble value="1.050" frame="16"/><KeyFrameDouble value="1.010" frame="22"/><KeyFrameDouble value="1.032" frame="29"/><KeyFrameDouble value="1.014" frame="36"/><KeyFrameDouble value="1.046" frame="43"/><KeyFrameDouble value="1.008" frame="49"/><KeyFrameDouble value="1" frame="54"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:22"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="54"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:23"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="54"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:24"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0.18" frame="18"/><KeyFrameDouble value="0" frame="39"/><KeyFrameDouble value="0" frame="54"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:25"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0.16" frame="18"/><KeyFrameDouble value="0" frame="39"/><KeyFrameDouble value="0" frame="54"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:26">
        <KeyedProperty propertyKey="18"><KeyFrameDouble value="0.20" frame="0"/><KeyFrameDouble value="0.34" frame="5"/><KeyFrameDouble value="0.18" frame="10"/><KeyFrameDouble value="0.38" frame="16"/><KeyFrameDouble value="0.16" frame="22"/><KeyFrameDouble value="0.31" frame="29"/><KeyFrameDouble value="0.19" frame="36"/><KeyFrameDouble value="0.36" frame="43"/><KeyFrameDouble value="0.17" frame="49"/><KeyFrameDouble value="0.20" frame="54"/></KeyedProperty>
        <KeyedProperty propertyKey="16"><KeyFrameDouble value="0.92" frame="0"/><KeyFrameDouble value="1.05" frame="16"/><KeyFrameDouble value="0.88" frame="22"/><KeyFrameDouble value="1.02" frame="43"/><KeyFrameDouble value="0.92" frame="54"/></KeyedProperty>
        <KeyedProperty propertyKey="17"><KeyFrameDouble value="0.52" frame="0"/><KeyFrameDouble value="1.20" frame="5"/><KeyFrameDouble value="0.70" frame="10"/><KeyFrameDouble value="1.35" frame="16"/><KeyFrameDouble value="0.60" frame="22"/><KeyFrameDouble value="1.08" frame="29"/><KeyFrameDouble value="0.66" frame="36"/><KeyFrameDouble value="1.28" frame="43"/><KeyFrameDouble value="0.58" frame="49"/><KeyFrameDouble value="0.52" frame="54"/></KeyedProperty>
    </KeyedObject>
</LinearAnimation>
''')

# Happy: short, friendly reaction with an open hand/arm lift and bright head movement.
replace_animation('Happy', r'''
<LinearAnimation fps="60" duration="48" loopValue="pingPong" name="Happy" id="0:73">
    <KeyedObject objectId="0:10">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="176.8" frame="24"/><KeyFrameDouble value="180" frame="48"/></KeyedProperty>
        <KeyedProperty propertyKey="17"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.012" frame="24"/><KeyFrameDouble value="1" frame="48"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:30">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="173.4" frame="22"/><KeyFrameDouble value="176.2" frame="34"/><KeyFrameDouble value="180" frame="48"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0.055" frame="22"/><KeyFrameDouble value="0.020" frame="34"/><KeyFrameDouble value="0" frame="48"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:31">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="174.8" frame="23"/><KeyFrameDouble value="177.2" frame="34"/><KeyFrameDouble value="180" frame="48"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.004" frame="0"/><KeyFrameDouble value="0.025" frame="23"/><KeyFrameDouble value="-0.010" frame="34"/><KeyFrameDouble value="-0.004" frame="48"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:32">
        <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="175.2" frame="23"/><KeyFrameDouble value="177.6" frame="34"/><KeyFrameDouble value="180" frame="48"/></KeyedProperty>
        <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.004" frame="0"/><KeyFrameDouble value="0.025" frame="23"/><KeyFrameDouble value="-0.010" frame="34"/><KeyFrameDouble value="-0.004" frame="48"/></KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:22"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="48"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:23"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="48"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:24"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0.10" frame="0"/><KeyFrameDouble value="0" frame="24"/><KeyFrameDouble value="0.10" frame="48"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:25"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0.10" frame="0"/><KeyFrameDouble value="0" frame="24"/><KeyFrameDouble value="0.10" frame="48"/></KeyedProperty></KeyedObject>
    <KeyedObject objectId="0:26"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="48"/></KeyedProperty></KeyedObject>
</LinearAnimation>
''')

# Less robotic blink rhythm: one natural blink plus an occasional quick double-blink in the loop.
replace_animation('Blink', r'''
<LinearAnimation fps="60" duration="390" loopValue="loop" name="Blink" id="0:74">
    <KeyedObject objectId="0:20">
        <KeyedProperty propertyKey="18">
            <KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="167"/><KeyFrameDouble value="1" frame="169"/><KeyFrameDouble value="1" frame="171"/><KeyFrameDouble value="0" frame="174"/>
            <KeyFrameDouble value="0" frame="300"/><KeyFrameDouble value="1" frame="302"/><KeyFrameDouble value="0" frame="305"/><KeyFrameDouble value="0" frame="314"/><KeyFrameDouble value="1" frame="316"/><KeyFrameDouble value="0" frame="319"/><KeyFrameDouble value="0" frame="390"/>
        </KeyedProperty>
    </KeyedObject>
    <KeyedObject objectId="0:21">
        <KeyedProperty propertyKey="18">
            <KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="167"/><KeyFrameDouble value="1" frame="169"/><KeyFrameDouble value="1" frame="171"/><KeyFrameDouble value="0" frame="174"/>
            <KeyFrameDouble value="0" frame="300"/><KeyFrameDouble value="1" frame="302"/><KeyFrameDouble value="0" frame="305"/><KeyFrameDouble value="0" frame="314"/><KeyFrameDouble value="1" frame="316"/><KeyFrameDouble value="0" frame="319"/><KeyFrameDouble value="0" frame="390"/>
        </KeyedProperty>
    </KeyedObject>
</LinearAnimation>
''')

scene_path.write_text(scene, encoding='utf-8')

# Recompile the richer v5.9 state animations into the actual .riv bundled in Android.
subprocess.run([str(RIVE_CLI), str(RIVE_PROJECT), '--once'], check=True)
riv_path = RIVE_PROJECT / 'build/tiko.riv'
if not riv_path.exists() or riv_path.stat().st_size < 1000:
    raise SystemExit('Tiko v5.9 Rive build did not produce a valid .riv file')
shutil.copy2(riv_path, ASSETS / 'tiko.riv')
riv_b64 = base64.b64encode(riv_path.read_bytes()).decode('ascii')
(ASSETS / 'tiko-riv-data.js').write_text("window.TIKO_RIV_BASE64='" + riv_b64 + "';\n", encoding='utf-8')

# Version metadata.
main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/5.8','PratikoAIAndroid/5.9').replace('android-5.8','android-5.9')
main.write_text(s, encoding='utf-8')

appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8').replace("version:'5.8'", "version:'5.9'")
appjs.write_text(a, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 25','versionCode 26').replace("versionName '5.8.0'", "versionName '5.9.0'")
gradle.write_text(g, encoding='utf-8')

print(f'Pratiko AI v5.9 prepared — humanized Rive motion; tiko.riv={riv_path.stat().st_size} bytes')
