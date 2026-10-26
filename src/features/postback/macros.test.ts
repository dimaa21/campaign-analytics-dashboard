import { describe, expect, it } from 'vitest';
import { applyMacros, unresolvedMacros } from './macros';

describe('postback macros', () => {
  it('replaces known macros and leaves unknown ones intact', () => {
    const url = applyMacros('https://tracker.example.test/postback?cid={clickid}&payout={payout}&x={unknown}', {
      clickid: 'clk_1',
      payout: '46.80',
    });
    expect(url).toBe('https://tracker.example.test/postback?cid=clk_1&payout=46.80&x={unknown}');
    expect(unresolvedMacros(url)).toEqual(['unknown']);
  });
});
