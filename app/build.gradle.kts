plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.example.edgeviewer"
    compileSdk {
        version = release(36)
    }

    defaultConfig {
        applicationId = "com.example.edgeviewer"
        minSdk = 21
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        ndk {
            abiFilters += listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    externalNativeBuild {
        cmake {
            path = file("src/main/cpp/CMakeLists.txt")
            version = "3.22.1"
        }
    }
    buildFeatures {
        viewBinding = true
    }

    // Task to copy libc++_shared.so from NDK to jniLibs
    tasks.register("copyCxxShared") {
        doLast {
            val ndkPath = android.ndkDirectory?.absolutePath
                ?: System.getenv("ANDROID_NDK_HOME")
                ?: "${System.getProperty("user.home")}/AppData/Local/Android/Sdk/ndk/${android.ndkVersion}"
            
            // Map Android ABI names to NDK directory names
            val abiMap = mapOf(
                "arm64-v8a" to "aarch64-linux-android",
                "armeabi-v7a" to "arm-linux-androideabi",
                "x86" to "i686-linux-android",
                "x86_64" to "x86_64-linux-android"
            )
            
            // Try multiple possible locations (NDK structure varies by version)
            val possibleBasePaths = listOf(
                "toolchains/llvm/prebuilt/windows-x86_64/sysroot/usr/lib",
                "toolchains/llvm/prebuilt/linux-x86_64/sysroot/usr/lib",
                "sources/cxx-stl/llvm-libc++/libs"
            )
            
            abiMap.forEach { (androidAbi, ndkAbi) ->
                var copied = false
                for (basePath in possibleBasePaths) {
                    val srcFile = file("$ndkPath/$basePath/$ndkAbi/libc++_shared.so")
                    if (srcFile.exists()) {
                        val destDir = file("src/main/jniLibs/$androidAbi")
                        val destFile = file("$destDir/libc++_shared.so")
                        destDir.mkdirs()
                        srcFile.copyTo(destFile, overwrite = true)
                        println("✓ Copied libc++_shared.so for $androidAbi (from $ndkAbi)")
                        copied = true
                        break
                    }
                }
                if (!copied) {
                    println("✗ Warning: libc++_shared.so not found for $androidAbi")
                }
            }
        }
    }
    
    // Run copy task before building
    tasks.named("preBuild").configure {
        dependsOn("copyCxxShared")
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.camera.core)
    implementation(libs.androidx.camera.camera2)
    implementation(libs.androidx.camera.lifecycle)
    implementation(libs.androidx.camera.view)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}