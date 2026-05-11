import uuid

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from ._helpers import FRONTEND_URL, login_admin, wait_for_text


def test_admin_registration_system(driver):
    login_admin(driver)
    wait = WebDriverWait(driver, 20)
    unique = uuid.uuid4().hex[:8]
    username = f"reg_admin_{unique}"
    email = f"{username}@example.com"

    driver.get(f"{FRONTEND_URL}/admin/register")

    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Full Name']"))).send_keys("New Admin")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Username']").send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Email']").send_keys(email)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Password']").send_keys("Pass1234!")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Phone No.']").send_keys("01988888888")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Office/Home Address']").send_keys("Head Office")

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait_for_text(driver, "New Administrator Registered!")
