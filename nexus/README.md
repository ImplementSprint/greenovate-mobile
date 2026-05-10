# Native Kotlin Android Boilerplate

This repository is a reusable Native Kotlin Android boilerplate for the single-system mobile pipeline.

## Stack

- Kotlin + Android SDK
- Gradle (Kotlin DSL)
- Kotest for unit tests
- Espresso for instrumentation tests
- Maestro for Android E2E smoke coverage
- OWASP dependency-check and license-policy gate

## Structure

```text
app/
  src/
    main/
      java/com/implementsprint/mobile/
      res/
    test/
    androidTest/
.maestro/
build.gradle.kts
settings.gradle.kts
```

## Verification Commands

- `./gradlew assembleDebug`: build debug APK
- `./gradlew assembleRelease bundleRelease`: build release artifacts
- `./gradlew unitTest`: run Kotest unit suite
- `./gradlew instrumentedTest`: run emulator/device-backed instrumentation tests
- `./gradlew coverageUnit`: generate JaCoCo unit coverage report
- `./gradlew coverageAndroid`: generate JaCoCo instrumentation coverage report
- `./gradlew coverageMerge`: generate merged JaCoCo report
- `./gradlew coverageVerify`: enforce minimum unit coverage threshold
- `./gradlew lintAndStyleCheck`: run Android lint and ktlint
- `./gradlew dependencyAudit`: run OWASP dependency scan
- `./gradlew licenseCompliance`: enforce allowed-license policy
- `./gradlew check`: run CI baseline verification gates
- `./gradlew fullVerification`: run check + instrumentation + merged coverage

## Android SDK Setup

Do not commit a machine-specific `local.properties` file.

Use one of these approaches:

1. Local development
- Copy `local.properties.example` to `local.properties`
- Set `sdk.dir` to your local Android SDK path

2. CI or ephemeral runners
- Set `ANDROID_HOME` or `ANDROID_SDK_ROOT`
- Install Android SDK components before Gradle execution

## Maestro E2E

The repository includes Android Maestro smoke flows in `.maestro/`.

Local run:

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$HOME/.maestro/bin:$PATH"
maestro test .maestro
```

Detox is intentionally not included in this native Kotlin template. Espresso + Maestro provide lower operational overhead for native Android CI.

## CI/CD Pipeline

Primary workflow: `.github/workflows/mobile-kotlin-caller.yml`

It runs:

1. Central Kotlin orchestrator lanes (governance, build, security, Sonar, versioning/release controls)
2. Emulator-backed instrumentation tests with JaCoCo Android coverage
3. Maestro Android E2E suite (when `.maestro` flows exist)

### Required CI Secrets

- `SONAR_TOKEN`
- `SONAR_PROJECT_KEY`
- `SONAR_ORGANIZATION`
- `NVD_API_KEY`

`NVD_API_KEY` is required in CI to keep dependency-audit behavior deterministic.

### Repository Variable Reminder

Set `MOBILE_SINGLE_SYSTEMS_JSON` in GitHub repo variables:

```json
{
  "name": "mobile-kotlin",
  "dir": ".",
  "mobile_stack": "kotlin",
  "gradle_task": "assembleRelease bundleRelease",
  "enable_android_build": true,
  "enable_ios_build": false,
  "version_stream": "mobile-kotlin"
}
```
