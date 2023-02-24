import os
import unittest
from uuid import uuid4

from get_ranking import Player, Ranking


class PlayerTest(unittest.TestCase):
    def test_add_score(self) -> None:
        # スコアは正の整数しか受け付けない。
        player = Player(id="foo")
        with self.assertRaises(AssertionError):
            player.add_score(-1)
        with self.assertRaises(AssertionError):
            player.add_score(0)

    def test_mean_score(self) -> None:
        player = Player(id="foo")
        player.add_score(1)
        player.add_score(3)
        self.assertEqual(player.get_mean_score(), 2)

    def test_mean_score_quantize(self) -> None:
        # 平均スコアは四捨五入して整数に丸める。
        player = Player(id="foo")
        player.add_score(1)
        player.add_score(2)
        self.assertEqual(player.get_mean_score(), 2)

        player = Player(id="foo")
        player.add_score(1)
        player.add_score(1)
        player.add_score(2)
        self.assertEqual(player.get_mean_score(), 1)

        player = Player(id="foo")
        player.add_score(1)
        player.add_score(2)
        player.add_score(2)
        self.assertEqual(player.get_mean_score(), 2)

    def test_create(self) -> None:
        # player_idが同じ場合は同一のプレイヤー。
        path = f"{uuid4()}.csv"
        with open(path, mode="w") as f:
            f.write("create_timestamp,player_id,score\n")
            f.write("2021/01/01 12:00,player0001,12345\n")
            f.write("2021/01/01 12:00,player0001,12345\n")

        players = Player.create_players_from_log(path=path)
        expect_player = Player(id="player0001")
        expect_player.add_score(12345)
        expect_player.add_score(12345)
        self.assertEqual(players, [expect_player])

        os.remove(path)

    def test_create_invalid_log(self) -> None:
        # スコアは正の整数。
        path = f"{uuid4()}.csv"
        with open(path, mode="w") as f:
            f.write("create_timestamp,player_id,score\n")
            f.write("2021/01/01 12:00,player0001,abc\n")

        with self.assertRaises(ValueError):
            Player.create_players_from_log(path=path)

        os.remove(path)

    def test_create_empty_log(self) -> None:
        # ログが空の場合は空のリストを返す。
        path = f"{uuid4()}.csv"
        with open(path, mode="w") as f:
            pass
        players = Player.create_players_from_log(path=path)
        self.assertEqual(players, [])
        os.remove(path)

        path = f"{uuid4()}.csv"
        with open(path, mode="w") as f:
            f.write("create_timestamp,player_id,score\n")
        players = Player.create_players_from_log(path=path)
        self.assertEqual(players, [])
        os.remove(path)


class RankingTest(unittest.TestCase):
    def test_constructor(self) -> None:
        # IDが重複しているとエラーを出す。
        with self.assertRaises(AssertionError):
            Ranking(players=[Player(id="1"), Player(id="1")], min_player_number=1)

    def test_get_max_score(self) -> None:
        # プレイヤーリストからスコアの最大値と対応するインデックスを返す。
        player1 = Player(id="1")
        player2 = Player(id="2")
        player1.add_score(1)
        player2.add_score(2)

        self.assertEqual(Ranking.get_max_score(players=[player1, player2]), (1, 2))

    def test_get_max_score_tie(self) -> None:
        # 最大スコアが複数ある場合はどれかひとつを返す。
        player1 = Player(id="1")
        player2 = Player(id="2")
        player1.add_score(1)
        player2.add_score(1)

        self.assertEqual(Ranking.get_max_score(players=[player1, player2]), (0, 1))

    def test_to_csv_str(self) -> None:
        player1 = Player(id="1")
        player2 = Player(id="2")
        player3 = Player(id="3")
        player1.add_score(1)
        player2.add_score(4)
        player3.add_score(3)

        # プレイヤー数 > 出力数
        csv_str = "rank,player_id,mean_score\n"
        csv_str += "1,2,4\n"
        csv_str += "2,3,3\n"
        self.assertEqual(
            Ranking(
                players=[player1, player2, player3], min_player_number=2
            ).to_csv_string(),
            csv_str,
        )

        # プレイヤー数 = 出力数 or プレイヤー数 < 出力数
        csv_str = "rank,player_id,mean_score\n"
        csv_str += "1,2,4\n"
        csv_str += "2,3,3\n"
        csv_str += "3,1,1\n"
        self.assertEqual(
            Ranking(
                players=[player1, player2, player3], min_player_number=3
            ).to_csv_string(),
            csv_str,
        )
        self.assertEqual(
            Ranking(
                players=[player1, player2, player3], min_player_number=4
            ).to_csv_string(),
            csv_str,
        )

    def test_to_csv_str_tie(self) -> None:
        # 同順のランクの人がいる場合
        player1 = Player(id="1")
        player2 = Player(id="2")
        player3 = Player(id="3")
        player1.add_score(1)
        player2.add_score(4)
        player3.add_score(4)

        # プレイヤー数 = 出力数 or プレイヤー数 < 出力数
        csv_str = "rank,player_id,mean_score\n"
        csv_str += "1,2,4\n"
        csv_str += "1,3,4\n"
        csv_str += "3,1,1\n"
        self.assertEqual(
            Ranking(
                players=[player1, player2, player3], min_player_number=3
            ).to_csv_string(),
            csv_str,
        )
        self.assertEqual(
            Ranking(
                players=[player1, player2, player3], min_player_number=4
            ).to_csv_string(),
            csv_str,
        )

        # プレイヤー数 > 出力数
        # 同順のランクの人がいる場合は指定の出力数を超えて出力することがある。
        csv_str = "rank,player_id,mean_score\n"
        csv_str += "1,2,4\n"
        csv_str += "1,3,4\n"
        self.assertEqual(
            Ranking(
                players=[player1, player2, player3], min_player_number=1
            ).to_csv_string(),
            csv_str,
        )
        self.assertEqual(
            Ranking(
                players=[player1, player2, player3], min_player_number=2
            ).to_csv_string(),
            csv_str,
        )


if __name__ == "__main__":
    unittest.main()
