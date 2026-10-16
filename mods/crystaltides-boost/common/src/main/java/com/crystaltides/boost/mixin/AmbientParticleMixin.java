package com.crystaltides.boost.mixin;

import com.crystaltides.boost.client.AmbientBiomes;
import com.llamalad7.mixinextras.injector.ModifyExpressionValue;
import net.minecraft.client.multiplayer.ClientLevel;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * AmbientParticleMixin - Skips ClientLevel#doAnimateTick's biome ambient-particle lookup while no biome
 * around the player has ambient particles (see AmbientBiomes for the cost being avoided).
 * Targets: ClientLevel.animateTick(int, int, int) (once per client tick: rescan once per second) and the
 * isCollisionShapeFullBlock check that guards the biome lookup in ClientLevel.doAnimateTick.
 *
 * The guarded branch only spawns biome ambient particles, so treating the position as a full block
 * when no nearby biome has them changes nothing visible; block, fluid and marker particles are untouched.
 * Sodium and Iris do not modify doAnimateTick, so this also helps with them installed.
 * require = 0 on the call-site injector: if another mod rewrote that call, the biome lookup simply runs
 * as in vanilla instead of failing startup.
 */
@Mixin(value = ClientLevel.class, priority = 1050)
public abstract class AmbientParticleMixin {

    @Unique
    private int crystaltides$ambientRescanCountdown;

    @Unique
    private boolean crystaltides$ambientParticlesNearby = true;

    /** Non-cancellable and the CallbackInfo is unused, so Mixin passes null: no allocation. */
    @Inject(method = "animateTick", at = @At("HEAD"))
    private void crystaltides$rescanAmbientBiomes(int x, int y, int z, CallbackInfo ci) {
        if (--this.crystaltides$ambientRescanCountdown > 0) {
            return;
        }
        this.crystaltides$ambientRescanCountdown = AmbientBiomes.RESCAN_TICKS;
        this.crystaltides$ambientParticlesNearby = AmbientBiomes.anyNearby((ClientLevel) (Object) this, x, y, z);
    }

    @ModifyExpressionValue(
        method = "doAnimateTick",
        at = @At(
            value = "INVOKE",
            target = "Lnet/minecraft/world/level/block/state/BlockState;isCollisionShapeFullBlock(Lnet/minecraft/world/level/BlockGetter;Lnet/minecraft/core/BlockPos;)Z"
        ),
        require = 0
    )
    private boolean crystaltides$skipBiomeLookup(boolean fullBlock) {
        return fullBlock || !this.crystaltides$ambientParticlesNearby;
    }
}
