import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownButton } from 'react-bootstrap';

const editorDropdown = ({ defaultItem, items, handler }) => {
  return (
    <DropdownButton
      alignRight
      id="dropdown-basic-button"
      className="ml-auto mr-2"
      title={defaultItem}
      size="sm"
      variant="dark"
    >
      {items.map(item => {
        return (
          <Dropdown.Item
            as="button"
            key={item}
            onClick={e => handler(e, item)}
          >
            {item}
          </Dropdown.Item>
        );
      })}
    </DropdownButton>
  );
};

editorDropdown.propTypes = {
  defaultItem: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  handler: PropTypes.func.isRequired,
};

export default editorDropdown;
