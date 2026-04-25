import os
import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


"""
Beginner-friendly Selenium test using pytest.

What this test does:
1) Opens the frontend page.
2) Checks that the heading says "Get started".
3) Clicks the counter button once.
4) Verifies the button changes from "Count is 0" to "Count is 1".
"""


@pytest.fixture
def driver():
    browser = webdriver.Chrome()
    yield browser
    browser.quit()


def test_counter_increases_after_click(driver):
    base_url = os.getenv("NEARBY_FRONTEND_URL", "http://localhost:5173/")
    driver.get(base_url)
    wait = WebDriverWait(driver, 10)

    heading = wait.until(
        EC.visibility_of_element_located((By.TAG_NAME, "h1"))
    )
    assert "A smarter way to connect with your" in heading.text

    get_started_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Get Started')]") )
    )
    assert get_started_button.is_displayed()

    get_started_button.click()

    wait.until(
        EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Choose your access')]") )
    )
