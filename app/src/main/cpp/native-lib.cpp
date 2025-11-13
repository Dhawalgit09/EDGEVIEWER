#include <jni.h>
#include <opencv2/opencv.hpp>
#include <android/log.h>
#include <mutex>
#include <algorithm>

#define LOG_TAG "EdgeViewer"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__);

namespace {
struct EdgeConfig {
    double lowThreshold = 60.0;
    double highThreshold = 180.0;
    int blurKernel = 5;
    bool equalizeHistogram = true;
};

EdgeConfig gConfig;
std::mutex gConfigMutex;

int sanitizeKernel(int kernel) {
    if (kernel <= 1) {
        return 1;
    }
    if (kernel % 2 == 0) {
        kernel += 1;
    }
    return std::min(kernel, 15); // keep kernel reasonable
}
} // namespace

extern "C"
JNIEXPORT jbyteArray JNICALL
Java_com_example_edgeviewer_nativeproc_NativeProcessor_processRgba(
        JNIEnv *env,
        jclass /*clazz*/,
        jbyteArray input,
        jint width,
        jint height) {

    jbyte *inData = env->GetByteArrayElements(input, nullptr);
    cv::Mat rgba(height, width, CV_8UC4, reinterpret_cast<uchar *>(inData));

    EdgeConfig config;
    {
        std::lock_guard<std::mutex> lock(gConfigMutex);
        config = gConfig;
    }

    cv::Mat gray;
    cv::cvtColor(rgba, gray, cv::COLOR_RGBA2GRAY);

    if (config.equalizeHistogram) {
        cv::equalizeHist(gray, gray);
    }

    cv::Mat blurred;
    const int kernel = sanitizeKernel(config.blurKernel);
    if (kernel > 1) {
        cv::GaussianBlur(gray, blurred, cv::Size(kernel, kernel), 0);
    } else {
        blurred = gray;
    }

    cv::Mat edges;
    cv::Canny(blurred, edges, config.lowThreshold, config.highThreshold);

    cv::Mat output;
    rgba.copyTo(output);
    output.setTo(cv::Scalar(0, 255, 0, 255), edges);

    int size = static_cast<int>(output.total() * output.elemSize());
    jbyteArray result = env->NewByteArray(size);
    env->SetByteArrayRegion(result, 0, size, reinterpret_cast<jbyte *>(output.data));

    env->ReleaseByteArrayElements(input, inData, JNI_ABORT);

    return result;
}

extern "C"
JNIEXPORT void JNICALL
Java_com_example_edgeviewer_nativeproc_NativeProcessor_setEdgeParameters(
        JNIEnv *env,
        jclass /*clazz*/,
        jdouble low,
        jdouble high,
        jint blurRadius,
        jboolean equalizeHistogram) {

    std::lock_guard<std::mutex> lock(gConfigMutex);
    gConfig.lowThreshold = std::max(0.0, low);
    gConfig.highThreshold = std::max(gConfig.lowThreshold, high);
    gConfig.blurKernel = sanitizeKernel(blurRadius);
    gConfig.equalizeHistogram = equalizeHistogram == JNI_TRUE;
}
