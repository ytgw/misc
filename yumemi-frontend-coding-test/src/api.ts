import { API_KEY } from "./secret";

export interface PrefectureType {
  prefCode: number;
  prefName: string;
}

export interface PrefPopulation {
  prefCode: number;
  data: Array<{ year: number; value: number }>;
}

function isPrefectureArray(array: any): array is PrefectureType[] {
  if (!(array instanceof Array)) {
    return false;
  }
  const isPrefArray = array.every((e): boolean => {
    if (typeof e.prefCode !== "number") {
      return false;
    }
    if (typeof e.prefName !== "string") {
      return false;
    }
    return true;
  });
  return isPrefArray;
}

export async function fetchPrefectures(): Promise<PrefectureType[]> {
  const isFake = true;
  if (isFake) {
    return [
      { prefCode: 1, prefName: "北海道" },
      { prefCode: 13, prefName: "東京都" },
      { prefCode: 14, prefName: "神奈川県" },
    ];
  }
  const response = await fetch("https://opendata.resas-portal.go.jp/api/v1/prefectures", {
    method: "GET",
    headers: { "X-API-KEY": API_KEY },
  });
  const data = await response.json();
  const prefectures = data.result;
  if (!isPrefectureArray(prefectures)) {
    throw new Error("fetched data is not prefecture array.");
  }
  return prefectures;
}

function isPopulationData(data: any): boolean {
  if (!(data instanceof Array)) {
    return false;
  }
  const isAllElementValid = data.every((e): boolean => {
    if (typeof e.year !== "number") {
      return false;
    }
    if (typeof e.value !== "number") {
      return false;
    }
    return true;
  });
  return isAllElementValid;
}

function isPrefPopulationArray(array: any): array is PrefPopulation[] {
  if (!(array instanceof Array)) {
    return false;
  }
  const isPrefArray = array.every((e): boolean => {
    if (typeof e.prefCode !== "number") {
      return false;
    }

    const data = e.data;
    if (!(data instanceof Array)) {
      return false;
    }

    return isPopulationData(e.data);
  });
  return isPrefArray;
}

export async function fetchPopulation(prefCodes: number[]): Promise<PrefPopulation[]> {
  const isFake = true;
  if (isFake) {
    const fakeYears: number[] = [];
    for (let i = 1960; i <= 2045; i += 5) fakeYears.push(i);

    const fakePopulations: PrefPopulation[] = prefCodes.map((prefCode, index) => {
      const data = fakeYears.map((year) => {
        return { year, value: year * (index + 5) };
      });
      return { prefCode, data };
    });
    return fakePopulations;
  }

  const populations: PrefPopulation[] = [];
  for (const prefCode of prefCodes) {
    const url =
      "https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=" +
      prefCode.toString();
    const response = await fetch(url, {
      method: "GET",
      headers: { "X-API-KEY": API_KEY },
    });
    const data = await response.json();
    const array = data.result.data;
    if (!(array instanceof Array)) {
      throw new Error("fetched data is invalid.");
    }
    const totalPopulation = array.find((element) => element.label === "総人口").data;
    if (!isPopulationData(totalPopulation)) {
      throw new Error("fetched data is not population data.");
    }
    populations.push({ prefCode, data: totalPopulation });
  }

  if (!isPrefPopulationArray(populations)) {
    throw new Error("fetched data is not population array.");
  }
  return populations;
}
