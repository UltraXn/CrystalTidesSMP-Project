package com.crystaltides.boost.client;

import org.lwjgl.glfw.GLFW;
import org.lwjgl.glfw.GLFWWindowIconifyCallback;

/**
 * GLFW side of {@link WindowStateTracker}, kept apart so that only this class needs LWJGL.
 * Main (render) thread only, as GLFW requires for glfwSet*Callback.
 */
final class GlfwIconifyHook {

    // Native upcall stub, created once. Freed by Window#close (Callbacks.glfwFreeCallbacks) with the window.
    private static GLFWWindowIconifyCallback callback;

    private GlfwIconifyHook() {
    }

    static void install(long window) {
        if (callback == null) {
            callback = GLFWWindowIconifyCallback.create(WindowStateTracker::onIconify);
        }
        // One JNI query for the initial state (the window may already be minimized), then events only
        boolean initiallyIconified = GLFW.glfwGetWindowAttrib(window, GLFW.GLFW_ICONIFIED) == GLFW.GLFW_TRUE;
        GLFWWindowIconifyCallback replaced = GLFW.glfwSetWindowIconifyCallback(window, callback);
        WindowStateTracker.attach(window, initiallyIconified, replaced == null ? null : replaced::invoke);
    }
}
