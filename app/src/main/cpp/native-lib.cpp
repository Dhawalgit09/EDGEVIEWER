#include <jni.h>
#include <opencv2/opencv.hpp>
#include <android/log.h>

#define LOG_TAG "EdgeViewer"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__);

extern "C"
JNIEXPORT jbyteArray JNICALL
Java_com_example_edgeviewer_nativeproc_NativeProcessor_processRgba(
        JNIEnv *env,
        jclass /*clazz*/,
        jbyteArray input,
        jint width,
        jint height) {

    jbyte* inData = env->GetByteArrayElements(input, NULL);
    cv::Mat rgba(height, width, CV_8UC4, (uchar*) inData);
    cv::Mat gray, edges;

    cv::cvtColor(rgba, gray, cv::COLOR_RGBA2GRAY);
    cv::Canny(gray, edges, 50, 150);

    cv::Mat out;
    cv::cvtColor(edges, out, cv::COLOR_GRAY2RGBA);

    int size = out.total() * out.elemSize();
    jbyteArray output = env->NewByteArray(size);
    env->SetByteArrayRegion(output, 0, size, (jbyte*) out.data);

    env->ReleaseByteArrayElements(input, inData, JNI_ABORT);

    return output;
}
