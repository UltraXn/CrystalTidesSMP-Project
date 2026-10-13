package net.minecraft.core;

public class BlockPos {
    private final int x;
    private final int y;
    private final int z;

    public BlockPos(int x, int y, int z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public BlockPos above() {
        return new BlockPos(this.x, this.y + 1, this.z);
    }

    public BlockPos relative(Direction direction) {
        return this;
    }

    public BlockPos north() {
        return new BlockPos(this.x, this.y, this.z - 1);
    }

    public BlockPos south() {
        return new BlockPos(this.x, this.y, this.z + 1);
    }

    public BlockPos east() {
        return new BlockPos(this.x + 1, this.y, this.z);
    }

    public BlockPos west() {
        return new BlockPos(this.x - 1, this.y, this.z);
    }

    public int getX() {
        return this.x;
    }

    public int getY() {
        return this.y;
    }

    public int getZ() {
        return this.z;
    }

    public long toLong() {
        return (((long) this.x & 0x3FFFFFF) << 38) | (((long) this.z & 0x3FFFFFF) << 12) | ((long) this.y & 0xFFF);
    }
}
