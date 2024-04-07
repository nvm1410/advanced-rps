/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAccount } from "@metamask/sdk-react-ui";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import RPS from "../contracts/RPS.json";
import { Move } from "../utils/constants";
import { parseErrorMessage } from "../utils/utils";

const INTERVAL = 1000;
const TIMEOUT = 5; // minutes

function CurrentGame() {
  const { id: gameAddress } = useParams();
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  const playerAddress = address as string;
  const [player1Address, setPlayer1Address] = useState("");
  const [player2Address, setPlayer2Address] = useState("");
  const [contractInstance, setContractInstance] = useState<ethers.Contract>();
  const [gameTimeout, setGameTimeout] = useState(false);
  const [move2ndPlayer, setMove2ndPlayer] = useState<number>();
  const [move2ndPlayerLocal, setMove2ndPlayerLocal] = useState<number>();
  const [move1stPlayer, setMove1stPlayer] = useState<number>();
  const [generatedSalt, setGeneratedSalt] = useState<string>();
  const [isResolved, setResolved] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [timeoutTime, setTimeoutTime] = useState<number>();
  const [isWithdrawLoading, setWithdrawLoading] = useState(false);
  const compareAddress = (a1: string, a2: string) => {
    if (!a1 || !a2) return false;
    return a1.toLowerCase() === a2.toLowerCase();
  };
  const getCurrentGameMetadata = async () => {
    if (!gameAddress || !playerAddress || !ethers.isAddress(gameAddress))
      return;
    if (window.ethereum == null) {
      toast.error("MetaMask not installed!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const rpsContract = new ethers.Contract(gameAddress, RPS.abi, signer);
      setContractInstance(rpsContract);
      const player1Address = await rpsContract.j1();
      const player2Address = await rpsContract.j2();
      setPlayer1Address(player1Address);
      setPlayer2Address(player2Address);
    } catch (e: any) {
      const message = parseErrorMessage(e);
      toast.error(message);
    }
  };

  const checkPlayer2Move = async () => {
    if (!contractInstance) {
      return 0;
    }
    try {
      const move2ndPlayer = await contractInstance.c2();
      return Number(move2ndPlayer);
    } catch (e: any) {
      const message = parseErrorMessage(e);
      toast.error(message);
      return 0;
    }
  };

  const checkGameTimeout = async () => {
    if (!contractInstance) {
      return false;
    }
    try {
      const lastAction = await contractInstance.lastAction();
      // last action return in seconds
      const timeoutTime =
        Number(lastAction) * 1000 + 1000 * 60 * TIMEOUT - Date.now();
      setTimeoutTime(timeoutTime);
      if (timeoutTime <= 0) {
        return true;
      }
    } catch (e: any) {
      const message = parseErrorMessage(e);
      toast.error(message);
    }
    return false;
  };

  const checkGameResolved = async () => {
    if (!contractInstance) {
      return false;
    }
    try {
      const stake = await contractInstance.stake();
      return Number(stake) === 0;
    } catch (e: any) {
      const message = parseErrorMessage(e);
      toast.error(message);
      return false;
    }
  };

  const player1Withdraw = async () => {
    if (!contractInstance) return;
    try {
      setWithdrawLoading(true);
      await contractInstance.j2Timeout();
    } catch (e: any) {
      setWithdrawLoading(false);
      const message = parseErrorMessage(e);
      toast.error(message);
    }
  };

  const player2Withdraw = async () => {
    if (!contractInstance) return;
    try {
      setWithdrawLoading(true);
      await contractInstance.j1Timeout();
    } catch (e: any) {
      setWithdrawLoading(false);
      const message = parseErrorMessage(e);
      toast.error(message);
    }
  };

  const resolve = async () => {
    if (!contractInstance || !gameAddress) {
      toast.error("Cannot find the current game");
      return;
    }
    try {
      setLoading(true);
      await contractInstance.solve(move1stPlayer, generatedSalt);
    } catch (e: any) {
      setLoading(false);
      if (["CALL_EXCEPTION", "INVALID_ARGUMENT"].includes(e.code)) {
        toast.error("You have inputted the wrong move or salt");
        return;
      }
      const message = parseErrorMessage(e);
      toast.error(message);
    }
  };

  const player2Play = async () => {
    if (!contractInstance) {
      toast.error("Cannot find the current game");
      return;
    }
    setLoading(true);

    try {
      const stake = await contractInstance.stake();
      await contractInstance.play(move2ndPlayerLocal, {
        value: stake.toString(),
      });
      const move2ndPlayer = await contractInstance.c2();
      setMove2ndPlayer(move2ndPlayer);
    } catch (e: any) {
      const message = parseErrorMessage(e);
      toast.error(message);
      setLoading(false);
    }
  };

  // render the game depends on game state: player 2 not play | player 2 played | timeout | resolved

  const gameResolvedRender = () => (
    <>
      <Grid item xs={12}>
        <Typography>
          The game has been resolved. Please check your wallet for changes.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Button fullWidth variant="contained" onClick={() => navigate("/")}>
          Play another game
        </Button>
      </Grid>
    </>
  );

  const playerRender = (player: "Player 1" | "Player 2") => {
    return (
      <Grid item xs={12}>
        <Typography>
          You are{" "}
          <Typography variant="h5" component="span">
            {player}
          </Typography>
        </Typography>
        {!gameTimeout && !isResolved && (
          <Grid item xs={12}>
            <Typography>
              {Math.floor((timeoutTime ?? 0) / 1000)} seconds until timeout
            </Typography>
          </Grid>
        )}
      </Grid>
    );
  };

  const timeoutRender = (player: "Player 1" | "Player 2") => {
    if (player === "Player 1") {
      // if timeout because player 2 not played
      if (!move2ndPlayer) {
        return (
          <>
            <Grid item xs={12}>
              <Typography>
                Player 2 failed to make a move before timeout.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                disabled={!gameTimeout || isWithdrawLoading}
                onClick={player1Withdraw}
              >
                Take your fund back
              </Button>
            </Grid>
          </>
        );
      }

      // if timeout because you not resolve the game
      return (
        <Grid item xs={12}>
          <Typography>
            You failed to resolve the game before timeout. Player 2 can withdraw
            now.
          </Typography>
        </Grid>
      );
    }
    if (!move2ndPlayer) {
      return (
        <Grid item xs={12}>
          <Typography>
            You failed to make a move before timeout. Player 1 can withdraw now.
          </Typography>
        </Grid>
      );
    }
    return (
      <>
        <Grid item xs={12}>
          <Typography>
            Player 1 failed to resolve the game before timeout.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            disabled={!gameTimeout || !move2ndPlayer || isWithdrawLoading}
            onClick={player2Withdraw}
          >
            Take your fund back
          </Button>
        </Grid>
      </>
    );
  };

  const player2PlayedRender = (player: "Player 1" | "Player 2") => {
    if (player === "Player 1") {
      return (
        <>
          <Grid item xs={12}>
            <Typography>
              Player 2 has played: {Move[move2ndPlayer ?? 0]}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              Input back your move and salt to resolve the game
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="move-select">Your move</InputLabel>
              <Select
                id="move-select"
                fullWidth
                label="Your move"
                value={move1stPlayer ?? ""}
                disabled={isLoading}
                onChange={(e) => setMove1stPlayer(Number(e.target.value))}
              >
                {Object.entries(Move)
                  .slice(7)
                  .map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {key}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              component="div"
              label="Generated Salt"
              value={generatedSalt ?? ""}
              disabled={isLoading}
              onChange={(e) => setGeneratedSalt(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={resolve}
                disabled={
                  !move2ndPlayer ||
                  !generatedSalt ||
                  !move1stPlayer ||
                  isLoading
                }
              >
                Resolve the game
              </Button>
            </Grid>
          </Grid>
        </>
      );
    }
    return (
      <>
        <Grid item xs={12}>
          <Typography>
            You have submitted a move: {Move[move2ndPlayer ?? 0]}
          </Typography>
        </Grid>
        {!isResolved && (
          <Grid item xs={12}>
            <Typography>Waiting for player 1 to resolve the game.</Typography>
          </Grid>
        )}
      </>
    );
  };

  const player2NotPlayedRender = (player: "Player 1" | "Player 2") => {
    if (player === "Player 1") {
      return (
        <Grid item xs={12}>
          <Typography>Waiting for player 2 to play...</Typography>
        </Grid>
      );
    }
    return (
      <>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="move-select">Your move</InputLabel>
            <Select
              id="move-select"
              fullWidth
              label="Your move"
              value={move2ndPlayerLocal ?? ""}
              onChange={(e) => setMove2ndPlayerLocal(Number(e.target.value))}
              disabled={isLoading}
            >
              {Object.entries(Move)
                .slice(7)
                .map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {key}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            disabled={!move2ndPlayerLocal || isLoading}
            onClick={player2Play}
          >
            Submit your move
          </Button>
        </Grid>
      </>
    );
  };

  const gameRender = (player: "Player 1" | "Player 2") => {
    return (
      <>
        {playerRender(player)}
        {isResolved && gameResolvedRender()}
        {!isResolved && (
          <>
            {move2ndPlayer
              ? player2PlayedRender(player)
              : player2NotPlayedRender(player)}

            {gameTimeout && timeoutRender(player)}
          </>
        )}
      </>
    );
  };

  useEffect(() => {
    getCurrentGameMetadata();
  }, [gameAddress, playerAddress]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const timeout = await checkGameTimeout();
      setGameTimeout(timeout);
    }, INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, [contractInstance]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const move2ndPlayer = await checkPlayer2Move();
      if (move2ndPlayer) {
        setMove2ndPlayer(move2ndPlayer);
        setLoading(false);
        clearInterval(interval);
      }
    }, INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, [contractInstance]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const gameResolved = await checkGameResolved();
      if (gameResolved) {
        setResolved(gameResolved);
        clearInterval(interval);
      }
    }, INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, [contractInstance]);

  if (!gameAddress) {
    return (
      <Grid item xs={12}>
        <Typography>Game address not found</Typography>
      </Grid>
    );
  }
  const isEligible =
    compareAddress(playerAddress, player1Address) ||
    compareAddress(playerAddress, player2Address);
  if (gameAddress && !ethers.isAddress(gameAddress)) {
    return (
      <Grid item xs={12}>
        <Typography>
          Invalid game address:{" "}
          <span style={{ color: "red" }}>{gameAddress}</span>
        </Typography>
      </Grid>
    );
  }
  return (
    <>
      <Grid item xs={12}>
        <Typography>Current game address: {gameAddress}</Typography>
      </Grid>
      {!isConnected && (
        <Grid item xs={12}>
          <Typography>Connect to your wallet to play this game</Typography>
        </Grid>
      )}
      {isConnected && (
        <>
          {!isEligible && (
            <Grid item xs={12}>
              <Typography>
                You are not eligible to play the current game. Try to change
                your account
              </Typography>
            </Grid>
          )}
          {compareAddress(playerAddress, player1Address) &&
            gameRender("Player 1")}

          {compareAddress(playerAddress, player2Address) &&
            gameRender("Player 2")}
        </>
      )}
    </>
  );
}

export default CurrentGame;
