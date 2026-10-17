package com.crystaltides.boost.compat;

/**
 * Optimizations whose vanilla code only exists in some Minecraft versions. Every jar is built for one
 * version range, so {@link #CURRENT} is fixed at build time (Stonecutter) and MixinSelection skips what
 * this jar's Minecraft version does not have, logging why.
 *
 * @param shaderSamplerCache ShaderInstance#apply re-queries sampler locations: up to 1.21.1, since 1.21.2
 *                           replaced ShaderInstance
 * @param ambientParticles   ClientLevel#doAnimateTick reads ambient particles from the biome: up to
 *                           1.21.10, since 1.21.11 moved them to the environment attribute system
 * @param frameYield         Minecraft#runTick ends every frame with Thread.yield(): up to 1.21.11
 */
public record VersionSupport(boolean shaderSamplerCache, boolean ambientParticles, boolean frameYield) {

    /** Every optimization available: lets the tests check the configuration logic on any build. */
    public static final VersionSupport ALL = new VersionSupport(true, true, true);

    public static final VersionSupport CURRENT = new VersionSupport(
        //? if <1.21.2 {
        true,
        //?} else {
        /*false,
        *///?}
        //? if <1.21.11 {
        true,
        //?} else {
        /*false,
        *///?}
        //? if <26.1 {
        true
        //?} else {
        /*false
        *///?}
    );
}
