import { tidy } from './chat.service';

/**
 * The model is instructed not to use Markdown, but instructions are not guarantees - models drift,
 * and a new model version may format differently. `tidy` is the safety net that keeps stray
 * Markdown out of a plain-text chat bubble, so these cover what it has to survive.
 */
describe('tidy (chat reply formatting)', () => {
  it('strips bold and italic markers but keeps the words', () => {
    expect(tidy('Mangoes are **rich** in vitamin C')).toBe('Mangoes are rich in vitamin C');
    expect(tidy('Mangoes are __rich__ in vitamin C')).toBe('Mangoes are rich in vitamin C');
    expect(tidy('Mangoes are *rich* in vitamin C')).toBe('Mangoes are rich in vitamin C');
    expect(tidy('Mangoes are _rich_ in vitamin C')).toBe('Mangoes are rich in vitamin C');
  });

  it('removes heading hashes', () => {
    expect(tidy('### Benefits\nGood for you')).toBe('Benefits\nGood for you');
  });

  it('turns list markers into real bullets', () => {
    expect(tidy('- Vitamin C\n- Fibre\n* Potassium')).toBe('• Vitamin C\n• Fibre\n• Potassium');
  });

  it('keeps code text but drops the backticks', () => {
    expect(tidy('Use `npm start` to run')).toBe('Use npm start to run');
    expect(tidy('```js\nconst a = 1;\n```')).toBe('const a = 1;');
  });

  it('shows a link as text plus its address', () => {
    expect(tidy('See [our site](https://example.com) for more')).toBe(
      'See our site (https://example.com) for more',
    );
  });

  it('collapses runs of blank lines so a bubble is not mostly whitespace', () => {
    expect(tidy('One\n\n\n\nTwo')).toBe('One\n\nTwo');
  });

  it('leaves ordinary prose untouched', () => {
    const plain = 'Mangoes are rich in vitamin C. They also aid digestion.';
    expect(tidy(plain)).toBe(plain);
  });

  it('never produces HTML, whatever the model sends', () => {
    // The output is always a string rendered as text, never markup - this is what keeps a
    // talkative model from becoming an XSS hole.
    const nasty = '**bold** <script>alert(1)</script> [x](https://e.com)';
    const result = tidy(nasty);

    expect(result).toContain('<script>');       // kept as literal text...
    expect(result).not.toContain('**');          // ...while the Markdown is gone
    expect(typeof result).toBe('string');
  });

  it('handles an empty or whitespace-only reply', () => {
    expect(tidy('')).toBe('');
    expect(tidy('   \n\n  ')).toBe('');
  });
});
