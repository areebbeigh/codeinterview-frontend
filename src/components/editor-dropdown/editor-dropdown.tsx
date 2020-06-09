import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';

interface Props {
  defaultItem: string;
  items: string[];
  handler: (e: React.MouseEvent, item: string) => void;
}

function editorDropdown({
  defaultItem,
  items,
  handler,
}: Props): React.ReactElement {
  return (
    <DropdownButton
      alignRight
      id="dropdown-basic-button"
      className="ml-auto mr-2"
      title={defaultItem}
      size="sm"
      variant="dark"
    >
      {items.map((item: string) => {
        return (
          <Dropdown.Item
            as="button"
            key={item}
            onClick={(e: React.MouseEvent) => handler(e, item)}
          >
            {item}
          </Dropdown.Item>
        );
      })}
    </DropdownButton>
  );
}

export default editorDropdown;
