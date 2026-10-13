package net.minecraft.world.level;

public class ChunkPos {
    public final int x;
    public final int z;

    public ChunkPos(int x, int z) {
        this.x = x;
        this.z = z;
    }

    public long toLong() {
        return ((long) this.x & 0xFFFFFFFFL) | (((long) this.z & 0xFFFFFFFFL) << 32);
    }
}
