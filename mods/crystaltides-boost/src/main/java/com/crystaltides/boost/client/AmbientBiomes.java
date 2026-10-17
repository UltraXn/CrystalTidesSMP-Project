package com.crystaltides.boost.client;

import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.core.Holder;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.chunk.LevelChunkSection;
import net.minecraft.world.level.chunk.status.ChunkStatus;

import java.util.function.Predicate;

/**
 * Tells whether any biome around the player can spawn ambient particles, so ClientLevel#doAnimateTick
 * can skip its biome lookup when none can.
 *
 * doAnimateTick runs about 26,700 times per second (1,334 random positions per client tick) and, for
 * every non-solid position, resolves the biome through BiomeManager#getBiome (eight fiddled-distance
 * evaluations) and allocates a capturing lambda, only to find an empty Optional in every biome without
 * ambient particles: in vanilla that is every biome outside the Nether. Biome palettes are tiny, so
 * checking those of the nearby chunk sections once per second costs microseconds.
 */
public final class AmbientBiomes {

    /** doAnimateTick samples up to 32 blocks away; biome fuzzing can pick a cell one quart (4 blocks) further. */
    static final int RADIUS = 36;
    /** Client ticks between rescans: a biome with particles is noticed within a second. */
    public static final int RESCAN_TICKS = 20;

    // Non-capturing: a single instance, so scanning allocates nothing. 1.21.11 moved ambient particles
    // into the environment attribute system (dimension, biome, timeline and weather layers), where the
    // biome alone does not decide; there AmbientParticleMixin is not applied (VersionSupport) and
    // answering "may have" keeps vanilla behavior.
    private static final Predicate<Holder<Biome>> HAS_AMBIENT_PARTICLES =
        //? if <1.21.11 {
        biome -> biome.value().getAmbientParticle().isPresent();
        //?} else {
        /*biome -> true;
        *///?}

    private AmbientBiomes() {
    }

    /** True if a loaded chunk section within {@link #RADIUS} blocks may contain a biome with ambient particles. */
    public static boolean anyNearby(ClientLevel level, int x, int y, int z) {
        int minSection = Math.max(0, level.getSectionIndex(y - RADIUS));
        int maxSection = level.getSectionIndex(y + RADIUS);
        for (int chunkX = (x - RADIUS) >> 4; chunkX <= (x + RADIUS) >> 4; chunkX++) {
            for (int chunkZ = (z - RADIUS) >> 4; chunkZ <= (z + RADIUS) >> 4; chunkZ++) {
                LevelChunk chunk = level.getChunkSource().getChunk(chunkX, chunkZ, ChunkStatus.FULL, false);
                if (chunk != null && sectionsMayHaveAmbientBiome(chunk.getSections(), minSection, maxSection)) {
                    return true;
                }
            }
        }
        return false;
    }

    /** Palette check only: a global (non-indexed) biome palette reports true, keeping vanilla behavior. */
    private static boolean sectionsMayHaveAmbientBiome(LevelChunkSection[] sections, int minSection, int maxSection) {
        int last = Math.min(sections.length - 1, maxSection);
        for (int index = minSection; index <= last; index++) {
            if (sections[index].getBiomes().maybeHas(HAS_AMBIENT_PARTICLES)) {
                return true;
            }
        }
        return false;
    }
}
