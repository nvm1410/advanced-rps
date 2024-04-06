import { Button, Grid, TextField } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinGame() {
  const [gameAddress, setGameAddress] = useState("");
  const navigate = useNavigate();
  return (
    <>
      <Grid item xs={12}>
        <TextField
          fullWidth
          component="div"
          label="Game Contract Address"
          value={gameAddress}
          onChange={(e) => setGameAddress(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          fullWidth
          variant="contained"
          disabled={!gameAddress}
          onClick={() => navigate(`/games/${gameAddress}`)}
        >
          Join Game
        </Button>
      </Grid>
    </>
  );
}

export default JoinGame;
