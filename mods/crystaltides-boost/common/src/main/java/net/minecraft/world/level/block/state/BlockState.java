package net.minecraft.world.level.block.state;

import net.minecraft.core.BlockPos;
import net.minecraft.world.level.Level;

public class BlockState {
    public boolean isSolidRender(Level level, BlockPos pos) {
        return false;
    }

    public boolean hasProperty(Object property) {
        return false;
    }

    public <T extends Comparable<T>> T getValue(Object property) {
        return null;
    }
}
