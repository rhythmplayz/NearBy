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


def test_user_profile_management_flow(driver):
    """Registers a user, logs in, edits the profile, and verifies the changes persist."""
    wait = WebDriverWait(driver, 20)

    unique = uuid.uuid4().hex[:8]
    username = f"profile_user_{unique}"
    password = "Pass1234!"
    email = f"{username}@example.com"
    updated_name = f"Updated User {unique}"
    updated_phone = f"017{int(unique, 16) % 100000000:08d}"
    updated_address = f"Block {unique}"

    driver.get(f"{FRONTEND_URL}/user/register")
    driver.execute_script("window.localStorage.clear();")
    driver.get(f"{FRONTEND_URL}/user/register")

    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Full Name']"))).send_keys("Profile Test User")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='User Name']").send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Email']").send_keys(email)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Password']").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Neighbourhood']").send_keys("Central Block")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Phone No.']").send_keys("01700000000")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Address']").send_keys("Road 1")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    wait.until(lambda current_driver: "/user/login" in current_driver.current_url)

    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='User Name']"))).send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter Your Password']").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    wait.until(lambda current_driver: "/user/home" in current_driver.current_url)

    driver.get(f"{FRONTEND_URL}/user/profile")

    full_name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Enter full name']")))
    email_input = driver.find_element(By.CSS_SELECTOR, "input[disabled]")

    assert email_input.get_attribute("value") == email

    full_name_input.clear()
    full_name_input.send_keys(updated_name)

    phone_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter phone number']")
    phone_input.clear()
    phone_input.send_keys(updated_phone)

    address_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter address']")
    address_input.clear()
    address_input.send_keys(updated_address)

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Profile updated!') or contains(text(), 'Profile updated successfully')]")))

    driver.refresh()

    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Enter full name']")))
    assert driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter full name']").get_attribute("value") == updated_name
    assert driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter phone number']").get_attribute("value") == updated_phone
    assert driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter address']").get_attribute("value") == updated_address
