import uuid

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from ._helpers import FRONTEND_URL, register_seller_and_login, wait_for_text


def test_seller_product_management_flow(driver):
    register_seller_and_login(driver)
    wait = WebDriverWait(driver, 20)
    unique = uuid.uuid4().hex[:8]
    product_name = f"Market Basket {unique}"

    driver.get(f"{FRONTEND_URL}/seller/products")

    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Product name']"))).send_keys(product_name)
    driver.find_element(By.CSS_SELECTOR, "textarea[placeholder='Product description']").send_keys("Fresh local produce for testing.")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Category']").send_keys("Groceries")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Stock quantity']").send_keys("12")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Price']").send_keys("250")

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait_for_text(driver, "Product created successfully.")
    wait_for_text(driver, product_name)
