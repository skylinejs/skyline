/*
 * Fuzzy
 * https://github.com/myork/fuzzy
 *
 * Copyright (c) 2012 Matt York
 * Licensed under the MIT license.
 */

// If `pattern` matches `str`, wrap each matching character
// in `opts.pre` and `opts.post`. If no match, return null
function fuzzyMatch(pattern: string, str: string, opts: any) {
  opts = opts || {};
  var patternIdx = 0,
    result = [],
    len = str.length,
    totalScore = 0,
    currScore = 0,
    // prefix
    pre = opts.pre || '',
    // suffix
    post = opts.post || '',
    // String to compare against. This might be a lowercase version of the
    // raw string
    compareString = (opts.caseSensitive && str) || str.toLowerCase(),
    ch;

  pattern = (opts.caseSensitive && pattern) || pattern.toLowerCase();

  // For each character in the string, either add it to the result
  // or wrap in template if it's the next string in the pattern
  for (var idx = 0; idx < len; idx++) {
    ch = str[idx];
    if (compareString[idx] === pattern[patternIdx]) {
      ch = pre + ch + post;
      patternIdx += 1;

      // consecutive characters should increase the score more than linearly
      currScore += 1 + currScore;
    } else {
      currScore = 0;
    }
    totalScore += currScore;
    result[result.length] = ch;
  }

  // return rendered string if we have a match for every char
  if (patternIdx === pattern.length) {
    // if the string is an exact match with pattern, totalScore should be maxed
    totalScore = compareString === pattern ? Infinity : totalScore;
    return { rendered: result.join(''), score: totalScore };
  }

  return null;
}

function fuzzyFilter(pattern: string, arr: any[], opts: any) {
  if (!arr || arr.length === 0) {
    return [];
  }
  if (typeof pattern !== 'string') {
    return arr;
  }
  opts = opts || {};
  return (
    arr
      .reduce(function (prev, element, idx, arr) {
        var str = element;
        if (opts.extract) {
          str = opts.extract(element);
        }
        var rendered = fuzzyMatch(pattern, str, opts);
        if (rendered != null) {
          prev[prev.length] = {
            string: rendered.rendered,
            score: rendered.score,
            index: idx,
            original: element,
          };
        }
        return prev;
      }, [])

      // Sort by score. Browsers are inconsistent wrt stable/unstable
      // sorting, so force stable by using the index in the case of tie.
      // See http://ofb.net/~sethml/is-sort-stable.html
      .sort(function (a: any, b: any) {
        var compare = b.score - a.score;
        if (compare) return compare;
        return a.index - b.index;
      })
  );
}

export { fuzzyFilter };
