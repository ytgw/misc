import React from "react";
import { render, screen, act } from "@testing-library/react";
import App, { fetchPrefectures } from "./App";

const fakeData = {
  result: [
    { prefCode: 1, prefName: "北海道" },
    { prefCode: 13, prefName: "東京都" },
    { prefCode: 14, prefName: "神奈川県" },
  ],
};

beforeEach(() => {
  const fakeResponse: any = {
    json: async () => await Promise.resolve(fakeData),
  };
  jest.spyOn(global, "fetch").mockResolvedValue(fakeResponse);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("fetchPrefectures mock", async () => {
  const prefectures = await fetchPrefectures();
  expect(prefectures[0].prefCode).toBe(1);
  expect(prefectures[0].prefName).toBe("北海道");
  expect(prefectures).toBe(fakeData.result);
});

test("render checkboxes", async () => {
  await act(async () => render(<App />));
  const prefecture = screen.getByText(/東京都/i);
  expect(prefecture).toBeInTheDocument();
});
