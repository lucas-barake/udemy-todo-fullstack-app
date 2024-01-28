export const api = {
  test: async () => {
    const response = await fetch("http://localhost:5000");
    const json: unknown = await response.json();
    return json;
  },
};
