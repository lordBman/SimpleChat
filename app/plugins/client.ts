import Elysia from "elysia";
import keyAuthenicationPlugin from "./key-authentication";
import CookieAuthenicationPlugin from "./cookie-authentication";

const clientAuthenicationPlugin = new Elysia().use(keyAuthenicationPlugin).use(CookieAuthenicationPlugin);

export default clientAuthenicationPlugin;