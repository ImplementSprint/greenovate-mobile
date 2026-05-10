import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

describe('theme tokens', () => {
  it('exposes expected color palette keys', () => {
    expect(colors).toEqual({
      background: '#FFFFFF',
      heroBackground: '#F5FAFF',
      surface: '#FFFFFF',
      text: '#0F172A',
      muted: '#526785',
      subtle: '#EAF1FA',
      border: '#E5ECF5',
      primary: '#155DFF',
      primaryDark: '#0B45D8',
    });
  });

  it('exposes expected spacing scale', () => {
    expect(spacing).toEqual({
      xs: 4,
      sm: 8,
      md: 12,
      lg: 20,
      xl: 28,
    });
  });
});
