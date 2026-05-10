import { Children, isValidElement } from 'react';

import { AppProvider } from '../../src/context/AppContext';
import App from '../../src/bootstrap/App';

describe('App', () => {
  it('renders a status bar and app provider', () => {
    const element = App();

    expect(isValidElement(element)).toBe(true);

    const children = Children.toArray(element.props.children).filter(isValidElement);
    expect(children).toHaveLength(2);

    const provider = children[1];
    expect(provider).toBeDefined();
    expect(provider?.type).toBe(AppProvider);
  });
});
