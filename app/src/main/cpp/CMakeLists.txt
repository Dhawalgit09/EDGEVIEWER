cmake_minimum_required(VERSION 3.22.1)
project("edgeviewer")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Use the bundled C++ standard library
set(CMAKE_CXX_STL c++_shared)

# Help editors find jni.h when ANDROID_NDK is available
if(DEFINED ANDROID_NDK)
    include_directories("${ANDROID_NDK}/sysroot/usr/include")
else()
    message(STATUS "ANDROID_NDK not defined - Gradle/Android toolchain normally sets include paths automatically.")
endif()

add_library(${PROJECT_NAME} SHARED native-lib.cpp)

if(EXISTS "${CMAKE_SOURCE_DIR}/include")
    include_directories(${CMAKE_SOURCE_DIR}/include)
else()
    message(WARNING "OpenCV include folder not found at ${CMAKE_SOURCE_DIR}/include. Update path if needed.")
endif()

add_library(opencv_java4 SHARED IMPORTED)
set_target_properties(opencv_java4 PROPERTIES
    IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/../jniLibs/${ANDROID_ABI}/libopencv_java4.so
)

find_library(log-lib log)

target_link_libraries(${PROJECT_NAME}
    opencv_java4
    ${log-lib}
)
