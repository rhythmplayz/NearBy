from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from ._helpers import FRONTEND_URL, register_seller_and_login, wait_for_text


def test_seller_profile_management_flow(driver):
    register_seller_and_login(driver)
    wait = WebDriverWait(driver, 20)

    updated_business_name = "Updated Demo Store"
    updated_full_name = "Updated Seller Owner"
    updated_neighbourhood = "North District"
    updated_phone = "01822223333"
    updated_address = "Seller Lane 5"

    driver.get(f"{FRONTEND_URL}/seller/profile")
    wait.until(EC.visibility_of_element_located((By.XPATH, "//button[normalize-space()='Save Changes']")))

    form_inputs = driver.find_elements(By.CSS_SELECTOR, "form input")
    form_inputs[1].clear()
    form_inputs[1].send_keys(updated_business_name)
    form_inputs[2].clear()
    form_inputs[2].send_keys(updated_full_name)
    form_inputs[3].clear()
    form_inputs[3].send_keys(updated_neighbourhood)
    form_inputs[4].clear()
    form_inputs[4].send_keys(updated_phone)
    form_inputs[5].clear()
    form_inputs[5].send_keys(updated_address)

    driver.find_element(By.XPATH, "//button[normalize-space()='Save Changes']").click()
    wait_for_text(driver, "Profile updated!")

    driver.refresh()
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "form input")))
    refreshed_inputs = driver.find_elements(By.CSS_SELECTOR, "form input")
    assert refreshed_inputs[1].get_attribute("value") == updated_business_name
    assert refreshed_inputs[2].get_attribute("value") == updated_full_name
    assert refreshed_inputs[3].get_attribute("value") == updated_neighbourhood
    assert refreshed_inputs[4].get_attribute("value") == updated_phone
    assert refreshed_inputs[5].get_attribute("value") == updated_address
