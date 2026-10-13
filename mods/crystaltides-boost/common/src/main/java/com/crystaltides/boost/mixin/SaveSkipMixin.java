package com.crystaltides.boost.mixin;

import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.chunk.storage.RegionFile;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import java.nio.ByteBuffer;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.zip.CRC32C;

/**
 * SaveSkipMixin - Hash-based chunk autosave skip.
 *
 * During periodic autosaves (every 45s / 900 ticks), vanilla Minecraft serializes and
 * writes all loaded chunks to disk even if blocks and entities haven't changed.
 *
 * SaveSkip computes a fast hardware-accelerated CRC32C checksum of the chunk payload.
 * If the checksum is identical to the last written state, the disk I/O operation is
 * skipped entirely, eliminating severe frame drops (micro-stutter) with shaders.
 * Includes automatic cache bound pruning to guarantee zero memory bloat.
 */
@SuppressWarnings({"java:S100", "PMD.UnusedPrivateMethod", "PMD.AbstractClassWithoutAbstractMethod"})
@Mixin(RegionFile.class)
public abstract class SaveSkipMixin {

    @Unique
    private static final int MAX_CACHE_ENTRIES = 8192;

    @Unique
    private static final Map<Long, Long> CHUNK_CHECKSUMS = new ConcurrentHashMap<>(4096);

    @Inject(
        method = "write(Lnet/minecraft/world/level/ChunkPos;Ljava/nio/ByteBuffer;)V",
        at = @At("HEAD"),
        cancellable = true
    )
    private void crystaltides$onChunkWrite(ChunkPos pos, ByteBuffer buffer, CallbackInfo ci) {
        if (buffer == null || !buffer.hasRemaining()) {
            return;
        }

        long chunkKey = pos.toLong();

        // Calculate hardware-accelerated CRC32C of the chunk payload bytes
        CRC32C crc = new CRC32C();
        int initialPosition = buffer.position();
        crc.update(buffer);
        buffer.position(initialPosition); // Restore position for downstream write if needed

        long currentHash = crc.getValue();
        Long previousHash = CHUNK_CHECKSUMS.get(chunkKey);

        if (previousHash != null && previousHash == currentHash) {
            // Unchanged chunk payload -> Skip expensive SSD write
            ci.cancel();
            return;
        }

        // Periodic pruning if cache exceeds maximum capacity
        if (CHUNK_CHECKSUMS.size() > MAX_CACHE_ENTRIES) {
            CHUNK_CHECKSUMS.clear();
        }

        // Cache the newly written checksum
        CHUNK_CHECKSUMS.put(chunkKey, currentHash);
    }
}
