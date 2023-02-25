import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders learn react link", () => {
  render(<App />);
  const prefecture = screen.getByText(/東京都/i);
  expect(prefecture).toBeInTheDocument();
});
