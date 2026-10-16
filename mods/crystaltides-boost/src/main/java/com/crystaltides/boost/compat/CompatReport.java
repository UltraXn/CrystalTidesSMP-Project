package com.crystaltides.boost.compat;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;

/**
 * Rendering / performance mods detected at pre-launch (from the mixin config plugin, before any
 * Minecraft class is loaded). Mod IDs are the same on Fabric and NeoForge.
 *
 * Only external frame limiters change what CrystalTides Boost applies: Sodium/Embeddium,
 * Iris/Oculus and ImmediatelyFast are compatible with every mixin (see README) and are only
 * reported for diagnostics.
 */
public record CompatReport(
    boolean sodium,
    boolean embeddium,
    boolean iris,
    boolean oculus,
    boolean immediatelyFast,
    boolean dynamicFps,
    boolean fpsReducer,
    boolean lithium,
    boolean ferriteCore
) {

    public static final String SODIUM = "sodium";
    public static final String EMBEDDIUM = "embeddium";
    public static final String IRIS = "iris";
    public static final String OCULUS = "oculus";
    public static final String IMMEDIATELY_FAST = "immediatelyfast";
    public static final String DYNAMIC_FPS = "dynamic_fps";
    public static final String FPS_REDUCER = "fpsreducer";
    public static final String LITHIUM = "lithium";
    public static final String FERRITE_CORE = "ferritecore";

    public static CompatReport detect(Predicate<String> isModLoaded) {
        return new CompatReport(
            isModLoaded.test(SODIUM),
            isModLoaded.test(EMBEDDIUM),
            isModLoaded.test(IRIS),
            isModLoaded.test(OCULUS),
            isModLoaded.test(IMMEDIATELY_FAST),
            isModLoaded.test(DYNAMIC_FPS),
            isModLoaded.test(FPS_REDUCER),
            isModLoaded.test(LITHIUM),
            isModLoaded.test(FERRITE_CORE)
        );
    }

    public static CompatReport none() {
        return new CompatReport(false, false, false, false, false, false, false, false, false);
    }

    /**
     * Another mod already throttles the frame rate (and volume) in the background: running both would
     * have two limiters fighting over Minecraft#getFramerateLimit.
     */
    public boolean hasExternalFrameLimiter() {
        return dynamicFps || fpsReducer;
    }

    /** Detected mod IDs, for the startup diagnostic line. */
    public List<String> detectedMods() {
        List<String> mods = new ArrayList<>();
        addIf(mods, sodium, SODIUM);
        addIf(mods, embeddium, EMBEDDIUM);
        addIf(mods, iris, IRIS);
        addIf(mods, oculus, OCULUS);
        addIf(mods, immediatelyFast, IMMEDIATELY_FAST);
        addIf(mods, dynamicFps, DYNAMIC_FPS);
        addIf(mods, fpsReducer, FPS_REDUCER);
        addIf(mods, lithium, LITHIUM);
        addIf(mods, ferriteCore, FERRITE_CORE);
        return mods;
    }

    private static void addIf(List<String> mods, boolean present, String modId) {
        if (present) {
            mods.add(modId);
        }
    }
}
