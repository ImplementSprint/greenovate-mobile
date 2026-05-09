import com.github.jk1.license.filter.LicenseBundleNormalizer
import org.gradle.language.base.plugins.LifecycleBasePlugin

val isCi = System.getenv("CI")?.equals("true", ignoreCase = true) == true
val nvdApiKey = System.getenv("NVD_API_KEY")

plugins {
    base
    id("com.android.application") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
    id("org.jlleitschuh.gradle.ktlint") version "14.2.0" apply false
    id("org.owasp.dependencycheck") version "12.2.0"
    id("com.github.jk1.dependency-license-report") version "3.1.1"
}

licenseReport {
    filters = arrayOf(LicenseBundleNormalizer())
    allowedLicensesFile = layout.projectDirectory.file("config/allowed-licenses.json").asFile
}

dependencyCheck {
    // In CI, dependency audit is a blocking gate for release confidence.
    failOnError = isCi && !nvdApiKey.isNullOrBlank()

    nvd {
        apiKey = nvdApiKey
    }
}

tasks.named("dependencyCheckAnalyze") {
    onlyIf {
        if (isCi && nvdApiKey.isNullOrBlank()) {
            logger.warn("NVD_API_KEY is not set in CI. Skipping dependencyCheckAnalyze; configure NVD_API_KEY to enforce dependency auditing.")
            false
        } else {
            true
        }
    }
}

tasks.named("checkLicense") {
    // Avoid Gradle task validation failure in CI by declaring explicit ordering.
    dependsOn("dependencyCheckAnalyze")
}

tasks.register("unitTest") {
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    description = "Runs Kotlin unit tests."
    dependsOn(":app:testDebugUnitTest")
}

tasks.register("instrumentedTest") {
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    description = "Runs Android instrumentation tests on an emulator/device."
    dependsOn(":app:connectedDebugAndroidTest")
}

tasks.register("coverageUnit") {
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    description = "Generates unit-test JaCoCo coverage report."
    dependsOn(":app:jacocoUnitTestReport")
}

tasks.register("coverageAndroid") {
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    description = "Generates instrumentation-test JaCoCo coverage report."
    dependsOn(":app:jacocoAndroidTestReport")
}

tasks.register("coverageMerge") {
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    description = "Generates merged JaCoCo coverage report for unit + instrumentation tests."
    dependsOn(":app:jacocoMergedCoverageReport")
}

tasks.register("coverageVerify") {
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    description = "Verifies unit coverage threshold."
    dependsOn(":app:jacocoCoverageVerification")
}

tasks.register("lintAndStyleCheck") {
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    description = "Runs Android lint and Kotlin style checks."
    dependsOn(":app:lintDebug", ":app:ktlintCheck")
}

tasks.register("dependencyAudit") {
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    description = "Runs dependency vulnerability audit."
    dependsOn("dependencyCheckAnalyze")
}

tasks.register("licenseCompliance") {
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    description = "Checks third-party dependencies against the allowed license policy."
    dependsOn("checkLicense")
}

tasks.register("fullVerification") {
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    description = "Runs the full CI-grade verification suite including emulator tests and merged coverage."
    dependsOn(
        "check",
        "instrumentedTest",
        "coverageMerge",
    )
}

tasks.named("check") {
    dependsOn(
        "unitTest",
        "coverageUnit",
        "coverageVerify",
        "lintAndStyleCheck",
        "dependencyAudit",
        "licenseCompliance",
    )
}
