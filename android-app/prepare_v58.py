from pathlib import Path
import base64
import io
import os
import re
import runpy
import shutil
import subprocess

from PIL import Image, ImageChops, ImageDraw, ImageFilter

# Start from v5.6: stable Rive runtime + exact approved Tiko artwork.
runpy.run_path('android-app/prepare_v56.py', run_name='__main__')

ROOT = Path('android-app')
ASSETS = ROOT / 'app/src/main/assets'
RIVE_PROJECT = ROOT / 'tiko-rive'
RIVE_CLI = Path(os.environ.get('RIVE_CLI', '/tmp/rive'))

if not RIVE_CLI.exists():
    raise SystemExit(f'Rive CLI not found at {RIVE_CLI}')

# ---------------------------------------------------------------------------
# Build a real segmented raster rig from the exact original Tiko.
# The four layers reconstruct the original perfectly at rest, then Rive moves
# body / pointing arm / head / lower jaw independently.
# ---------------------------------------------------------------------------
svg = (ASSETS / 'tiko-original.svg').read_text(encoding='utf-8')
m = re.search(r'data:image/webp;base64,([^\"\']+)', svg)
if not m:
    raise SystemExit('Embedded original Tiko WebP not found')
raw = base64.b64decode(m.group(1))
source = Image.open(io.BytesIO(raw)).convert('RGBA')
if source.size != (222, 360):
    raise SystemExit(f'Unexpected Tiko size: {source.size}')
W, H = source.size
alpha = source.getchannel('A')


def poly_mask(points, blur=2):
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    if blur:
        mask = mask.filter(ImageFilter.GaussianBlur(blur))
    return mask


# Masks were calibrated against the exact 222x360 approved Tiko image.
HEAD = [
    (30,82),(54,65),(103,60),(145,69),(168,92),(174,123),(168,160),
    (158,193),(151,216),(139,235),(123,247),(100,246),(80,236),(62,219),
    (48,199),(38,174),(31,145),(27,111)
]
ARM = [
    (42,225),(59,219),(77,222),(92,230),(105,242),(117,254),(122,270),
    (118,287),(107,304),(93,318),(77,330),(58,338),(38,337),(22,329),
    (10,316),(4,300),(4,279),(10,260),(21,245)
]
JAW = [
    (84,177),(96,170),(112,168),(130,169),(146,177),(154,188),(155,201),
    (149,214),(140,225),(127,233),(111,233),(98,226),(89,216),(83,204),
    (80,190)
]

head_mask = poly_mask(HEAD, 2)
arm_mask = poly_mask(ARM, 2)
jaw_mask = poly_mask(JAW, 2)

# Smaller cores are removed from the underlying layer, leaving a soft overlap
# around the joints so motion never exposes hard rectangular seams.
head_core = head_mask.filter(ImageFilter.MinFilter(9))
arm_core = arm_mask.filter(ImageFilter.MinFilter(9))
jaw_core = jaw_mask.filter(ImageFilter.MinFilter(7))

body_alpha = ImageChops.multiply(alpha, ImageChops.invert(ImageChops.lighter(head_core, arm_core)))
head_alpha = ImageChops.multiply(alpha, ImageChops.multiply(head_mask, ImageChops.invert(jaw_core)))
arm_alpha = ImageChops.multiply(alpha, arm_mask)
jaw_alpha = ImageChops.multiply(alpha, jaw_mask)

parts = {
    'tiko_body.webp': body_alpha,
    'tiko_arm.webp': arm_alpha,
    'tiko_head.webp': head_alpha,
    'tiko_jaw.webp': jaw_alpha,
}
for filename, part_alpha in parts.items():
    part = source.copy()
    part.putalpha(part_alpha)
    part.save(RIVE_PROJECT / filename, 'WEBP', lossless=True, method=6)

# ---------------------------------------------------------------------------
# Upgrade the Rive scene. We keep the proven state machine wiring but replace
# the single bitmap with four independently animated layers and recalibrate the
# face overlays to the real eye/mouth coordinates of this exact artwork.
# ---------------------------------------------------------------------------
scene_path = RIVE_PROJECT / 'scene.rml'
scene = scene_path.read_text(encoding='utf-8')

scene = scene.replace(
    '<ImageAsset file="tiko.webp" name="Tiko Original" id="0:60"/>',
    '<ImageAsset file="tiko_body.webp" name="Tiko Body" id="0:60"/>\n'
    '    <ImageAsset file="tiko_arm.webp" name="Tiko Pointing Arm" id="0:61"/>\n'
    '    <ImageAsset file="tiko_head.webp" name="Tiko Head" id="0:62"/>\n'
    '    <ImageAsset file="tiko_jaw.webp" name="Tiko Jaw" id="0:63"/>'
)

