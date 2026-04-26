import os
import subprocess
import sys
import uuid
from pathlib import Path

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


FRONTEND_URL = os.getenv("NEARBY_FRONTEND_URL", "http://localhost:5173")


def _is_headless_enabled() -> bool:
    return os.getenv("NEARBY_SELENIUM_HEADLESS", "1") == "1"


def _ensure_admin_account(username: str, password: str, email: str) -> None:
    project_root = Path(__file__).resolve().parents[1]
    manage_py = project_root / "manage.py"

    subprocess.run(
        [
            sys.executable,
            str(manage_py),
            "create_admin_account",
            "--username",
            username,
            "--password",
            password,
            "--email",
            email,
            "--full-name",
            "Selenium Admin",
            "--phone",
            "01900000000",
            "--address",
            "NearBy HQ",
            "--update-existing",
        ],
        cwd=str(project_root),
        check=True,
    )


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    if _is_headless_enabled():
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1400,1000")

    browser = webdriver.Chrome(options=options)
    yield browser
    browser.quit()


def test_admin_login_flow(driver):
    """Creates/updates an admin via management command, then verifies login UI flow."""
    wait = WebDriverWait(driver, 20)

    unique = uuid.uuid4().hex[:8]
    username = f"admin_{unique}"
    password = "Pass1234!"
    email = f"{username}@example.com"

    _ensure_admin_account(username=username, password=password, email=email)

    driver.get(f"{FRONTEND_URL}/admin/login")
    driver.execute_script("window.localStorage.clear();")
    driver.get(f"{FRONTEND_URL}/admin/login")

    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Admin Username']"))).send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter Your Password']").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    wait.until(
        lambda d: "/admin/dashboard" in d.current_url
    )

    token = driver.execute_script("return window.localStorage.getItem('token');")
    assert token is not None and len(token) > 20