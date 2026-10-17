"""Checks that a remapped (Intermediary) Fabric jar has no Mojang-named references left in its mixins.

Loom 1.19 remaps @Mixin / @At / injector `method` strings straight in the bytecode instead of writing a
refmap, so a Mojmap name left in a mixin class means Mixin would not find the target in production.
Only meaningful for the obfuscated versions (1.21.x): 26.x runs on Mojang names.

usage: python3 -I tools/check_remap.py versions/1.21.1-fabric/build/libs/crystaltides-boost-fabric-1.21.1-<v>.jar [...]

When a mixin targets a new method, add its Mojang name to MOJMAP_TARGET_METHODS.
"""
import re
import struct
import sys
import zipfile

# Obfuscated in production: these must appear as net/minecraft/class_N / method_N / field_N
MOJMAP_CLASS = re.compile(r"(net/minecraft/(?!class_\d)[a-z]|com/mojang/(blaze3d|math)/)")
# Mojang names of the methods the mixins target; any of them left as a plain string was not remapped
MOJMAP_TARGET_METHODS = {
    "run", "runTick", "tick", "getFramerateLimit", "updateSource", "animateTick", "doAnimateTick",
    "isCollisionShapeFullBlock", "apply", "glGetUniformLocation", "getMaxThreads", "onGameLoadFinished",
    "countRenderedSections",
}


def utf8_constants(data):
    """Yields the CONSTANT_Utf8 strings of a class file."""
    count = struct.unpack(">H", data[8:10])[0]
    i, index = 10, 1
    while index < count:
        tag = data[i]
        if tag == 1:
            length = struct.unpack(">H", data[i + 1:i + 3])[0]
            yield data[i + 3:i + 3 + length].decode("utf-8", "replace")
            i += 3 + length
        elif tag in (3, 4, 9, 10, 11, 12, 17, 18):
            i += 5
        elif tag in (5, 6):
            i += 9
            index += 1
        elif tag in (7, 8, 16, 19, 20):
            i += 3
        elif tag == 15:
            i += 4
        else:
            raise ValueError(f"unknown constant tag {tag}")
        index += 1


def check(jar_path):
    problems = []
    names = []
    with zipfile.ZipFile(jar_path) as jar:
        for entry in jar.namelist():
            if not (entry.startswith("com/crystaltides/boost/mixin/") and entry.endswith("Mixin.class")):
                continue
            strings = list(utf8_constants(jar.read(entry)))
            bad = [s for s in strings if MOJMAP_CLASS.search(s) or s in MOJMAP_TARGET_METHODS]
            if bad:
                problems.append((entry, bad))
            # injector method names: the string after a "method" key in the annotations
            for key, value in zip(strings, strings[1:]):
                if key == "method":
                    names.append((entry.rsplit("/", 1)[1][:-6], value))
    return problems, names


ok = True
for path in sys.argv[1:]:
    problems, names = check(path)
    print(f"== {path.replace(chr(92), '/').rsplit('/', 1)[-1]}")
    for mixin, method in names:
        print(f"   {mixin:<30} method = {method}")
    for entry, bad in problems:
        ok = False
        print(f"   MOJMAP LEFT in {entry}: {bad[:4]}")
    if not problems:
        print("   OK: no Mojang-named references in the mixins")
sys.exit(0 if ok else 1)
