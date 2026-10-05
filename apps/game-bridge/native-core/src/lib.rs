pub mod fsr;
pub mod interop;
pub mod thread_qos;

use jni::JNIEnv;
use jni::objects::{JClass, JString};
use jni::sys::{jboolean, jfloat, jint, jstring};

#[no_mangle]
pub extern "system" fn Java_com_crystaltides_agent_CrystalAgent_nativeInit(
    mut env: JNIEnv,
    _class: JClass,
    input: JString,
) -> jstring {
    let input: String = match env.get_string(&input) {
        Ok(s) => s.into(),
        Err(_) => "default".to_string(),
    };

    // Initialize FSR 3.1 runtime engine
    fsr::init_fsr_engine();

    let output = format!(
        "🦀 [Rust Core] Native Game Bridge v2.0 & FSR 3.1 Frame Gen Active! Signal: {}",
        input
    );

    let response = env
        .new_string(output)
        .expect("Couldn't create java string!");

    response.into_raw()
}

/// Optimizes the caller thread (Render Thread) with Time Critical priority and EcoQoS bypass
#[no_mangle]
pub extern "system" fn Java_com_crystaltides_agent_CrystalAgent_nativeOptimizeCurrentThread(
    env: JNIEnv,
    _class: JClass,
    time_critical: jboolean,
) -> jstring {
    let res = thread_qos::optimize_current_thread(time_critical != 0)
        .unwrap_or_else(|e| format!("Error: {}", e));

    let response = env.new_string(res).expect("Couldn't create java string!");
    response.into_raw()
}

/// Dynamically updates FSR 3.1 configuration
#[no_mangle]
pub extern "system" fn Java_com_crystaltides_agent_CrystalAgent_nativeSetFsrConfig(
    _env: JNIEnv,
    _class: JClass,
    enabled: jboolean,
    frame_gen: jboolean,
    render_scale: jfloat,
    target_fps: jint,
    sharpness: jfloat,
) -> jboolean {
    let config = fsr::FsrConfig {
        enabled: enabled != 0,
        frame_gen_enabled: frame_gen != 0,
        render_scale,
        target_fps: target_fps as u32,
        sharpness,
        motion_vector_mode: "OpticalFlowEstimated".to_string(),
    };

    fsr::update_fsr_config(config);
    1 // true
}

/// Returns real-time FSR 3.1 & Frame Generation telemetry as a JSON string
#[no_mangle]
pub extern "system" fn Java_com_crystaltides_agent_CrystalAgent_nativeGetFsrTelemetry(
    env: JNIEnv,
    _class: JClass,
) -> jstring {
    let telemetry = fsr::get_telemetry();
    let json_str = serde_json::to_string(&telemetry).unwrap_or_else(|_| "{}".to_string());

    let response = env.new_string(json_str).expect("Couldn't create java string!");
    response.into_raw()
}

/// Connects the active OpenGL framebuffer texture with the WGL_NV_DX_interop2 zero-copy bridge
#[no_mangle]
pub extern "system" fn Java_com_crystaltides_agent_CrystalAgent_nativeInitInterop(
    env: JNIEnv,
    _class: JClass,
    texture_id: jint,
    width: jint,
    height: jint,
) -> jstring {
    let res = interop::init_interop(texture_id as u32, width as u32, height as u32)
        .unwrap_or_else(|e| format!("Interop error: {}", e));

    let response = env.new_string(res).expect("Couldn't create java string!");
    response.into_raw()
}

/// Records a presented frame to maintain frametime pacing and synthetic frame generation counts
#[no_mangle]
pub extern "system" fn Java_com_crystaltides_agent_CrystalAgent_nativeRecordFrame(
    _env: JNIEnv,
    _class: JClass,
) {
    fsr::record_presented_frame();
}
