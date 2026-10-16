import org.gradle.api.services.BuildService
import org.gradle.api.services.BuildServiceParameters

// Decompiling and patching Minecraft for several NeoForge versions at once exhausts memory:
// run createMinecraftArtifacts one node at a time.
interface NeoForgeMutex : BuildService<BuildServiceParameters.None>

val mutex = gradle.sharedServices.registerIfAbsent("createMinecraftArtifactsMutex", NeoForgeMutex::class.java) {
    maxParallelUsages.set(1)
}

tasks.named { it == "createMinecraftArtifacts" }.configureEach {
    usesService(mutex)
}