scene = scene.replace(
    '<Image x="111" y="180" originX="0.5" originY="0.5" assetId="0:60" name="Tiko Original" id="0:10"/>',
    '<Image x="111" y="180" originX="0.5" originY="0.5" assetId="0:60" name="Tiko Body" id="0:10"/>\n'
    '        <Image x="111" y="180" originX="0.5" originY="0.5" assetId="0:61" name="Tiko Pointing Arm" id="0:30"/>\n'
    '        <Image x="111" y="180" originX="0.5" originY="0.5" assetId="0:62" name="Tiko Head" id="0:31"/>\n'
    '        <Image x="111" y="180" originX="0.5" originY="0.5" assetId="0:63" name="Tiko Jaw" id="0:32"/>'
)

# Correct face coordinates. These are centered on Tiko's actual eyes, brows and mouth.
scene = scene.replace('x="97" y="128" opacity="0" name="Left Lid"', 'x="96" y="163" opacity="0" name="Left Lid"')
scene = scene.replace('x="133" y="127" opacity="0" name="Right Lid"', 'x="137" y="154" opacity="0" name="Right Lid"')
scene = scene.replace('x="98" y="125" opacity="0" name="Thinking Left Pupil"', 'x="98" y="159" opacity="0" name="Thinking Left Pupil"')
scene = scene.replace('x="134" y="124" opacity="0" name="Thinking Right Pupil"', 'x="139" y="151" opacity="0" name="Thinking Right Pupil"')
scene = scene.replace('x="97" y="109" rotation="0.10" opacity="0" name="Thinking Left Brow"', 'x="96" y="143" rotation="0.10" opacity="0" name="Thinking Left Brow"')
scene = scene.replace('x="133" y="108" rotation="-0.10" opacity="0" name="Thinking Right Brow"', 'x="138" y="135" rotation="-0.10" opacity="0" name="Thinking Right Brow"')
scene = scene.replace('x="114" y="176" opacity="0" name="Talking Mouth"', 'x="120" y="193" opacity="0" name="Talking Mouth"')
scene = scene.replace('<Ellipse width="17" height="8" name="Mouth"/>', '<Ellipse width="28" height="10" name="Mouth"/>')
scene = scene.replace('colorValue="FF70362F" name="Mouth Color"', 'colorValue="FF55251F" name="Mouth Color"')

IDLE = '''<LinearAnimation fps="60" duration="110" loopValue="pingPong" name="Idle" id="0:70">
            <KeyedObject objectId="0:10">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0" interpolationType="cubic"><CubicEaseInterpolator x1="0.42" y1="0" x2="0.58" y2="1"/></KeyFrameDouble><KeyFrameDouble value="178.7" frame="110" interpolationType="linear"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.003" frame="0"/><KeyFrameDouble value="0.004" frame="110"/></KeyedProperty>
                <KeyedProperty propertyKey="17"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.004" frame="110"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:30">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="179.1" frame="110"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="0.007" frame="0"/><KeyFrameDouble value="-0.006" frame="110"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:31">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0" interpolationType="cubic"><CubicEaseInterpolator x1="0.42" y1="0" x2="0.58" y2="1"/></KeyFrameDouble><KeyFrameDouble value="178.1" frame="110" interpolationType="linear"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.008" frame="0"/><KeyFrameDouble value="0.009" frame="110"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:32">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="178.1" frame="110"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.008" frame="0"/><KeyFrameDouble value="0.009" frame="110"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:22"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="110"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:23"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="110"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:24"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="110"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:25"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="110"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:26"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="110"/></KeyedProperty></KeyedObject>
        </LinearAnimation>'''

THINKING = '''<LinearAnimation fps="60" duration="76" loopValue="pingPong" name="Thinking" id="0:71">
            <KeyedObject objectId="0:10">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="179" frame="76"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.006" frame="0"/><KeyFrameDouble value="0.003" frame="76"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:30">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="181.2" frame="76"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="0.018" frame="0"/><KeyFrameDouble value="0.009" frame="76"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:31">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0" interpolationType="cubic"><CubicEaseInterpolator x1="0.42" y1="0" x2="0.58" y2="1"/></KeyFrameDouble><KeyFrameDouble value="176.3" frame="76" interpolationType="linear"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.032" frame="0"/><KeyFrameDouble value="-0.018" frame="76"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:32">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="176.3" frame="76"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.032" frame="0"/><KeyFrameDouble value="-0.018" frame="76"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:22"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0.78" frame="0"/><KeyFrameDouble value="0.78" frame="76"/></KeyedProperty><KeyedProperty propertyKey="14"><KeyFrameDouble value="159" frame="0"/><KeyFrameDouble value="157.5" frame="76"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:23"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0.78" frame="0"/><KeyFrameDouble value="0.78" frame="76"/></KeyedProperty><KeyedProperty propertyKey="14"><KeyFrameDouble value="151" frame="0"/><KeyFrameDouble value="149.5" frame="76"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:24"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0.72" frame="0"/><KeyFrameDouble value="0.72" frame="76"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:25"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0.72" frame="0"/><KeyFrameDouble value="0.72" frame="76"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:26"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="76"/></KeyedProperty></KeyedObject>
        </LinearAnimation>'''

