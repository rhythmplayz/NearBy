import base64
import os
import subprocess
import sys
import tempfile
import textwrap
import uuid
from pathlib import Path
from typing import Optional

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait


FRONTEND_URL = os.getenv("NEARBY_FRONTEND_URL", "http://localhost:5173")

_TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z8yQAAAAASUVORK5CYII="
)


def clear_local_storage(driver) -> None:
    driver.execute_script("window.localStorage.clear();")


def reset_route(driver, route: str) -> None:
    driver.get(f"{FRONTEND_URL}{route}")
    clear_local_storage(driver)
    driver.get(f"{FRONTEND_URL}{route}")


def wait_for_route(driver, fragment: str, timeout: int = 20) -> None:
    WebDriverWait(driver, timeout).until(lambda current: fragment in current.current_url)


def wait_for_text(driver, text: str, timeout: int = 20):
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((By.XPATH, f"//*[contains(normalize-space(.), '{text}')]"))
    )


def ensure_admin_account(username: str, password: str, email: str) -> None:
    project_root = Path(__file__).resolve().parents[1]
    manage_py = project_root / "manage.py"

    setup_script = textwrap.dedent(
        f"""
        from admins.models import Admin

        admin, created = Admin.objects.get_or_create(
            username={username!r},
            defaults={{
                'email': {email!r},
                'full_name': 'Selenium Admin',
                'phone': '01900000000',
                'address': 'NearBy HQ',
                'user_type': 'admin',
                'is_staff': True,
                'status': 'active',
            }},
        )

        admin.email = {email!r}
        admin.full_name = 'Selenium Admin'
        admin.phone = '01900000000'
        admin.address = 'NearBy HQ'
        admin.user_type = 'admin'
        admin.is_staff = True
        admin.status = 'active'
        admin.set_password({password!r})
        admin.save()
        print('created' if created else 'updated')
        """
    ).strip()

    subprocess.run(
        [sys.executable, str(manage_py), "shell", "-c", setup_script],
        cwd=str(project_root),
        check=True,
    )


def login_admin(driver):
    unique = uuid.uuid4().hex[:8]
    username = f"admin_{unique}"
    password = "Pass1234!"
    email = f"{username}@example.com"

    ensure_admin_account(username=username, password=password, email=email)
    wait = WebDriverWait(driver, 20)

    reset_route(driver, "/admin/login")
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Admin Username']"))).send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter Your Password']").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait_for_route(driver, "/admin/dashboard")

    token = driver.execute_script("return window.localStorage.getItem('token');")
    assert token is not None and len(token) > 20

    return {
        "username": username,
        "password": password,
        "email": email,
    }


def register_user_and_login(driver):
    unique = uuid.uuid4().hex[:8]
    username = f"user_{unique}"
    password = "Pass1234!"
    email = f"{username}@example.com"

    wait = WebDriverWait(driver, 20)
    reset_route(driver, "/user/register")

    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Full Name']"))).send_keys("Test User")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='User Name']").send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Email']").send_keys(email)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Password']").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Neighbourhood']").send_keys("Central Block")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Phone No.']").send_keys("01700000000")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Address']").send_keys("Road 1")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    wait_for_route(driver, "/user/login")
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='User Name']"))).send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter Your Password']").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait_for_route(driver, "/user/home")

    token = driver.execute_script("return window.localStorage.getItem('token');")
    assert token is not None and len(token) > 20

    return {"username": username, "password": password, "email": email}


def register_seller_and_login(driver):
    unique = uuid.uuid4().hex[:8]
    username = f"seller_{unique}"
    password = "Pass1234!"
    email = f"{username}@example.com"

    wait = WebDriverWait(driver, 20)
    reset_route(driver, "/seller/register")

    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Business Name']"))).send_keys("Demo Store")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder=\"Owner's Full Name\"]").send_keys("Seller Owner")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Business Username']").send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Business Email']").send_keys(email)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Password']").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Serving Neighbourhood']").send_keys("Central Block")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Business Phone No.']").send_keys("01800000000")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Business Address']").send_keys("Road 2")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    wait_for_route(driver, "/seller/login")
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Business Username']"))).send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter Your Password']").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait_for_route(driver, "/seller/dashboard")

    token = driver.execute_script("return window.localStorage.getItem('token');")
    assert token is not None and len(token) > 20

    return {"username": username, "password": password, "email": email, "business_name": "Demo Store"}


def register_rider_and_login(driver):
    unique = uuid.uuid4().hex[:8]
    username = f"rider_{unique}"
    password = "Pass1234!"
    email = f"{username}@example.com"

    wait = WebDriverWait(driver, 20)
    reset_route(driver, "/rider/register")

    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Full Name']"))).send_keys("Test Rider")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Rider Username']").send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Email']").send_keys(email)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Password']").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Vehicle Type']").send_keys("Bike")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='License Number']").send_keys(f"LIC-{unique}")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Serving Neighbourhood']").send_keys("Central Block")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Phone No.']").send_keys("01600000000")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Address']").send_keys("Road 3")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    wait_for_route(driver, "/rider/login")
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Rider Username']"))).send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter Your Password']").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait_for_route(driver, "/rider/dashboard")

    token = driver.execute_script("return window.localStorage.getItem('token');")
    assert token is not None and len(token) > 20

    return {"username": username, "password": password, "email": email}


def create_community_post(driver, title: str, description: str, post_type: str = "general", cover_path: Optional[Path] = None):
    wait = WebDriverWait(driver, 20)
    driver.get(f"{FRONTEND_URL}/user/home")

    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Post Title']"))).send_keys(title)
    driver.find_element(By.CSS_SELECTOR, "textarea[placeholder=\"What's on your mind?\"]").send_keys(description)
    Select(driver.find_element(By.CSS_SELECTOR, "select")).select_by_value(post_type)

    if cover_path is not None:
        driver.find_element(By.CSS_SELECTOR, "input[type='file']").send_keys(str(cover_path))

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait_for_text(driver, title)


def create_temp_image_file(prefix: str) -> Path:
    temp_path = Path(tempfile.gettempdir()) / f"{prefix}_{uuid.uuid4().hex}.png"
    temp_path.write_bytes(_TINY_PNG)
    return temp_path


def remove_temp_files(*paths: Path) -> None:
    for temp_path in paths:
        try:
            temp_path.unlink(missing_ok=True)
        except OSError:
            pass
