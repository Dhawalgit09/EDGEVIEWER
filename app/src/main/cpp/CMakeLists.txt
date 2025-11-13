cmake_minimum_required(VERSION 3.22.1)
project("edgeviewer")

# C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Create native library target (name will be "edgeviewer")
add_library(${PROJECT_NAME} SHARED native-lib.cpp)

# Include OpenCV headers if present (we expect you copied them to app/src/main/cpp/include)
if(EXISTS "${CMAKE_SOURCE_DIR}/include")
    include_directories(${CMAKE_SOURCE_DIR}/include)
else()
    message(WARNING "OpenCV include folder not found at ${CMAKE_SOURCE_DIR}/include. Update path if needed.")
endif()

# Import prebuilt OpenCV .so placed under app/src/main/jniLibs/<ABI>/
add_library(opencv_java4 SHARED IMPORTED)
set_target_properties(opencv_java4 PROPERTIES
    IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/../jniLibs/${ANDROID_ABI}/libopencv_java4.so
)

# Find Android log library
find_library(log-lib log)

# Link libraries to our native target
target_link_libraries(${PROJECT_NAME}
    opencv_java4
    ${log-lib}
)
