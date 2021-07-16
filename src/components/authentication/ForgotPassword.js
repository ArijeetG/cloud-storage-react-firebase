import React, { useRef, useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CenteredContainer from "./CenteredContainer";

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();

  const [error, setErrror] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUSubmit(e) {
    e.preventDefault();

    try {
      setErrror("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage("Check your inbox for furthur instructions");
    } catch (error) {
      setErrror("Failed to reset password");
    }
    setLoading(false);
  }

  return (
    <CenteredContainer>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Password Reset</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleUSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" required ref={emailRef} />
            </Form.Group>
            <Button className="w-100" type="submit" disabled={loading}>
              Reset Password
            </Button>
          </Form>
          <div className="w-100 text-center mt-3">
            <Link to="/forgot-password">Login?</Link>
          </div>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </CenteredContainer>
  );
}
