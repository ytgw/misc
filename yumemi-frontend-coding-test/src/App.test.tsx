import React from "react";
import { render, screen, act } from "@testing-library/react";
import App, { Prefectures, PopulationChart } from "./App";
import { fetchPrefectures, fetchPopulation } from "./api";

jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: any }) => (
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  };
});

jest.mock("./api", () => {
  const OriginalModule = jest.requireActual("./api");

  return {
    ...OriginalModule,
    fetchPrefectures: async () => {
      const fakePrefectureNames = [
        { prefCode: 1, prefName: "北海道" },
        { prefCode: 13, prefName: "東京都" },
        { prefCode: 14, prefName: "神奈川県" },
      ];
      return await Promise.resolve(fakePrefectureNames);
    },
    fetchPopulation: async (prefCodes: number[]) => {
      // fakeデータの作成
      const fakeYears: number[] = [];
      for (let i = 1960; i <= 2020; i += 5) {
        fakeYears.push(i);
      }
      const fakePopulations = prefCodes.map((prefCode) => {
        const data = fakeYears.map((year) => {
          return { year, value: year * prefCode };
        });
        return { prefCode, data };
      });

      return await Promise.resolve(fakePopulations);
    },
  };
});

describe("Prefectures", () => {
  const fakeData = {
    result: [
      { prefCode: 1, prefName: "北海道" },
      { prefCode: 13, prefName: "東京都" },
      { prefCode: 14, prefName: "神奈川県" },
    ],
  };

  test("fetchPrefectures mock", async () => {
    const prefectures = await fetchPrefectures();
    expect(prefectures[0].prefCode).toBe(1);
    expect(prefectures[0].prefName).toBe("北海道");
    for (let i = 0; i < prefectures.length; i++) {
      expect(prefectures[i].prefCode).toBe(fakeData.result[i].prefCode);
      expect(prefectures[i].prefName).toBe(fakeData.result[i].prefName);
    }
  });

  test("render Prefectures", async () => {
    await act(async () =>
      render(<Prefectures checkedPrefectures={fakeData.result} setCheckedPrefectures={() => {}} />)
    );
    const prefecture = screen.getByText(/東京都/i);
    expect(prefecture).toBeInTheDocument();
  });
});

describe("PopulationChart", () => {
  beforeEach(() => {
    // TypeError: window.ResizeObserver is not a constructorへの対処としてmock化
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("fetchPopulation mock", async () => {
    const fetchedPopulations = await fetchPopulation([1, 2, 3]);
    expect(fetchedPopulations[0].prefCode).toBe(1);
    fetchedPopulations[0].data.forEach(({ year, value }, index) => {
      expect(year).toBe(1960 + 5 * index);
      expect(value).toBe(year * fetchedPopulations[0].prefCode);
    });

    for (let i = 0; i < fetchedPopulations.length; i++) {
      const fetchedPopulation = fetchedPopulations[i];
      const prefCode = fetchedPopulation.prefCode;
      fetchedPopulation.data.forEach(({ year, value }, index) => {
        expect(year).toBe(1960 + 5 * index);
        expect(value).toBe(year * prefCode);
      });
    }
  });

  test("render PopulationChart", async () => {
    const prefectures = [
      { prefCode: 1, prefName: "北海道" },
      { prefCode: 13, prefName: "東京都" },
      { prefCode: 14, prefName: "神奈川県" },
    ];
    await act(async () => render(<PopulationChart prefectures={prefectures} />));
    const source = screen.getByText(/出典：RESAS（地域経済分析システム）/i);
    expect(source).toBeInTheDocument();

    const chart = screen.getByText(/東京都/i);
    expect(chart).toBeInTheDocument();
  });
});

describe("App", () => {
  beforeEach(() => {
    // TypeError: window.ResizeObserver is not a constructorへの対処としてmock化
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("render App", async () => {
    await act(async () => render(<App />));
    expect(screen.getByText(/人口推移グラフを表示したい都道府県をチェックしてください。/i)).toBeInTheDocument();
  });
});
