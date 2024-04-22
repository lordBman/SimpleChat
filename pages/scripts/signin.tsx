import ReactDOMClient from "react-dom/client";
import React from "react";
import Signin from "../signin";

ReactDOMClient.hydrateRoot( document.getElementById("root")!, <Signin />);