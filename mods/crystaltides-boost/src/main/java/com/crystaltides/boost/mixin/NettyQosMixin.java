package com.crystaltides.boost.mixin;

import com.crystaltides.boost.client.ThreadQos;
import io.netty.channel.ChannelHandlerContext;
import net.minecraft.network.Connection;
import net.minecraft.network.protocol.PacketFlow;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * NettyQosMixin - Raises the client Netty IO thread priority (default 7, ABOVE_NORMAL on Windows).
 * Target: Connection.channelActive(ChannelHandlerContext).
 *
 * The client event loop groups ("Netty Client IO #%d", epoll and local variants) are created in
 * lambdas of Connection's static initializer, whose synthetic names are not stable. channelActive is
 * a stable public override that Netty always invokes on the event loop thread serving the channel,
 * so the priority is set on exactly the thread that decodes and decompresses that connection's packets.
 * Server-side connections of the integrated server are skipped (receiving != CLIENTBOUND).
 * Once per connection and idempotent per thread: not a hot path.
 */
@Mixin(value = Connection.class, priority = 950)
public abstract class NettyQosMixin {

    @Shadow
    @Final
    private PacketFlow receiving;

    @Inject(method = "channelActive", at = @At("HEAD"))
    private void crystaltides$raiseClientIoPriority(ChannelHandlerContext context, CallbackInfo ci) {
        if (this.receiving == PacketFlow.CLIENTBOUND) {
            ThreadQos.applyToCurrent("Netty client IO", ThreadQos.Settings.NETWORK_PRIORITY);
        }
    }
}
