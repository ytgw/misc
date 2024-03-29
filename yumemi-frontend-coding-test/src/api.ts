export interface PrefectureName {
  prefCode: number;
  prefName: string;
}

interface FetchedPopulation {
  prefCode: number;
  data: Array<{ year: number; value: number }>;
}

function isPrefectureArray(array: any): array is PrefectureName[] {
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

export async function fetchPrefectures(): Promise<PrefectureName[]> {
  const url = process.env.PUBLIC_URL + "/api/prefectures.json";
  const response = await fetch(url, { method: "GET" });
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

function isFetchedPopulationArray(array: any): array is FetchedPopulation[] {
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

export async function fetchPopulation(prefCodes: number[]): Promise<FetchedPopulation[]> {
  const populations: FetchedPopulation[] = [];
  for (const prefCode of prefCodes) {
    const url = process.env.PUBLIC_URL + "/api/population_prefCode_" + prefCode.toString() + ".json";
    const response = await fetch(url, { method: "GET" });
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

  if (!isFetchedPopulationArray(populations)) {
    throw new Error("fetched data is not population array.");
  }

  // 将来の予測データを取り除き、過去の人口データだけ抽出する。
  const pastPopulations = populations.map((e) => {
    return {
      prefCode: e.prefCode,
      data: e.data.filter((yearAndValue) => yearAndValue.year <= 2020),
    };
  });
  return pastPopulations;
}
