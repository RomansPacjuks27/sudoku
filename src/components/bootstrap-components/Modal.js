import * as React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export const ModalComponent = props => {
  
    return (
        <div>
            <Modal show={props.showModal}>
            <Modal.Header closeButton>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{props.text}</Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => { props.onButtonClick(true) } }>
                    {props.button1text}
                </Button>
                <Button variant="secondary" onClick={() => { props.onButtonClick(false) } }>
                    {props.button2text}
                </Button>
            </Modal.Footer>
            </Modal>
        </div>
    );
  }