import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

test("renders square", () => {
  const { container } = render(<App />);
  const squares = container.getElementsByClassName("square");
  expect(squares.length).toBe(9);
});
