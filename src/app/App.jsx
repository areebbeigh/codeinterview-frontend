import React from 'react';
import { Container, Row, Button, Card } from 'react-bootstrap';
import getRoomService from 'api/http/room-service';

import DemoImage from 'assets/images/demo.jpg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const roomService = getRoomService();
  let clicked = false;
  return (
    <Container fluid className="p-4 wrapper text-center">
      <Row className="d-flex flex-column justify-content-center">
        <Card className="p-4 align-self-center mt-4 text-center welcome-card">
          <Card.Body>
            <Card.Title as="h3">Welcome to CodeInterview!</Card.Title>
            <Card.Text>
              CodeInterview is a home made solution and personal
              self-learning project for online coding interviews by
              @areebbeigh. No sign-ups, just create a room and share
              the URL.
              <br />
              It&apos;s all open-source.
            </Card.Text>
          </Card.Body>
        </Card>
      </Row>
      <Row className="d-flex flex-column justify-content-center">
        <img
          className="p-4 demo-image align-self-center"
          src={DemoImage}
          alt="demo"
        />

        <Button
          className="align-self-center"
          size="sm"
          variant="primary"
          onClick={() => {
            if (clicked) return;
            clicked = true;
            roomService
              .createNewRoom()
              .then(room => {
                window.location.href = `/room/${room.data.room_id}`;
              })
              .catch(console.error);
          }}
        >
          Try It Out!
        </Button>
      </Row>
    </Container>
  );
};

export default App;
