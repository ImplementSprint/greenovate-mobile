package com.implementsprint.mobile

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.collections.shouldContainAll
import io.kotest.matchers.shouldBe

private const val API_URL = "https://api.example.com"

class SampleKotestSpec :
    FunSpec({
        val evaluator = ReleaseReadinessEvaluator()

        fun evaluate(apiBaseUrl: String, environment: String) =
            evaluator.evaluate(apiBaseUrl = apiBaseUrl, environment = environment)

        test("marks valid uat endpoint as ready") {
            val result = evaluate(API_URL, "uat")

            result.isReady shouldBe true
            result.summary shouldBe "Ready for deployment"
            result.violations shouldBe emptyList()
        }

        test("rejects blank api base url") {
            val result = evaluate("   ", "uat")

            result.isReady shouldBe false
            result.summary.contains("Not ready") shouldBe true
            result.violations shouldContain "API base URL is required"
            result.violations shouldContain "API base URL must be a valid absolute URI"
        }

        test("rejects insecure endpoint for production-like environments") {
            val result = evaluate("http://api.example.com", "main")

            result.isReady shouldBe false
            result.violations shouldContain "Production-like environments require HTTPS"
        }

        test("rejects localhost endpoints for production-like environments") {
            val result = evaluate("https://localhost:8080", "production")

            result.isReady shouldBe false
            result.violations shouldContain "Production-like environments cannot use localhost endpoints"
        }

        test("rejects mock path endpoints for production-like environments") {
            val result = evaluate("$API_URL/mock/users", "uat")

            result.isReady shouldBe false
            result.violations shouldContain "Production-like environments cannot use mock endpoints"
        }

        test("rejects uppercase mock path endpoints for production-like environments") {
            val result = evaluate("$API_URL/MOCK/users", "main")

            result.isReady shouldBe false
            result.violations shouldContain "Production-like environments cannot use mock endpoints"
        }

        test("allows localhost endpoint for development") {
            val result = evaluate("https://localhost:8080", "development")

            result.isReady shouldBe true
            result.summary shouldBe "Ready for deployment"
        }

        test("requires valid environment value") {
            val result = evaluate(API_URL, "preview")

            result.isReady shouldBe false
            result.violations shouldContain "Environment must be one of development, test, uat, main, production"
        }

        test("rejects non-https non-localhost endpoint for test environment") {
            val result = evaluate("http://staging.example.com", "test")

            result.isReady shouldBe false
            result.violations shouldContain "Test environment must use HTTPS unless running against localhost"
        }

        test("returns multiple violations for invalid production-like configuration") {
            val result = evaluate("http://localhost/mock", "main")

            result.isReady shouldBe false
            result.violations.shouldContainAll(
                "Production-like environments require HTTPS",
                "Production-like environments cannot use localhost endpoints",
                "Production-like environments cannot use mock endpoints",
            )
        }
    })
