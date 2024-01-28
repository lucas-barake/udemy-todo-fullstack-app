import { api } from "./utils/api.ts";

void api.test();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <h1>Typescript Starter</h1>
  <div>
    Look in the console for the output!
  </div>
`;
