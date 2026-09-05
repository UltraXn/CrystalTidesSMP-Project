use jni::JNIEnv;
use jni::objects::{JClass, JString};
use jni::sys::jstring;

#[no_mangle]
pub extern "system" fn Java_com_crystaltides_agent_CrystalAgent_nativeInit(
    mut env: JNIEnv,
    _class: JClass,
    input: JString,
) -> jstring {
    let input: String = env
        .get_string(&input)
        .expect("Couldn't get java string!")
        .into();

    let output = format!("🦀 [Rust Core] Native logic active! Incoming signal: {}", input);
    
    let response = env
        .new_string(output)
        .expect("Couldn't create java string!");
    
    response.into_raw()
}
