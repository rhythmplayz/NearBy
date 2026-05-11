import uuid

from ._helpers import create_community_post, register_user_and_login


def test_community_post_creation_flow(driver):
    register_user_and_login(driver)
    unique = uuid.uuid4().hex[:8]
    title = f"Community Note {unique}"
    description = f"Sharing something local {unique}."

    create_community_post(driver, title=title, description=description, post_type="general")
    assert title in driver.page_source
