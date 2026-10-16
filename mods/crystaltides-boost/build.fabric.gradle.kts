plugins {
    // Applies the Loom variant the Minecraft version needs (remapping only on obfuscated versions)
    id("dev.kikugie.loom-back-compat")
}

val mcVersion = sc.current.version
val nodeName = sc.current.project
val modVersion = property("mod.version") as String
val obfuscated = sc.current.parsed < "26.1"
val requiredJava = if (sc.current.parsed >= "26.1") JavaVersion.VERSION_25 else JavaVersion.VERSION_21

group = "com.crystaltides"
version = modVersion
base.archivesName = "crystaltides-boost-fabric-$mcVersion"

repositories {
    exclusiveContent {
        forRepository { maven("https://api.modrinth.com/maven") { name = "Modrinth" } }
        filter { includeGroup("maven.modrinth") }
    }
}

dependencies {
    minecraft("com.mojang:minecraft:$mcVersion")
    // Mojang mappings on obfuscated versions; 26.1+ ships with Mojang names
    loomx.applyMojangMappings()
    // `mod*` configurations also on 26.1+: loom-back-compat maps them to the plain ones
    modImplementation("net.fabricmc:fabric-loader:${property("deps.fabric_loader")}")

    // Fabric Loader ships MixinExtras at runtime. On remapped versions its annotation processor adds
    // the @ModifyReturnValue / @WrapWithCondition targets to the Intermediary refmap.
    val mixinExtras = property("deps.mixinextras") as String
    compileOnly("io.github.llamalad7:mixinextras-common:$mixinExtras")
    if (obfuscated) {
        annotationProcessor("io.github.llamalad7:mixinextras-fabric:$mixinExtras")
    }

    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testRuntimeOnly("org.slf4j:slf4j-simple:2.0.9")

    // -PcompatTest: Sodium + Iris in the dev client, from the versions in stonecutter.properties.toml.
    // ImmediatelyFast is exercised in the NeoForge runs: under Loom's dev runtime its jar-in-jar
    // library is not on the classpath and its Iris integration fails to initialize.
    if (providers.gradleProperty("compatTest").isPresent) {
        fun compat(key: String) = sc.properties.getOrNull<String>("compat.$key")
        compat("fabric_api")?.let { modLocalRuntime("net.fabricmc.fabric-api:fabric-api:$it") }
        compat("sodium")?.let { modLocalRuntime("maven.modrinth:sodium:$it-fabric") }
        compat("iris")?.let { modLocalRuntime("maven.modrinth:iris:$it-fabric") }
        if (providers.gradleProperty("compatDynamicFps").isPresent) {
            compat("dynamic_fps")?.let { modLocalRuntime("maven.modrinth:dynamic-fps:$it") }
        }
    }
}

loom {
    fabricModJsonPath = rootProject.file("src/main/resources/fabric.mod.json")

    runConfigs.all {
        generateRunConfig = true
        // One directory per node: worlds and options.txt from a newer version can break an older one
        runDirectory = rootProject.file("runs/$nodeName")
        jvmArguments.add("-Dmixin.debug.verbose=true")
        // -PmixinExport: dumps transformed classes to .mixin.out in the run directory
        if (providers.gradleProperty("mixinExport").isPresent) jvmArguments.add("-Dmixin.debug.export=true")
        // -PmixinStrict: injections without targets become errors, even optional ones (require = 0).
        // Do not combine with -PcompatTest: Sodium's NeoForge-only injectors are optional on Fabric.
        if (providers.gradleProperty("mixinStrict").isPresent) jvmArguments.add("-Dmixin.debug.countInjections=true")
        // -PagentJar=<path>/game-bridge.jar: attach the launcher agent to exercise the telemetry mixins
        providers.gradleProperty("agentJar").orNull?.let { jvmArguments.add("-javaagent:$it") }
        // -PjvmArgs="<args separated by spaces>": extra JVM flags, e.g. the launcher's GC setup for benchmarks
        providers.gradleProperty("jvmArgs").orNull?.trim()?.split(Regex("\\s+"))?.let { jvmArguments.addAll(it) }
        // -PjfrFile=<path>.jfr: Java Flight Recorder profile from 50 s after JVM start (past loading) for 150 s
        providers.gradleProperty("jfrFile").orNull?.let {
            jvmArguments.add("-XX:StartFlightRecording=filename=$it,settings=profile,delay=50s,duration=150s")
        }
        // -PquickPlay=<host:port>: connect on startup (opens a client Netty connection for NettyQosMixin)
        providers.gradleProperty("quickPlay").orNull?.let { programArguments.addAll("--quickPlayMultiplayer", it) }
        // -PquickPlayWorld=<save folder>: open that singleplayer world on startup (benchmarks)
        providers.gradleProperty("quickPlayWorld").orNull?.let { programArguments.addAll("--quickPlaySingleplayer", it) }
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
            "fabric_loader" to sc.properties.get<String>("mod.fabric_loader_min"),
            "java" to "JAVA_${requiredJava.majorVersion}",
        )
        inputs.properties(props)
        filesMatching(listOf("fabric.mod.json", "*.mixins.json")) { expand(props) }
        exclude("META-INF/neoforge.mods.toml")
    }

    test {
        useJUnitPlatform()
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
            "Implementation-Title" to "fabric",
            "Implementation-Version" to modVersion,
            "Implementation-Vendor" to "CrystalTides Team",
            "Built-On-Minecraft" to mcVersion,
        )
    }
}
