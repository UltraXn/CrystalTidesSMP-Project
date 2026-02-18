fn main() {
    // CRITICAL: Force rebuild if payload changes
    println!("cargo:rerun-if-changed=installer_payload.zip");
    
    slint_build::compile("ui/appwindow.slint").unwrap();
}
