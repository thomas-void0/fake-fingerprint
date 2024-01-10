import { NavigatorHandle } from "./lib/navigator";

new NavigatorHandle((key) => {
  console.log("key:", key);
});
