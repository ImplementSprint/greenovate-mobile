import { HomeScreen } from '../../src/features/home/screens/HomeScreen';

describe('HomeScreen', () => {
  it('exports the converted native home screen', () => {
    expect(typeof HomeScreen).toBe('function');
  });
});
