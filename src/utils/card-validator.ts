export const luhnCheck = (num: string): boolean => {
  const arr = `${num}`
    .split('')
    .reverse()
    .map((x) => Number.parseInt(x));
  const lastDigit = arr.shift();
  let sum = arr.reduce(
    (acc, val, i) =>
      i % 2 !== 0 ? acc + val : acc + ((val *= 2) > 9 ? val - 9 : val),
    0,
  );
  sum += lastDigit;
  return sum % 10 === 0;
};
