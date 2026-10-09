from pathlib import Path
import hashlib, subprocess, tarfile, tempfile, urllib.request

URL = 'https://releases.rive.app/cli/v1.5.1/rive-linux-x64.tar.gz'
SHA256 = 'f1c99eadc35920f8a0a802bebe8607101e18c581c040ab0dbf98895cff368477'

with tempfile.TemporaryDirectory() as td:
    td = Path(td)
    archive = td / 'rive.tar.gz'
    print('Downloading Rive CLI 1.5.1...')
    urllib.request.urlretrieve(URL, archive)
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    if digest != SHA256:
        raise SystemExit(f'Rive CLI checksum mismatch: {digest}')
    with tarfile.open(archive, 'r:gz') as tf:
        tf.extractall(td / 'bin')
    candidates = list((td / 'bin').rglob('rive'))
    if not candidates:
        raise SystemExit('Rive CLI binary not found in archive')
    rive = candidates[0]
    rive.chmod(0o755)

    def run(*args):
        print('\n===== rive ' + ' '.join(args) + ' =====')
        subprocess.run([str(rive), *args], check=False)

    proj = td / 'probe'
    subprocess.run([str(rive), 'create', str(proj)], check=True)
    print('\n===== RIVE SAMPLE scene.rml =====')
    print((proj / 'scene.rml').read_text(encoding='utf-8'))
    print('\n===== RIVE SAMPLE rive.yaml =====')
    print((proj / 'rive.yaml').read_text(encoding='utf-8'))

    for item in ['Image', 'ImageAsset', 'StateMachine', 'StateMachineLayer', 'StateMachineBool', 'StateMachineNumber', 'StateMachineTrigger', 'StateTransition', 'TransitionBoolCondition', 'TransitionNumberCondition', 'AnimationState', 'LinearAnimation', 'Shape', 'Rectangle', 'Ellipse', 'SolidColor']:
        run('schema', item)
    for topic in ['assets', 'state-machines', 'animations', 'images', 'project-config']:
        run('docs', topic)
