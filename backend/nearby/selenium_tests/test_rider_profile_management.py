from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from ._helpers import FRONTEND_URL, register_rider_and_login, wait_for_text


def test_rider_profile_management_flow(driver):
    register_rider_and_login(driver)
    wait = WebDriverWait(driver, 20)

    updated_name = "Updated Rider"
    updated_phone = "01611112222"
    updated_address = "Rider Block 9"
    updated_vehicle = "Scooter"
    updated_license = "LIC-UPDATED-01"
    updated_neighbourhood = "South District"

    driver.get(f"{FRONTEND_URL}/rider/profile")
    wait_for_text(driver, "My Profile")

    driver.find_element(By.XPATH, "//button[normalize-space()='Edit Profile']").click()
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[name='full_name']")))

    driver.find_element(By.CSS_SELECTOR, "input[name='full_name']").clear()
    driver.find_element(By.CSS_SELECTOR, "input[name='full_name']").send_keys(updated_name)
    driver.find_element(By.CSS_SELECTOR, "input[name='phone']").clear()
    driver.find_element(By.CSS_SELECTOR, "input[name='phone']").send_keys(updated_phone)
    driver.find_element(By.CSS_SELECTOR, "input[name='address']").clear()
    driver.find_element(By.CSS_SELECTOR, "input[name='address']").send_keys(updated_address)
    driver.find_element(By.CSS_SELECTOR, "input[name='vehicle_type']").clear()
    driver.find_element(By.CSS_SELECTOR, "input[name='vehicle_type']").send_keys(updated_vehicle)
    driver.find_element(By.CSS_SELECTOR, "input[name='license_number']").clear()
    driver.find_element(By.CSS_SELECTOR, "input[name='license_number']").send_keys(updated_license)
    driver.find_element(By.CSS_SELECTOR, "input[name='neighbourhood']").clear()
    driver.find_element(By.CSS_SELECTOR, "input[name='neighbourhood']").send_keys(updated_neighbourhood)

    driver.find_element(By.XPATH, "//button[normalize-space()='Save Changes']").click()
    wait_for_text(driver, "Profile updated successfully!")

    driver.refresh()
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[name='full_name']")))
    assert driver.find_element(By.CSS_SELECTOR, "input[name='full_name']").get_attribute("value") == updated_name
    assert driver.find_element(By.CSS_SELECTOR, "input[name='phone']").get_attribute("value") == updated_phone
    assert driver.find_element(By.CSS_SELECTOR, "input[name='address']").get_attribute("value") == updated_address
    assert driver.find_element(By.CSS_SELECTOR, "input[name='vehicle_type']").get_attribute("value") == updated_vehicle
    assert driver.find_element(By.CSS_SELECTOR, "input[name='license_number']").get_attribute("value") == updated_license
    assert driver.find_element(By.CSS_SELECTOR, "input[name='neighbourhood']").get_attribute("value") == updated_neighbourhood
