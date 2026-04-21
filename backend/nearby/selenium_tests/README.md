# Selenium Tests (Pytest)

This folder is for UI end-to-end tests using Selenium WebDriver and pytest.

## Why this setup

- Selenium controls the browser (open page, click button, read text).
- Pytest finds and runs test files and shows clean output.

## File naming

- Keep test files as `test_*.py`.
- Example: `test_frontend_counter.py`, `test_login.py`, `test_marketplace.py`.

## Install packages

From the backend project environment:

```bash
pip install pytest selenium
```

## Run one Selenium test file

From `backend/nearby`:

```bash
pytest -v selenium_tests/test_frontend_counter.py
```

## Run all Selenium tests in this folder

From `backend/nearby`:

```bash
pytest -v selenium_tests
```

## Frontend URL

Default URL used in tests:

- `http://localhost:5173/`

To use another URL:

```bash
# PowerShell
$env:NEARBY_FRONTEND_URL="http://localhost:5174/"
pytest -v selenium_tests
```
