export const delay = (timeout: number, resolveValue: any = undefined) => {
  return new Promise((resolve) => {
    setTimeout(
      resolve.bind(null, resolveValue),
      timeout,
    );
  });
};
