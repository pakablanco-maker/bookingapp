import React from 'react';
import { Navbar, Container, Dropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const NavbarComponent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Navbar className="navbar-branded sticky-top">
      <Container fluid>
        <Navbar.Brand href="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
          📅 BookingApp
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Dropdown align="end">
            <Dropdown.Toggle
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid white',
                color: 'white',
              }}
              id="dropdown-basic"
            >
              <FaUser /> {user?.name}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="/profile">
                <FaUser /> Profile
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
