import pytest

from server.models.user import Organization, UserRole, User, Role

@pytest.fixture
def admin_role(db_session):
    admin_role = Role(name=UserRole.ADMIN)
    db_session.add(admin_role)
    db_session.commit()
    return admin_role


@pytest.fixture
def stop_hate_organization(db_session):
    stop_hate_organization = Organization(name="Stop Hate in Schools")
    db_session.add(stop_hate_organization)
    db_session.commit()
    return stop_hate_organization


@pytest.fixture
def editor_role(db_session):
    editor_role = Role(name="Aditor")
    db_session.add(editor_role)
    db_session.commit()
    return editor_role


@pytest.fixture
def user_admin(db_session, admin_role, stop_hate_organization):
    user = User(
        first_name="Test",
        last_name="User",
        email="user@test.com",
        organization=stop_hate_organization,
    )

    user.roles.append(admin_role)

    db_session.add(user)
    db_session.commit()
    return user


def test_get_users(db_session, admin_role, user_admin):
    user = db_session.query(User).filter_by(email="user@test.com").first()
    user2 = db_session.query(User).filter_by(email="user@.com").first()

    assert user.roles[0] == admin_role
    assert user2 is None
