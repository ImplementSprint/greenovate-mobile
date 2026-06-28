package com.implementsprint.mobile

import androidx.test.espresso.Espresso
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.closeSoftKeyboard
import androidx.test.espresso.action.ViewActions.replaceText
import androidx.test.espresso.action.ViewActions.scrollTo
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.pharmacare.pos.R
import org.hamcrest.CoreMatchers.containsString
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

private const val API_URL = "https://api.example.com"

@RunWith(AndroidJUnit4::class)
class MainActivityInstrumentedTest {
    @get:Rule
    val activityScenarioRule = ActivityScenarioRule(MainActivity::class.java)

    @Test
    fun validateReadiness_showsReadyStateForUatHttpsEndpoint() {
        onView(withId(R.id.environmentInput)).perform(replaceText("uat"), closeSoftKeyboard())
        onView(withId(R.id.apiBaseUrlInput)).perform(replaceText(API_URL), closeSoftKeyboard())

        // Explicitly dismiss keyboard and scroll to button before clicking
        Espresso.closeSoftKeyboard()
        onView(withId(R.id.validateButton)).perform(scrollTo(), click())

        onView(withId(R.id.readinessStatusText)).check(matches(withText("Ready for deployment")))
    }

    @Test
    fun validateReadiness_showsViolationStateForMainInsecureEndpoint() {
        onView(withId(R.id.environmentInput)).perform(replaceText("main"), closeSoftKeyboard())
        onView(withId(R.id.apiBaseUrlInput)).perform(replaceText("https://localhost/mock"), closeSoftKeyboard())

        // Explicitly dismiss keyboard and scroll to button before clicking
        Espresso.closeSoftKeyboard()
        onView(withId(R.id.validateButton)).perform(scrollTo(), click())

        onView(withId(R.id.readinessStatusText)).check(matches(withText(containsString("Not ready"))))
    }
}
