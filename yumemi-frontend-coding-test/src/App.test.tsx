import React from "react";
import { render, screen, act } from "@testing-library/react";
import App from "./App";
import { fetchPrefectures } from "./api";

describe("Prefectures", () => {
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

    // TypeError: window.ResizeObserver is not a constructorへの対処としてmock化
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("fetchPrefectures mock", async () => {
    const prefectures = await fetchPrefectures();
    expect(prefectures[0].prefCode).toBe(1);
    expect(prefectures[0].prefName).toBe("北海道");
    for (let i = 0; i < prefectures.length; i++) {
      expect(prefectures[i].prefCode).toBe(fakeData.result[i].prefCode);
      expect(prefectures[i].prefName).toBe(fakeData.result[i].prefName);
    }
  });

  test("render checkboxes", async () => {
    await act(async () => render(<App />));
    const prefecture = screen.getByText(/東京都/i);
    expect(prefecture).toBeInTheDocument();
  });
});