TALKING = '''<LinearAnimation fps="60" duration="24" loopValue="loop" name="Talking" id="0:72">
            <KeyedObject objectId="0:10">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="179.1" frame="8"/><KeyFrameDouble value="179.6" frame="16"/><KeyFrameDouble value="180" frame="24"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:30">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="178.4" frame="8"/><KeyFrameDouble value="179.2" frame="16"/><KeyFrameDouble value="180" frame="24"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.009" frame="0"/><KeyFrameDouble value="0.016" frame="8"/><KeyFrameDouble value="-0.004" frame="16"/><KeyFrameDouble value="-0.009" frame="24"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:31">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="177.4" frame="7"/><KeyFrameDouble value="179.1" frame="15"/><KeyFrameDouble value="178.2" frame="20"/><KeyFrameDouble value="180" frame="24"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.009" frame="0"/><KeyFrameDouble value="0.014" frame="7"/><KeyFrameDouble value="-0.007" frame="15"/><KeyFrameDouble value="0.006" frame="20"/><KeyFrameDouble value="-0.009" frame="24"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:32">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180.5" frame="0"/><KeyFrameDouble value="180.8" frame="5"/><KeyFrameDouble value="181.9" frame="9"/><KeyFrameDouble value="179.8" frame="14"/><KeyFrameDouble value="181.4" frame="19"/><KeyFrameDouble value="180.5" frame="24"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.007" frame="0"/><KeyFrameDouble value="0.012" frame="9"/><KeyFrameDouble value="-0.004" frame="16"/><KeyFrameDouble value="-0.007" frame="24"/></KeyedProperty>
                <KeyedProperty propertyKey="17"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.025" frame="6"/><KeyFrameDouble value="1.045" frame="10"/><KeyFrameDouble value="1.012" frame="15"/><KeyFrameDouble value="1.035" frame="20"/><KeyFrameDouble value="1" frame="24"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:22"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="24"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:23"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="24"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:24"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="24"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:25"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="24"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:26">
                <KeyedProperty propertyKey="18"><KeyFrameDouble value="0.60" frame="0"/><KeyFrameDouble value="0.82" frame="6"/><KeyFrameDouble value="0.72" frame="12"/><KeyFrameDouble value="0.88" frame="18"/><KeyFrameDouble value="0.60" frame="24"/></KeyedProperty>
                <KeyedProperty propertyKey="17"><KeyFrameDouble value="0.55" frame="0"/><KeyFrameDouble value="1.22" frame="6"/><KeyFrameDouble value="0.72" frame="12"/><KeyFrameDouble value="1.35" frame="18"/><KeyFrameDouble value="0.55" frame="24"/></KeyedProperty>
                <KeyedProperty propertyKey="16"><KeyFrameDouble value="0.96" frame="0"/><KeyFrameDouble value="1.05" frame="12"/><KeyFrameDouble value="0.96" frame="24"/></KeyedProperty>
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="193" frame="0"/><KeyFrameDouble value="194" frame="8"/><KeyFrameDouble value="192.5" frame="16"/><KeyFrameDouble value="193" frame="24"/></KeyedProperty>
            </KeyedObject>
        </LinearAnimation>'''

HAPPY = '''<LinearAnimation fps="60" duration="34" loopValue="pingPong" name="Happy" id="0:73">
            <KeyedObject objectId="0:10">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="177" frame="34"/></KeyedProperty>
                <KeyedProperty propertyKey="16"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.01" frame="34"/></KeyedProperty>
                <KeyedProperty propertyKey="17"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.01" frame="34"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:30">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="174.8" frame="34"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="0.004" frame="0"/><KeyFrameDouble value="-0.036" frame="34"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:31">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="174.2" frame="34"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.004" frame="0"/><KeyFrameDouble value="0.03" frame="34"/></KeyedProperty>
                <KeyedProperty propertyKey="16"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.015" frame="34"/></KeyedProperty>
                <KeyedProperty propertyKey="17"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.015" frame="34"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:32">
                <KeyedProperty propertyKey="14"><KeyFrameDouble value="180" frame="0"/><KeyFrameDouble value="174.2" frame="34"/></KeyedProperty>
                <KeyedProperty propertyKey="15"><KeyFrameDouble value="-0.004" frame="0"/><KeyFrameDouble value="0.03" frame="34"/></KeyedProperty>
                <KeyedProperty propertyKey="16"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.015" frame="34"/></KeyedProperty>
                <KeyedProperty propertyKey="17"><KeyFrameDouble value="1" frame="0"/><KeyFrameDouble value="1.015" frame="34"/></KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:22"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="34"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:23"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="34"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:24"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="34"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:25"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="34"/></KeyedProperty></KeyedObject>
            <KeyedObject objectId="0:26"><KeyedProperty propertyKey="18"><KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="34"/></KeyedProperty></KeyedObject>
        </LinearAnimation>'''

