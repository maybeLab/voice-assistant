export default (...e) => {
  return window.fetch(...e).then((res) => {
    if (res.ok) {
      return res;
    } else {
      return Promise.reject(res);
    }
  });
};
