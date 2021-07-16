import React from "react";
import { Navbar as Navheader, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <Navheader
      bg="light"
      expand="sm"
      style={{ justifyContent: "space-between" }}
    >
      <Navheader.Brand as={Link} to="/">
        My Drive
      </Navheader.Brand>
      <Nav>
        <Nav.Link as={Link} to="/user">
          My Profile
        </Nav.Link>
      </Nav>
    </Navheader>
  );
}
