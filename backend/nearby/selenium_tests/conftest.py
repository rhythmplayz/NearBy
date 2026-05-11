import os

import pytest
from selenium import webdriver


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
