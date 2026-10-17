plugins {
    id("net.neoforged.moddev") version "2.0.148"
    id("neoforge-mutex")
}

val mcVersion = sc.current.version
val nodeName = sc.current.project
val modVersion = property("mod.version") as String
val requiredJava = if (sc.current.parsed >= "26.1") JavaVersion.VERSION_25 else JavaVersion.VERSION_21

group = "com.crystaltides"
version = modVersion
base.archivesName = "crystaltides-boost-neoforge-$mcVersion"

repositories {
    exclusiveContent {
        forRepository { maven("https://api.modrinth.com/maven") { name = "Modrinth" } }
        filter { includeGroup("maven.modrinth") }
    }
}

dependencies {
    // NeoForge ships MixinExtras at runtime
    compileOnly("io.github.llamalad7:mixinextras-common:${property("deps.mixinextras")}")

    // -PcompatTest: Sodium + Iris + ImmediatelyFast in the dev client, from stonecutter.properties.toml
    if (providers.gradleProperty("compatTest").isPresent) {
        fun compat(key: String) = sc.properties.getOrNull<String>("compat.$key")
        compat("sodium")?.let { runtimeOnly("maven.modrinth:sodium:$it-neoforge") }
        compat("iris")?.let { runtimeOnly("maven.modrinth:iris:$it-neoforge") }
        compat("immediatelyfast")?.let { runtimeOnly("maven.modrinth:immediatelyfast:$it-neoforge") }
        if (providers.gradleProperty("compatDynamicFps").isPresent) {
            compat("dynamic_fps")?.let { runtimeOnly("maven.modrinth:dynamic-fps:$it") }
        }
    }
}

neoForge {
    version = property("deps.neoforge") as String

    mods {
        register("crystaltides_boost") {
            sourceSet(sourceSets.main.get())
        }
    }

    runs {
        register("client") {
            client()
            // One directory per node: worlds and options.txt from a newer version can break an older one
            gameDirectory = rootProject.file("runs/$nodeName")
            jvmArgument("-Dmixin.debug.verbose=true")
            // -PmixinExport: dumps transformed classes to .mixin.out in the run directory
            if (providers.gradleProperty("mixinExport").isPresent) jvmArgument("-Dmixin.debug.export=true")
            // -PmixinStrict: injections without targets become errors, even optional ones (require = 0).
            // Do not combine with -PcompatTest: compatibility mods rely on optional injectors.
            if (providers.gradleProperty("mixinStrict").isPresent) jvmArgument("-Dmixin.debug.countInjections=true")
            // -PagentJar=<path>/game-bridge.jar: attach the launcher agent to exercise the telemetry mixins
            providers.gradleProperty("agentJar").orNull?.let { jvmArgument("-javaagent:$it") }
            // -PquickPlay=<host:port>: connect on startup (opens a client Netty connection for NettyQosMixin)
            providers.gradleProperty("quickPlay").orNull?.let { programArguments.addAll("--quickPlayMultiplayer", it) }
        }
    }
}

java {
    withSourcesJar()
    sourceCompatibility = requiredJava
    targetCompatibility = requiredJava
    toolchain.languageVersion = JavaLanguageVersion.of(requiredJava.majorVersion)
}

tasks {
    processResources {
        val props = mapOf(
            "version" to modVersion,
            "minecraft" to sc.properties.get<String>("mod.mc_compat"),
            "neoforge" to sc.properties.get<String>("mod.neoforge_compat"),
            "java" to "JAVA_${requiredJava.majorVersion}",
        )
        inputs.properties(props)
        filesMatching(listOf("META-INF/neoforge.mods.toml", "*.mixins.json")) { expand(props) }
        exclude("fabric.mod.json")
    }

    named("createMinecraftArtifacts") {
        dependsOn("stonecutterGenerate")
    }

    // The unit tests are loader-independent and run on the Fabric nodes
    named { it == "compileTestJava" || it == "test" }.configureEach {
        enabled = false
    }

    // Reproducible jars: the launcher embeds them and pins their SHA-256 (assets/MANIFEST.md), so
    // rebuilding unchanged code must not change the hash
    withType<AbstractArchiveTask>().configureEach {
        isPreserveFileTimestamps = false
        isReproducibleFileOrder = true
    }

    withType<Jar>().configureEach {
        manifest.attributes(
            "Specification-Title" to "CrystalTides Boost",
            "Specification-Vendor" to "CrystalTides Team",
            "Specification-Version" to modVersion,
            "Implementation-Title" to "neoforge",
            "Implementation-Version" to modVersion,
            "Implementation-Vendor" to "CrystalTides Team",
            "Built-On-Minecraft" to mcVersion,
        )
    }
}