BLINK = '''<LinearAnimation fps="60" duration="300" loopValue="loop" name="Blink" id="0:74">
            <KeyedObject objectId="0:20">
                <KeyedProperty propertyKey="18">
                    <KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="154"/><KeyFrameDouble value="1" frame="156"/><KeyFrameDouble value="1" frame="158"/><KeyFrameDouble value="0" frame="161"/><KeyFrameDouble value="0" frame="275"/><KeyFrameDouble value="1" frame="277"/><KeyFrameDouble value="0" frame="280"/><KeyFrameDouble value="0" frame="300"/>
                </KeyedProperty>
            </KeyedObject>
            <KeyedObject objectId="0:21">
                <KeyedProperty propertyKey="18">
                    <KeyFrameDouble value="0" frame="0"/><KeyFrameDouble value="0" frame="154"/><KeyFrameDouble value="1" frame="156"/><KeyFrameDouble value="1" frame="158"/><KeyFrameDouble value="0" frame="161"/><KeyFrameDouble value="0" frame="275"/><KeyFrameDouble value="1" frame="277"/><KeyFrameDouble value="0" frame="280"/><KeyFrameDouble value="0" frame="300"/>
                </KeyedProperty>
            </KeyedObject>
        </LinearAnimation>'''


def replace_anim(text, name, block):
    pattern = rf'<LinearAnimation\b[^>]*name="{re.escape(name)}"[^>]*>.*?</LinearAnimation>'
    out, n = re.subn(pattern, block, text, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f'Could not replace Rive animation {name}: {n}')
    return out

for anim_name, anim_block in [('Idle', IDLE), ('Thinking', THINKING), ('Talking', TALKING), ('Happy', HAPPY), ('Blink', BLINK)]:
    scene = replace_anim(scene, anim_name, anim_block)

scene_path.write_text(scene, encoding='utf-8')

# Recompile after the segmented rig + new timelines are installed.
subprocess.run([str(RIVE_CLI), str(RIVE_PROJECT), '--once'], check=True)
riv_path = RIVE_PROJECT / 'build/tiko.riv'
if not riv_path.exists() or riv_path.stat().st_size < 1000:
    raise SystemExit('Segmented Tiko Rive build did not produce a valid .riv file')
shutil.copy2(riv_path, ASSETS / 'tiko.riv')
riv_b64 = base64.b64encode(riv_path.read_bytes()).decode('ascii')
(ASSETS / 'tiko-riv-data.js').write_text("window.TIKO_RIV_BASE64='" + riv_b64 + "';\n", encoding='utf-8')

# v5.8 no longer needs the whole-character CSS bobbing from v5.7: movement is inside Rive.
index = ASSETS / 'index.html'
h = index.read_text(encoding='utf-8')
h = h.replace('<link rel="stylesheet" href="v57.css">', '').replace('<script src="v57.js"></script>', '')
if '<link rel="stylesheet" href="v58.css">' not in h:
    h = h.replace('</head>', '<link rel="stylesheet" href="v58.css"></head>')
index.write_text(h, encoding='utf-8')

main = ROOT / 'app/src/main/java/ai/pratico/app/MainActivity.java'
s = main.read_text(encoding='utf-8').replace('PratikoAIAndroid/5.6','PratikoAIAndroid/5.8').replace('android-5.6','android-5.8')
main.write_text(s, encoding='utf-8')

appjs = ASSETS / 'app.js'
a = appjs.read_text(encoding='utf-8').replace("version:'5.6'", "version:'5.8'")
appjs.write_text(a, encoding='utf-8')

gradle = ROOT / 'app/build.gradle'
g = gradle.read_text(encoding='utf-8').replace('versionCode 23','versionCode 25').replace("versionName '5.6.0'", "versionName '5.8.0'")
gradle.write_text(g, encoding='utf-8')

print(f'Pratiko AI v5.8 prepared — segmented Rive rig: body + arm + head + jaw; tiko.riv={riv_path.stat().st_size} bytes')
