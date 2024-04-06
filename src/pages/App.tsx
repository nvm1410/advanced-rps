import { Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
function App() {
  const navigate = useNavigate();
  return (
    <>
      <Grid item xs={12}>
        <Button variant="contained" onClick={() => navigate("/new")} fullWidth>
          Start a new game
        </Button>
      </Grid>
      <Grid item xs={12} onClick={() => navigate("/join")}>
        <Button variant="outlined" fullWidth>
          Join an existing game
        </Button>
      </Grid>
    </>
  );
}

export default App;
