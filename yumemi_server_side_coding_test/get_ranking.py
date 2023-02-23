import csv
import sys
from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal


@dataclass
class Player:
    __id: str
    __total_score: int
    __play_number: int

    def __init__(self, id: str) -> None:
        self.__id = id
        self.__total_score = 0
        self.__play_number = 0

    def get_id(self) -> str:
        return self.__id

    def add_score(self, score: int) -> None:
        # スコアは正の整数
        assert score > 0
        self.__total_score += score
        self.__play_number += 1

    def get_mean_score(self) -> int:
        # 平均スコアは四捨五入で整数で丸める。
        # round()は四捨五入で丸めないので使用しない。
        float_score = float(self.__total_score) / self.__play_number
        quantized_score = Decimal(str(float_score)).quantize(
            Decimal("1"), ROUND_HALF_UP
        )
        return int(quantized_score)

    @staticmethod
    def create_players_from_log(path: str) -> list["Player"]:
        # プレイログは数千万行以上に肥大化することがあるので、メモリ使用量を少なくするため1行ずつ読み込む。
        # pandas.read_csvは一括で読み込むため、メモリ不足になるかもしれないので、使わない。
        player_dict: dict[str, Player] = {}  # {player_id: Player}
        with open(path, mode="r", newline="") as f:
            reader = csv.reader(f)
            for i, line in enumerate(reader):
                if i == 0:
                    continue

                player_id = line[1]
                score = int(line[2])

                player_dict.setdefault(
                    player_id,
                    Player(id=player_id),
                )

                player = player_dict[player_id]
                player.add_score(score)

        return list(player_dict.values())


@dataclass
class Ranking:
    __ranking: list[tuple[int, Player]]  # list[(rank, player)]

    def __init__(self, players: list[Player], min_player_number: int) -> None:
        # IDの重複がないか確認
        ids = set([p.get_id() for p in players])
        assert len(ids) == len(players)

        ranking: list[tuple[int, Player]] = []
        _, pre_max_score = self.get_max_score(players=players)
        pre_rank = 1

        for _ in range(len(players)):
            max_index, max_score = self.get_max_score(players=players)
            player = players.pop(max_index)

            # 同点の平均スコアのプレイヤーが居た場合、rankingの数字は同じ数字を割り当てる
            if max_score != pre_max_score:
                # 同点の平均スコアのプレイヤーが居た場合において、10名以上のランキングを作る
                if len(ranking) >= min_player_number:
                    break
                rank = len(ranking) + 1
            else:
                rank = pre_rank

            ranking.append((rank, player))
            pre_max_score = max_score
            pre_rank = rank

        self.__ranking = ranking

    def to_csv_string(self) -> str:
        csv_str = ",".join(["rank", "player_id", "mean_score"]) + "\n"
        for rank, player in self.__ranking:
            csv_str += (
                ",".join(
                    [str(rank), str(player.get_id()), str(player.get_mean_score())]
                )
                + "\n"
            )

        return csv_str

    @staticmethod
    def get_max_score(players: list[Player]) -> tuple[int, int]:
        scores = [player.get_mean_score() for player in players]
        max_score = max(scores)
        max_index = scores.index(max_score)
        return max_index, max_score


if __name__ == "__main__":
    log_path = sys.argv[1]

    players = Player.create_players_from_log(path=log_path)
    ranking = Ranking(players=players, min_player_number=10)

    csv_str = ranking.to_csv_string()
    print(csv_str, end="")
