package com.crystaltides.boost.mixin;

import com.mojang.blaze3d.vertex.PoseStack;
import net.minecraft.client.Minecraft;
import net.minecraft.client.renderer.MultiBufferSource;
import net.minecraft.client.renderer.blockentity.ChestRenderer;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.ChestBlock;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.entity.LidBlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * ChestOcclusionMixin - High-performance block entity occlusion & hibernation for containers.
 *
 * In vanilla Minecraft and heavily modded storage facilities, hundreds of chests, trapped chests,
 * and ender chests are dynamically rendered on every frame using expensive PoseStack matrix
 * pushes, normal transformations, and individual draw calls.
 *
 * This mixin performs fast, zero-allocation spatial checks to cull invisible or hibernating chests:
 * 1. Fully-Enclosed Occlusion: Cancels rendering if all exposed faces are surrounded by solid terrain.
 * 2. Front & Top Obstructed Culling: Cancels if both the top lid and facing front are solid-blocked.
 * 3. Distance & Lid Hibernation: Bypasses rendering for distant obstructed chests with closed lids.
 */
@SuppressWarnings({"java:S100", "PMD.UnusedPrivateMethod", "PMD.UnusedFormalParameter", "PMD.AbstractClassWithoutAbstractMethod"})
@Mixin(ChestRenderer.class)
public abstract class ChestOcclusionMixin<T extends BlockEntity> {

    @Unique
    private static final double MAX_OBSTRUCTED_DIST_SQ = 4096.0; // 64 blocks

    @Inject(
        method = "render(Lnet/minecraft/world/level/block/entity/BlockEntity;FLcom/mojang/blaze3d/vertex/PoseStack;Lnet/minecraft/client/renderer/MultiBufferSource;II)V",
        at = @At("HEAD"),
        cancellable = true
    )
    private void crystaltides$cullObstructedChest(
        T blockEntity,
        float partialTick,
        PoseStack poseStack,
        MultiBufferSource bufferSource,
        int packedLight,
        int packedOverlay,
        CallbackInfo ci
    ) {
        if (blockEntity == null) {
            return;
        }

        Level level = blockEntity.getLevel();
        if (level == null) {
            return;
        }

        BlockPos pos = blockEntity.getBlockPos();
        BlockPos abovePos = pos.above();
        BlockState aboveState = level.getBlockState(abovePos);
        boolean isTopSolid = aboveState.isSolidRender(level, abovePos);

        // 1. Direct top obstruction check: if top is solid, chest cannot physically open
        if (isTopSolid) {
            BlockState chestState = blockEntity.getBlockState();

            // Check if front face is also blocked by a solid opaque block
            if (chestState.hasProperty(ChestBlock.FACING)) {
                Direction facing = chestState.getValue(ChestBlock.FACING);
                BlockPos frontPos = pos.relative(facing);
                if (level.getBlockState(frontPos).isSolidRender(level, frontPos)) {
                    // Both top and front are completely covered by solid blocks -> invisible/inoperable
                    ci.cancel();
                    return;
                }
            }

            // Check omnidirectional solid enclosure (buried chests / walls)
            if (crystaltides$isSurroundedBySolids(level, pos)) {
                ci.cancel();
                return;
            }

            // Distance culling for top-obstructed closed chests beyond 64 blocks
            if (blockEntity instanceof LidBlockEntity lid && lid.getOpenNess(partialTick) <= 0.001f) {
                Minecraft mc = Minecraft.getInstance();
                if (mc != null && mc.gameRenderer != null && mc.gameRenderer.getMainCamera() != null) {
                    Vec3 cam = mc.gameRenderer.getMainCamera().getPosition();
                    if (cam != null) {
                        double dx = (pos.getX() + 0.5) - cam.x;
                        double dy = (pos.getY() + 0.5) - cam.y;
                        double dz = (pos.getZ() + 0.5) - cam.z;
                        double distSq = dx * dx + dy * dy + dz * dz;
                        if (distSq > MAX_OBSTRUCTED_DIST_SQ) {
                            ci.cancel();
                        }
                    }
                }
            }
        }
    }

    @Unique
    private static boolean crystaltides$isSurroundedBySolids(Level level, BlockPos pos) {
        // Check UP, NORTH, SOUTH, EAST, WEST (excluding DOWN which is usually floor)
        return level.getBlockState(pos.north()).isSolidRender(level, pos.north())
            && level.getBlockState(pos.south()).isSolidRender(level, pos.south())
            && level.getBlockState(pos.east()).isSolidRender(level, pos.east())
            && level.getBlockState(pos.west()).isSolidRender(level, pos.west());
    }
}
