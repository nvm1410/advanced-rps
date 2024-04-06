import { MetaMaskButton } from "@metamask/sdk-react-ui";
import { Grid, Link, Stack } from "@mui/material";

function Navbar() {
  return (
    <>
      <Grid item xs={12}>
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Link href="/" variant="h5" underline="none" color="inherit">
            Advanced RPS
          </Link>
          <MetaMaskButton theme={"light"} color="white"></MetaMaskButton>
        </Stack>
      </Grid>
    </>
  );
}

export default Navbar;
