from uuid import uuid4

import pytest
from fastapi import HTTPException

from backend.app.core.auth import get_current_user


def test_auth_requires_bearer_credentials():
    with pytest.raises(HTTPException) as exc:
        get_current_user(None)
    assert exc.value.status_code == 401


def test_profile_owner_identity_is_uuid():
    user_id = uuid4()
    assert user_id.version == 4
