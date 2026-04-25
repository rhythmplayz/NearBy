import os
import uuid

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


FRONTEND_URL = os.getenv("NEARBY_FRONTEND_URL", "http://localhost:5173")


def _is_headless_enabled() -> bool:
    return os.getenv("NEARBY_SELENIUM_HEADLESS", "1") == "1"


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    if _is_headless_enabled():
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1400,1000")

    browser = webdriver.Chrome(options=options)
    yield browser
    browser.quit()


def test_user_register_and_login_flow(driver):
    """Registers a unique user from UI, then logs in and verifies redirect + token."""
    wait = WebDriverWait(driver, 20)

    unique = uuid.uuid4().hex[:8]
    username = f"user_{unique}"
    password = "Pass1234!"
    email = f"{username}@example.com"

    driver.get(f"{FRONTEND_URL}/user/register")
    driver.execute_script("window.localStorage.clear();")
    driver.get(f"{FRONTEND_URL}/user/register")

    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Full Name']"))).send_keys("Test User")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='User Name']").send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Email']").send_keys(email)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Password']").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Neighbourhood']").send_keys("Central Block")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Phone No.']").send_keys("01700000000")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Address']").send_keys("Road 1")

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    wait.until(
        lambda d: "/user/login" in d.current_url
    )

    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='User Name']"))).send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter Your Password']").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    wait.until(
        lambda d: "/user/home" in d.current_url
    )

    token = driver.execute_script("return window.localStorage.getItem('token');")
    assert token is not None and len(token) > 20
