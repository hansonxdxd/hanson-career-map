"""Backend API tests for Career Evolution Map CMS (Iteration 2 - Profile system)."""
import io
import os
import copy
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://systems-architect-5.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "hansonxdxd@gmail.com"
ADMIN_PASSWORD = "Hanson2025!"
DEFAULT_SLUG = "main"

TEST_PROFILE_NAME = "TEST_ Alt Version"
TEST_PROFILE_SLUG_HINT = "test-alt-version"

PNG_BYTES = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x5c\xcd\xff\x69\x00\x00\x00\x00IEND\xaeB`\x82'


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session", autouse=False)
def cleanup_test_profiles(auth_headers):
    """Delete any TEST_ profiles created in previous runs."""
    yield
    try:
        r = requests.get(f"{API}/profiles", headers=auth_headers)
        if r.status_code == 200:
            for p in r.json():
                if p["name"].startswith("TEST_") or p["slug"].startswith("test-"):
                    requests.delete(f"{API}/profiles/{p['slug']}", headers=auth_headers)
        # Reset main to demo defaults
        requests.post(f"{API}/profiles/{DEFAULT_SLUG}/reset", headers=auth_headers)
    except Exception as e:
        print(f"Cleanup failed: {e}")


# ---------------- Public content endpoint w/ new fields ----------------
class TestPublicContent:
    def test_get_content_returns_new_fields(self):
        r = requests.get(f"{API}/content")
        assert r.status_code == 200
        data = r.json()
        for key in ["hero", "coreThesis", "careerEvolution", "projects", "capabilities", "nowNext", "contact"]:
            assert key in data
        # New visible flags
        assert data["hero"].get("visible") is True
        assert data["contact"].get("visible") is True
        # Hero fields
        assert "image" in data["hero"]
        assert "imageAlt" in data["hero"]
        assert "imagePosition" in data["hero"]
        # Contact new fields
        assert "phone" in data["contact"]
        assert "lineUrl" in data["contact"]
        assert "resume" in data["contact"]
        assert "text" in data["contact"]["resume"]
        # Core thesis icon fields
        for it in data["coreThesis"]["items"]:
            assert "iconType" in it
            assert "icon" in it
        # Career stage visible
        for st in data["careerEvolution"]["stages"]:
            assert "visible" in st
        assert len(data["careerEvolution"]["stages"]) >= 5


# ---------------- Public profile-by-slug ----------------
class TestPublicProfileBySlug:
    def test_get_default_profile_by_slug(self):
        r = requests.get(f"{API}/profiles/{DEFAULT_SLUG}")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == DEFAULT_SLUG
        assert d.get("is_default") is True
        assert "content" in d
        assert "hero" in d["content"]

    def test_get_nonexistent_profile_returns_404(self):
        r = requests.get(f"{API}/profiles/does-not-exist-xyz-123")
        assert r.status_code == 404


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

    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---------------- Protected endpoints w/o auth ----------------
class TestProtectedNoAuth:
    def test_list_profiles_unauth(self):
        r = requests.get(f"{API}/profiles")
        assert r.status_code == 401

    def test_create_profile_unauth(self):
        r = requests.post(f"{API}/profiles", json={"name": "x"})
        assert r.status_code == 401

    def test_put_profile_unauth(self):
        r = requests.put(f"{API}/profiles/{DEFAULT_SLUG}", json={"content": {}})
        assert r.status_code == 401

    def test_patch_profile_unauth(self):
        r = requests.patch(f"{API}/profiles/{DEFAULT_SLUG}", json={"name": "x"})
        assert r.status_code == 401

    def test_delete_profile_unauth(self):
        r = requests.delete(f"{API}/profiles/{DEFAULT_SLUG}")
        assert r.status_code == 401

    def test_reset_profile_unauth(self):
        r = requests.post(f"{API}/profiles/{DEFAULT_SLUG}/reset")
        assert r.status_code == 401

    def test_upload_unauth(self):
        r = requests.post(f"{API}/upload", files={"file": ("t.png", io.BytesIO(PNG_BYTES), "image/png")})
        assert r.status_code == 401


# ---------------- Profile CRUD ----------------
class TestProfileCRUD:
    created_slug = None

    @classmethod
    def teardown_class(cls):
        """Cleanup TEST_ profiles and reset main after this class finishes."""
        try:
            r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
            if r.status_code != 200:
                return
            hdr = {"Authorization": f"Bearer {r.json()['access_token']}"}
            profiles = requests.get(f"{API}/profiles", headers=hdr).json()
            for p in profiles:
                if p["slug"] != DEFAULT_SLUG and (p["name"].startswith("TEST_") or p["slug"].startswith("test-")):
                    requests.delete(f"{API}/profiles/{p['slug']}", headers=hdr)
            # Ensure main is default and reset to demo
            requests.patch(f"{API}/profiles/{DEFAULT_SLUG}", json={"is_default": True}, headers=hdr)
            requests.post(f"{API}/profiles/{DEFAULT_SLUG}/reset", headers=hdr)
        except Exception as e:
            print(f"teardown_class cleanup failed: {e}")

    def test_1_list_profiles_has_default(self, auth_headers):
        r = requests.get(f"{API}/profiles", headers=auth_headers)
        assert r.status_code == 200
        profiles = r.json()
        assert isinstance(profiles, list)
        assert any(p["is_default"] for p in profiles), "At least one default profile must exist"
        assert any(p["slug"] == DEFAULT_SLUG for p in profiles)

    def test_2_create_profile_copies_from_source(self, auth_headers):
        r = requests.post(
            f"{API}/profiles",
            json={"name": TEST_PROFILE_NAME, "source_slug": DEFAULT_SLUG},
            headers=auth_headers,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["name"] == TEST_PROFILE_NAME
        assert d["is_default"] is False
        assert d["slug"]  # slug present
        TestProfileCRUD.created_slug = d["slug"]

        # Verify via admin GET
        r2 = requests.get(f"{API}/admin/profiles/{d['slug']}", headers=auth_headers)
        assert r2.status_code == 200
        content = r2.json()["content"]
        # Content should have same hero name as default
        default_content = requests.get(f"{API}/content").json()
        assert content["hero"]["name"] == default_content["hero"]["name"]

    def test_3_create_duplicate_generates_unique_slug(self, auth_headers):
        r = requests.post(f"{API}/profiles", json={"name": TEST_PROFILE_NAME}, headers=auth_headers)
        assert r.status_code == 200
        new_slug = r.json()["slug"]
        assert new_slug != TestProfileCRUD.created_slug
        # cleanup dupe immediately
        requests.delete(f"{API}/profiles/{new_slug}", headers=auth_headers)

    def test_4_put_content_persists(self, auth_headers):
        slug = TestProfileCRUD.created_slug
        assert slug
        r = requests.get(f"{API}/admin/profiles/{slug}", headers=auth_headers)
        content = r.json()["content"]
        content["hero"]["tagline"] = "TEST_ tagline via pytest"
        content["contact"]["phone"] = "+886-900-000-000"
        content["contact"]["lineUrl"] = "https://line.me/ti/p/testxxx"
        r2 = requests.put(f"{API}/profiles/{slug}", json={"content": content}, headers=auth_headers)
        assert r2.status_code == 200
        assert r2.json().get("success") is True
        # Verify persistence
        r3 = requests.get(f"{API}/profiles/{slug}")
        assert r3.status_code == 200
        c = r3.json()["content"]
        assert c["hero"]["tagline"] == "TEST_ tagline via pytest"
        assert c["contact"]["phone"] == "+886-900-000-000"
        assert c["contact"]["lineUrl"] == "https://line.me/ti/p/testxxx"

    def test_5_patch_rename(self, auth_headers):
        slug = TestProfileCRUD.created_slug
        new_name = "TEST_ Renamed"
        r = requests.patch(f"{API}/profiles/{slug}", json={"name": new_name}, headers=auth_headers)
        assert r.status_code == 200
        # verify
        r2 = requests.get(f"{API}/profiles", headers=auth_headers)
        assert any(p["slug"] == slug and p["name"] == new_name for p in r2.json())

    def test_6_patch_change_slug(self, auth_headers):
        slug = TestProfileCRUD.created_slug
        new_slug = f"test-renamed-slug-{os.getpid()}"
        r = requests.patch(f"{API}/profiles/{slug}", json={"slug": new_slug}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json().get("slug") == new_slug
        # old slug should 404
        assert requests.get(f"{API}/profiles/{slug}").status_code == 404
        # new slug should work
        assert requests.get(f"{API}/profiles/{new_slug}").status_code == 200
        TestProfileCRUD.created_slug = new_slug

    def test_7_patch_set_default_unsets_others(self, auth_headers):
        slug = TestProfileCRUD.created_slug
        r = requests.patch(f"{API}/profiles/{slug}", json={"is_default": True}, headers=auth_headers)
        assert r.status_code == 200
        r2 = requests.get(f"{API}/profiles", headers=auth_headers)
        profiles = r2.json()
        defaults = [p for p in profiles if p["is_default"]]
        assert len(defaults) == 1
        assert defaults[0]["slug"] == slug
        # /api/content should now return this profile's content (may race with other workers; retry once)
        for _ in range(3):
            c = requests.get(f"{API}/content").json()
            if c["hero"]["tagline"] == "TEST_ tagline via pytest":
                break
        assert c["hero"]["tagline"] == "TEST_ tagline via pytest"

    def test_8_reset_profile(self, auth_headers):
        slug = TestProfileCRUD.created_slug
        r = requests.post(f"{API}/profiles/{slug}/reset", headers=auth_headers)
        assert r.status_code == 200
        # Verify content restored (tagline reverted)
        c = requests.get(f"{API}/profiles/{slug}").json()["content"]
        assert c["hero"]["tagline"] != "TEST_ tagline via pytest"
        assert "系統" in c["hero"]["tagline"]

    def test_9_delete_default_promotes_other(self, auth_headers):
        # Currently created_slug is default. Delete it - main should be promoted.
        slug = TestProfileCRUD.created_slug
        r = requests.delete(f"{API}/profiles/{slug}", headers=auth_headers)
        assert r.status_code == 200
        # Verify a new default exists
        r2 = requests.get(f"{API}/profiles", headers=auth_headers)
        profiles = r2.json()
        defaults = [p for p in profiles if p["is_default"]]
        assert len(defaults) == 1
        # And the promoted one is main
        assert defaults[0]["slug"] == DEFAULT_SLUG

    def test_a_cannot_delete_last_profile(self, auth_headers):
        # Ensure only main remains
        r = requests.get(f"{API}/profiles", headers=auth_headers)
        profiles = r.json()
        # Remove any leftover test profiles
        for p in profiles:
            if p["slug"] != DEFAULT_SLUG:
                requests.delete(f"{API}/profiles/{p['slug']}", headers=auth_headers)
        # Now try deleting the only one
        r2 = requests.delete(f"{API}/profiles/{DEFAULT_SLUG}", headers=auth_headers)
        assert r2.status_code == 400

    def test_b_delete_nonexistent(self, auth_headers):
        r = requests.delete(f"{API}/profiles/no-such-slug-xyz", headers=auth_headers)
        # With only 1 profile remaining, count<=1 triggers 400 before existence check.
        # Add a temp profile so we can properly test 404 path.
        cr = requests.post(f"{API}/profiles", json={"name": "TEST_ temp"}, headers=auth_headers)
        assert cr.status_code == 200
        tmp = cr.json()["slug"]
        r2 = requests.delete(f"{API}/profiles/no-such-slug-xyz", headers=auth_headers)
        assert r2.status_code == 404
        # Cleanup
        requests.delete(f"{API}/profiles/{tmp}", headers=auth_headers)


# ---------------- Upload ----------------
class TestUpload:
    def test_upload_png(self, auth_headers):
        r = requests.post(f"{API}/upload",
                          files={"file": ("t.png", io.BytesIO(PNG_BYTES), "image/png")},
                          headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["success"] is True
        assert d["url"].startswith("data:image/png;base64,")

    def test_upload_bad_type(self, auth_headers):
        r = requests.post(f"{API}/upload",
                          files={"file": ("t.txt", io.BytesIO(b"hello"), "text/plain")},
                          headers=auth_headers)
        assert r.status_code == 400



# ---------------- Iteration 3: Project DB / Relation Model ----------------
class TestProjectDatabaseModel:
    def test_content_has_project_database(self):
        d = requests.get(f"{API}/content").json()
        assert "projectDatabase" in d
        pdb = d["projectDatabase"]
        assert isinstance(pdb, list) and len(pdb) >= 5
        required = {"id", "slug", "enabled", "order", "situation", "situationEnabled",
                    "achievement", "learned", "results", "notes", "links", "tags",
                    "title", "shortTitle", "period", "summary"}
        for p in pdb:
            assert required.issubset(set(p.keys())), f"Missing keys in {p.get('slug')}: {required - set(p.keys())}"
        slugs = {p["slug"] for p in pdb}
        assert {"medical-literature", "teaching-condense", "enterprise-workflow",
                "ai-content-pipeline", "cross-domain-visual"}.issubset(slugs)

    def test_stages_use_relation_model(self):
        d = requests.get(f"{API}/content").json()
        stages = d["careerEvolution"]["stages"]
        assert len(stages) >= 5
        for st in stages:
            assert "relatedProjectIds" in st
            assert "manualTags" in st
            assert "removedAutoTags" in st
            assert "slug" in st
            # old fields must be gone
            assert "situation" not in st
            assert "actions" not in st

    def test_projects_items_are_slots(self):
        d = requests.get(f"{API}/content").json()
        items = d["projects"]["items"]
        for it in items:
            assert "projectId" in it
            assert "overrides" in it
            assert "visible" in it

    def test_hero_layout_shape_showimage(self):
        d = requests.get(f"{API}/content").json()
        assert d["hero"]["layout"] in ("left", "right", "center")
        assert d["hero"]["shape"] in ("card", "rounded", "circle")
        assert isinstance(d["hero"]["showImage"], bool)

    def test_capabilities_categories_visible_description(self):
        d = requests.get(f"{API}/content").json()
        for c in d["capabilities"]["categories"]:
            assert "visible" in c
            assert "description" in c


class TestProfileIndependence:
    created_slug = None

    @classmethod
    def teardown_class(cls):
        try:
            r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
            if r.status_code != 200:
                return
            hdr = {"Authorization": f"Bearer {r.json()['access_token']}"}
            profiles = requests.get(f"{API}/profiles", headers=hdr).json()
            for p in profiles:
                if p["slug"] != DEFAULT_SLUG and (p["name"].startswith("TEST_") or p["slug"].startswith("test-")):
                    requests.delete(f"{API}/profiles/{p['slug']}", headers=hdr)
            requests.patch(f"{API}/profiles/{DEFAULT_SLUG}", json={"is_default": True}, headers=hdr)
            requests.post(f"{API}/profiles/{DEFAULT_SLUG}/reset", headers=hdr)
        except Exception:
            pass

    def test_1_create_from_main(self, auth_headers):
        r = requests.post(f"{API}/profiles",
                          json={"name": "TEST_ Independence", "source_slug": DEFAULT_SLUG},
                          headers=auth_headers)
        assert r.status_code == 200
        TestProfileIndependence.created_slug = r.json()["slug"]

    def test_2_edit_projectdb_does_not_leak(self, auth_headers):
        slug = TestProfileIndependence.created_slug
        assert slug
        # Get target content
        target = requests.get(f"{API}/admin/profiles/{slug}", headers=auth_headers).json()["content"]
        # Modify projectDatabase[0].title
        target["projectDatabase"][0]["title"] = "TEST_ Edited Title In Alt"
        # Modify a stage's relatedProjectIds to only include one
        first_pid = target["projectDatabase"][0]["id"]
        target["careerEvolution"]["stages"][0]["relatedProjectIds"] = [first_pid]
        r = requests.put(f"{API}/profiles/{slug}", json={"content": target}, headers=auth_headers)
        assert r.status_code == 200

        # main untouched
        main_c = requests.get(f"{API}/profiles/{DEFAULT_SLUG}").json()["content"]
        assert main_c["projectDatabase"][0]["title"] != "TEST_ Edited Title In Alt"

        # alt persisted
        alt_c = requests.get(f"{API}/profiles/{slug}").json()["content"]
        assert alt_c["projectDatabase"][0]["title"] == "TEST_ Edited Title In Alt"
        assert alt_c["careerEvolution"]["stages"][0]["relatedProjectIds"] == [first_pid]
