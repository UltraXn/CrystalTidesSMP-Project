pub mod thread_qos;

use jni::JNIEnv;
use jni::objects::{JClass, JString};
use jni::sys::{jboolean, jstring};

#[no_mangle]
pub extern "system" fn Java_com_crystaltides_agent_CrystalAgent_nativeInit(
    mut env: JNIEnv,
    _class: JClass,
    input: JString,
) -> jstring {
    let input_str: String = match env.get_string(&input) {
        Ok(s) => s.into(),
        Err(_) => "default".to_string(),
    };

    let qos_status = thread_qos::optimize_current_thread(true)
        .unwrap_or_else(|e| format!("QoS error: {}", e));

    let output = format!(
        "🦀 [Rust Core] Native Game Bridge v2.0 initialized (signal: {}). QoS: {}",
        input_str, qos_status
    );

    match env.new_string(output) {
        Ok(js) => js.into_raw(),
        Err(e) => {
            let _ = env.throw_new(
                "java/lang/RuntimeException",
                format!("Failed to create JNI string: {}", e),
            );
            std::ptr::null_mut()
        }
    }
}

/// Optimizes the caller thread with Above Normal priority and EcoQoS bypass
#[no_mangle]
pub extern "system" fn Java_com_crystaltides_agent_CrystalAgent_nativeOptimizeCurrentThread(
    mut env: JNIEnv,
    _class: JClass,
    above_normal: jboolean,
) -> jstring {
    let res = thread_qos::optimize_current_thread(above_normal != 0)
        .unwrap_or_else(|e| format!("Error: {}", e));

    match env.new_string(res) {
        Ok(js) => js.into_raw(),
        Err(e) => {
            let _ = env.throw_new(
                "java/lang/RuntimeException",
                format!("Failed to create JNI string: {}", e),
            );
            std::ptr::null_mut()
        }
    }
}


