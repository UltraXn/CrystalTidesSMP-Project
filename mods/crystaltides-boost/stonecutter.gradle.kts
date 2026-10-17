plugins {
    id("dev.kikugie.stonecutter")
}

stonecutter active "1.21.1-fabric"

stonecutter parameters {
    val (version, loader) = current.project.split('-', limit = 2)

    // Version- and loader-specific values from stonecutter.properties.toml
    properties {
        tags(version, loader)
    }

    // `//? if fabric {` / `//? if neoforge {` in the sources
    constants {
        match(loader, "fabric", "neoforge")
    }
}
