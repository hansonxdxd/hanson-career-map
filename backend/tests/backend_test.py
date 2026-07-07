"""Backend API tests for Career Evolution Map CMS."""
import io
import os
import copy
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://systems-architect-5.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "hansonxdxd@gmail.com"
ADMIN_PASSWORD = "Hanson2025!"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------- Public content endpoint ----------------
class TestPublicContent:
    def test_get_content_public(self):
        r = requests.get(f"{API}/content")
        assert r.status_code == 200
        data = r.json()
        for key in ["hero", "coreThesis", "careerEvolution", "projects", "capabilities", "nowNext", "contact"]:
            assert key in data, f"Missing section {key}"
        assert len(data["careerEvolution"]["stages"]) >= 5


# ---------------- Auth ----------------
class TestAuth:
    def test_login_success(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d["token_type"] == "bearer"
        assert isinstance(d["access_token"], str) and len(d["access_token"]) > 10

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_wrong_email(self):
        r = requests.post(f"{API}/auth/login", json={"email": "nobody@example.com", "password": "x"})
        assert r.status_code == 401

    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d.get("role") == "admin"

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert r.status_code == 401


# ---------------- Protected endpoints without auth ----------------
class TestProtectedNoAuth:
    def test_put_content_unauth(self):
        r = requests.put(f"{API}/content", json={"content": {}})
        assert r.status_code == 401

    def test_upload_unauth(self):
        # 1x1 png
        png = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x5c\xcd\xff\x69\x00\x00\x00\x00IEND\xaeB`\x82'
        r = requests.post(f"{API}/upload", files={"file": ("t.png", io.BytesIO(png), "image/png")})
        assert r.status_code == 401


# ---------------- Content update flow ----------------
class TestContentUpdate:
    def test_update_and_persist_hero_tagline(self, auth_headers):
        # Get current
        current = requests.get(f"{API}/content").json()
        original = copy.deepcopy(current)
        new_tagline = "TEST_ tagline updated by pytest"
        current["hero"]["tagline"] = new_tagline

        r = requests.put(f"{API}/content", json={"content": current}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json().get("success") is True

        # Verify persisted
        r2 = requests.get(f"{API}/content")
        assert r2.status_code == 200
        assert r2.json()["hero"]["tagline"] == new_tagline

        # Restore
        r3 = requests.put(f"{API}/content", json={"content": original}, headers=auth_headers)
        assert r3.status_code == 200

    def test_update_stage_detail_url(self, auth_headers):
        current = requests.get(f"{API}/content").json()
        original = copy.deepcopy(current)
        current["careerEvolution"]["stages"][0]["detailUrl"] = "https://example.com/stage1"
        r = requests.put(f"{API}/content", json={"content": current}, headers=auth_headers)
        assert r.status_code == 200
        r2 = requests.get(f"{API}/content")
        assert r2.json()["careerEvolution"]["stages"][0]["detailUrl"] == "https://example.com/stage1"
        # Restore
        requests.put(f"{API}/content", json={"content": original}, headers=auth_headers)


# ---------------- Upload ----------------
class TestUpload:
    def test_upload_png(self, auth_headers):
        png = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x5c\xcd\xff\x69\x00\x00\x00\x00IEND\xaeB`\x82'
        r = requests.post(f"{API}/upload",
                          files={"file": ("t.png", io.BytesIO(png), "image/png")},
                          headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("success") is True
        assert data.get("url", "").startswith("data:image/png;base64,")

    def test_upload_bad_type(self, auth_headers):
        r = requests.post(f"{API}/upload",
                          files={"file": ("t.txt", io.BytesIO(b"hello"), "text/plain")},
                          headers=auth_headers)
        assert r.status_code == 400
