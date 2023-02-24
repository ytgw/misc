import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders square", () => {
  render(<App />);
  const linkElement = screen.getByText(/1/i);
  expect(linkElement).toBeInTheDocument();
});
