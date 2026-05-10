import org.gradle.testing.jacoco.tasks.JacocoCoverageVerification
import org.gradle.testing.jacoco.tasks.JacocoReport

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jlleitschuh.gradle.ktlint")
    id("jacoco")
}

android {
    namespace = "com.implementsprint.mobile"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.implementsprint.mobile"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        debug {
            enableUnitTestCoverage = true
            enableAndroidTestCoverage = true
        }

        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    testOptions {
        execution = "ANDROIDX_TEST_ORCHESTRATOR"
        unitTests.isIncludeAndroidResources = true
        unitTests.isReturnDefaultValues = true
        unitTests.all {
            it.useJUnitPlatform()
        }
    }
}

ktlint {
    android.set(true)
    ignoreFailures.set(false)
}

jacoco {
    toolVersion = "0.8.12"
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")

    testImplementation("io.kotest:kotest-runner-junit5:5.9.1")
    testImplementation("io.kotest:kotest-assertions-core:5.9.1")
    testImplementation("io.kotest:kotest-property:5.9.1")
    testImplementation("io.mockk:mockk:1.13.10")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.8.1")

    androidTestImplementation("androidx.test:core-ktx:1.5.0")
    androidTestImplementation("androidx.test:runner:1.5.2")
    androidTestImplementation("androidx.test:rules:1.5.0")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.ext:junit-ktx:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")

    androidTestUtil("androidx.test:orchestrator:1.4.2")
}

val jacocoClassExclusions =
    listOf(
        "**/R.class",
        "**/R$*.class",
        "**/BuildConfig.*",
        "**/Manifest*.*",
        "**/*Test*.*",
        "android/**/*.*",
    )

val debugJavaClasses =
    fileTree("${layout.buildDirectory.get().asFile}/intermediates/javac/debug/classes") {
        exclude(jacocoClassExclusions)
    }

val debugKotlinClasses =
    fileTree("${layout.buildDirectory.get().asFile}/tmp/kotlin-classes/debug") {
        exclude(jacocoClassExclusions)
    }

val mainSourceDirectories =
    files("$projectDir/src/main/java", "$projectDir/src/main/kotlin")

tasks.register<JacocoReport>("jacocoUnitTestReport") {
    group = "verification"
    description = "Generates JaCoCo report for debug unit tests."
    dependsOn("testDebugUnitTest")

    classDirectories.setFrom(files(debugJavaClasses, debugKotlinClasses))
    sourceDirectories.setFrom(mainSourceDirectories)
    executionData.setFrom(
        fileTree(layout.buildDirectory.asFile.get()) {
            include("jacoco/testDebugUnitTest.exec")
        },
    )

    reports {
        xml.required.set(true)
        html.required.set(true)
        csv.required.set(false)
    }
}

tasks.register<JacocoReport>("jacocoAndroidTestReport") {
    group = "verification"
    description = "Generates JaCoCo report for connected debug android tests."
    dependsOn("connectedDebugAndroidTest")

    classDirectories.setFrom(files(debugJavaClasses, debugKotlinClasses))
    sourceDirectories.setFrom(mainSourceDirectories)
    executionData.setFrom(
        fileTree(layout.buildDirectory.asFile.get()) {
            include("outputs/code_coverage/debugAndroidTest/connected/**/*.ec")
        },
    )

    reports {
        xml.required.set(true)
        html.required.set(true)
        csv.required.set(false)
    }
}

tasks.register<JacocoReport>("jacocoMergedCoverageReport") {
    group = "verification"
    description = "Generates merged JaCoCo coverage report for unit and android tests."
    dependsOn("testDebugUnitTest", "connectedDebugAndroidTest")

    classDirectories.setFrom(files(debugJavaClasses, debugKotlinClasses))
    sourceDirectories.setFrom(mainSourceDirectories)
    executionData.setFrom(
        fileTree(layout.buildDirectory.asFile.get()) {
            include(
                "jacoco/testDebugUnitTest.exec",
                "outputs/code_coverage/debugAndroidTest/connected/**/*.ec",
            )
        },
    )

    reports {
        xml.required.set(true)
        html.required.set(true)
        csv.required.set(false)
    }
}

tasks.register<JacocoCoverageVerification>("jacocoCoverageVerification") {
    group = "verification"
    description = "Verifies minimum unit test coverage threshold."
    dependsOn("jacocoUnitTestReport")

    classDirectories.setFrom(files(debugJavaClasses, debugKotlinClasses))
    sourceDirectories.setFrom(mainSourceDirectories)
    executionData.setFrom(
        fileTree(layout.buildDirectory.asFile.get()) {
            include("jacoco/testDebugUnitTest.exec")
        },
    )

    violationRules {
        rule {
            limit {
                minimum = "0.70".toBigDecimal()
            }
        }
    }
}
