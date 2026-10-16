pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
        maven("https://maven.fabricmc.net/") { name = "FabricMC" }
        maven("https://maven.neoforged.net/releases/") { name = "NeoForged" }
        maven("https://maven.kikugie.dev/releases") { name = "KikuGie Releases" }
    }
}

plugins {
    id("dev.kikugie.stonecutter") version "0.9.8"
    // Applies Loom with remapping on obfuscated versions (1.21.x) and the non-remapping Loom on 26.1+
    id("dev.kikugie.loom-back-compat") version "0.4.2"
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

stonecutter {
    create(rootProject) {
        // One node per Minecraft version and loader: versions/{version}-{loader}, built by
        // build.{loader}.gradle.kts. Each node compiles against one release and declares the range of
        // releases it supports in stonecutter.properties.toml.
        fun match(version: String, vararg loaders: String) {
            for (loader in loaders) version("$version-$loader", version).buildscript("build.$loader.gradle.kts")
        }

        // Each group covers a Minecraft drop and its hotfixes and builds against the newest of them;
        // the supported range of every group is in stonecutter.properties.toml
        match("1.21.1", "fabric", "neoforge")  // 1.21 - 1.21.1
        match("1.21.3", "fabric", "neoforge")  // 1.21.2 - 1.21.3
        match("1.21.4", "fabric", "neoforge")
        match("1.21.5", "fabric", "neoforge")
        match("1.21.8", "fabric", "neoforge")  // 1.21.6 - 1.21.8
        match("1.21.10", "fabric", "neoforge") // 1.21.9 - 1.21.10
        match("1.21.11", "fabric", "neoforge")
        match("26.1.2", "fabric", "neoforge")  // 26.1 - 26.1.2
        match("26.2", "fabric", "neoforge")
        match("26.3", "fabric", "neoforge")
        vcsVersion = "1.21.1-fabric"
    }
}

rootProject.name = "crystaltides-boost"
