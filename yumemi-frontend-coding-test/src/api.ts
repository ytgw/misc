import { API_KEY } from "./secret";

export interface PrefectureType {
  prefCode: number;
  prefName: string;
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
