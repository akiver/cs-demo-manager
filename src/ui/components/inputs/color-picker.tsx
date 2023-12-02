import React from 'react';

export function ColorPicker(props: React.HTMLProps<HTMLInputElement>) {
  return <input type="color" {...props} />;
}
