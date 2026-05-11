import uuid

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from ._helpers import FRONTEND_URL, create_community_post, register_user_and_login, wait_for_text


def test_event_calendar_lists_event_posts(driver):
    register_user_and_login(driver)
    unique = uuid.uuid4().hex[:8]
    title = f"Community Event {unique}"
    description = f"Event details for {unique}."

    create_community_post(driver, title=title, description=description, post_type="event")

    driver.get(f"{FRONTEND_URL}/user/events")
    wait = WebDriverWait(driver, 20)
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Community Calendar')]")))
    wait_for_text(driver, title)
