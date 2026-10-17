"""Checks the client log of a runtime test (CI job "Runtime"): the mod loaded, applied the mixins its
Minecraft version supports, and logged no mixin errors or warnings of its own.

usage: python3 -I tools/check_runtime_log.py run/logs/latest.log --group 1.21.1

--group is the version group (Stonecutter node) of the jar under test. Mixins that depend on the
launcher agent, on optional settings or on debug flags are not checked here.
"""
import argparse
import re
import sys

# Applied on every Minecraft version with the default config
ALWAYS = [
    "ThreadQosMixin", "SoundEngineQosMixin", "NettyQosMixin", "BackgroundEcoMixin",
    "AnimatedTextureCullingMixin", "BackgroundWorkerLimitMixin",
]
# Mixin -> first version group without it. Keep in sync with VersionSupport.
VERSION_BOUND = {
    "ShaderSamplerCacheMixin": "1.21.2",
    "AmbientParticleMixin": "1.21.11",
    "FrameYieldMixin": "26.1",
}
NOT_IN_THIS_VERSION = "not present in this Minecraft version"
# Lines that only appear once the mixin really ran in the game
RUNTIME_EVIDENCE = {
    "BackgroundWorkerLimitMixin": "[Workers] background pool",
    "ThreadQosMixin": "[ThreadQoS] Render thread",
    "NettyQosMixin": "[ThreadQoS] Netty client IO",
}
MIXIN_ERROR = re.compile(
    r"InvalidInjectionException|InvalidMixinException|InvalidAccessorException|Critical injection failure"
    r"|Mixin apply .*failed|MixinApplyError|MixinTransformerError", re.IGNORECASE)
# Harmless: Mixin builds whose highest "official" level is JAVA_13 (Fabric Loader 0.16, for one) warn
# about JAVA_21/JAVA_25 and still apply the mixins
HARMLESS_WARNING = re.compile(r"Compatibility level JAVA_\d+ specified by crystaltides-boost\.common\.mixins\.json is higher than")
# Lines from or about this mod: its logger ("(crystaltides-boost)" on Fabric, "[crystaltides-boost/]" on
# NeoForge), its messages, its classes or its mixin config. Not a bare "crystaltides": the CI workspace
# path (CrystalTidesSMP-Project) shows up in other mods' and loaders' messages.
OURS = re.compile(r"\(crystaltides-boost\)|\[crystaltides-boost/|\[CrystalTides Boost\]|com\.crystaltides\.boost"
                  r"|crystaltides-boost\.common\.mixins\.json")


def version_key(version):
    return tuple(int(part) for part in version.split("."))


def check(lines, group):
    problems = []
    if not any("[CrystalTides Boost] Pre-launch on" in line for line in lines):
        return ["the mod did not load: no '[CrystalTides Boost] Pre-launch on' line"]

    enabled_line = next((line for line in lines if "[CrystalTides Boost] Mixins enabled:" in line), "")
    enabled = {name.strip() for name in enabled_line.split("Mixins enabled:", 1)[-1].split(",") if name.strip()}
    disabled = {}
    for line in lines:
        match = re.search(r"\[CrystalTides Boost\] Mixin disabled: (\w+) \((.*)\)\s*$", line)
        if match:
            disabled[match.group(1)] = match.group(2)

    for mixin in ALWAYS:
        if mixin not in enabled:
            problems.append(f"{mixin} should be enabled on {group} ({disabled.get(mixin, 'not listed')})")
    for mixin, first_without in VERSION_BOUND.items():
        if version_key(group) < version_key(first_without):
            if mixin not in enabled:
                problems.append(f"{mixin} should be enabled on {group} ({disabled.get(mixin, 'not listed')})")
        elif disabled.get(mixin) != NOT_IN_THIS_VERSION:
            problems.append(f"{mixin} should be disabled as '{NOT_IN_THIS_VERSION}' on {group}, got: {disabled.get(mixin, 'enabled')}")

    for mixin, evidence in RUNTIME_EVIDENCE.items():
        if mixin in enabled and not any(evidence in line for line in lines):
            problems.append(f"{mixin} is enabled but never ran: no '{evidence}' line")

    for line in lines:
        if not OURS.search(line):
            continue
        lowered = line.lower()
        if MIXIN_ERROR.search(line):
            problems.append("mixin error: " + line.strip()[:300])
        elif HARMLESS_WARNING.search(line):
            continue
        elif "/warn]" in lowered or "/error]" in lowered:
            problems.append("warning from the mod: " + line.strip()[:300])
    return problems


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("log")
    parser.add_argument("--group", required=True, help="version group of the jar under test, e.g. 1.21.1")
    args = parser.parse_args()
    with open(args.log, encoding="utf-8", errors="replace") as handle:
        lines = handle.read().splitlines()

    problems = check(lines, args.group)
    for line in lines:
        if "[CrystalTides Boost]" in line or "[ThreadQoS]" in line or "[Workers]" in line:
            print("  " + line.strip()[:220])
    if problems:
        print(f"\nFAILED ({len(problems)}):")
        for problem in problems:
            print("  - " + problem)
        return 1
    print(f"\nOK: CrystalTides Boost loaded and applied the mixins of the {args.group} group")
    return 0


if __name__ == "__main__":
    sys.exit(main())
