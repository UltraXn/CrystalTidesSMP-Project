package net.minecraft.world.level.block.entity;

import net.minecraft.core.BlockPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.state.BlockState;

public abstract class BlockEntity {
    public Level getLevel() {
        return null;
    }

    public BlockPos getBlockPos() {
        return null;
    }

    public BlockState getBlockState() {
        return null;
    }
}
