/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAccount } from "@metamask/sdk-react-ui";
import {
  Button,
  Dialog,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import { ErrorMessage, Form, Formik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Hasher from "../contracts/Hasher.json";
import RPS from "../contracts/RPS.json";
import { Move } from "../utils/constants";
import { generateSalt, parseErrorMessage } from "../utils/utils";

interface NewGameForm {
  amountToStake: string;
  address2ndPlayer: string;
  move1stPlayer: Move;
}

function NewGame() {
  const { isConnected } = useAccount();
  const [move1stPlayer, setMove1stPlayer] = useState<Move>();
  const [generatedSalt, setGeneratedSalt] = useState<string>();
  const [gameAddress, setGameAddress] = useState<string>();
  const [isShowDialog, setShowDialog] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState("");
  const navigate = useNavigate();
  if (!isConnected) {
    return (
      <Grid item xs={12}>
        <Typography>Connect to your wallet to start</Typography>
      </Grid>
    );
  }
  const handleStart = async (values: NewGameForm) => {
    const { amountToStake, move1stPlayer, address2ndPlayer } = values;
    if (window.ethereum == null) {
      toast.error("MetaMask not installed!");
      return;
    }
    if (!ethers.isAddress(address2ndPlayer)) {
      toast.error("Invalid Address!");
      return;
    }
    try {
      setLoadingProgress("Getting signer");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // deploy hasher contract
      const hasherFactory = new ethers.ContractFactory(
        Hasher.abi,
        Hasher.bytecode,
        signer
      );
      setLoadingProgress("Deploying hasher contract");
      const hasherContract = (await hasherFactory.deploy()) as ethers.Contract;
      await hasherContract.waitForDeployment();
      // await hasherContract.deploymentTransaction()?.wait(2);

      // generate salt
      const generatedSalt = generateSalt();

      setLoadingProgress("Hashing player 1 move");
      // deploy rps contract
      const moveHash = await hasherContract.hash(
        move1stPlayer.toString(),
        generatedSalt.toString()
      );
      const rpsFactory = new ethers.ContractFactory(
        RPS.abi,
        RPS.bytecode,
        signer
      );
      setLoadingProgress("Deploying RPS contract");
      const rpsContract = await rpsFactory.deploy(moveHash, address2ndPlayer, {
        value: ethers.parseEther(amountToStake),
      });

      await rpsContract.waitForDeployment();
      setLoadingProgress("Getting RPS contract address");
      const rpsContractAddress = await rpsContract.getAddress();
      // save info of this game to local storage

      setMove1stPlayer(move1stPlayer);
      setGeneratedSalt(generatedSalt.toString());
      setGameAddress(rpsContractAddress);

      setShowDialog(true);
    } catch (e: any) {
      const message = parseErrorMessage(e);
      toast.error(message);
    }
    setLoadingProgress("");
  };
  return (
    <>
      <Dialog open={isShowDialog || !!loadingProgress} maxWidth="md">
        {loadingProgress ? (
          <Grid container spacing={2} padding={3}>
            <Grid item xs={12}>
              <Typography>{loadingProgress}...</Typography>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={4} padding={2}>
            <Grid item xs={12}>
              <Typography fontWeight="bold">
                Save these information. They are important to resolve the game.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                Your Move:{" "}
                <span
                  style={{
                    background: "#777",
                    padding: "4px 8px",
                    color: "white",
                    borderRadius: "8px",
                  }}
                >
                  {Move[move1stPlayer ?? 0]}
                </span>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                Game Salt:{" "}
                <span
                  style={{
                    background: "#777",
                    padding: "4px 8px",
                    color: "white",
                    borderRadius: "8px",
                  }}
                >
                  {generatedSalt}
                </span>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                Game Address:{" "}
                <span
                  style={{
                    background: "#777",
                    padding: "4px 8px",
                    color: "white",
                    borderRadius: "8px",
                  }}
                >
                  {gameAddress}
                </span>
              </Typography>
              <Typography variant="body2">
                *Send this address to your friend to have them play with you
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                onClick={() => navigate(`/games/${gameAddress}`)}
                variant="contained"
              >
                To Game Zone
              </Button>
            </Grid>
          </Grid>
        )}
      </Dialog>
      <Grid item xs={12}>
        <Typography variant="h6">Start a new game</Typography>
      </Grid>
      <Grid item xs={12}>
        <Formik<NewGameForm>
          initialValues={{
            amountToStake: "",
            address2ndPlayer: "",
            move1stPlayer: Move.Null,
          }}
          validationSchema={Yup.object().shape({
            amountToStake: Yup.number().moreThan(0).required("Required"),
            address2ndPlayer: Yup.string().required("Required"),
            move1stPlayer: Yup.number().min(1, "Required"),
          })}
          onSubmit={handleStart}
        >
          {({ getFieldProps, isSubmitting, setFieldValue, values }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    component="div"
                    label="Amount To Stake (In ETH)"
                    {...getFieldProps("amountToStake")}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9.]/g, "")
                        .replace(/(\..*?)\..*/g, "$1")
                        .replace(/^0[^.]/, "0");
                      setFieldValue("amountToStake", value);
                    }}
                  />
                  <ErrorMessage
                    name="amountToStake"
                    component="div"
                    className="error-message"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    component="div"
                    label="Address of 2nd player"
                    {...getFieldProps("address2ndPlayer")}
                  />
                  <ErrorMessage
                    name="address2ndPlayer"
                    component="div"
                    className="error-message"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="move-select">Your move</InputLabel>
                    <Select
                      id="move-select"
                      fullWidth
                      label="Your move"
                      {...getFieldProps("move1stPlayer")}
                      value={
                        values.move1stPlayer === Move.Null
                          ? ""
                          : values.move1stPlayer
                      }
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
                  <ErrorMessage
                    name="move1stPlayer"
                    component="div"
                    className="error-message"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    type="submit"
                    disabled={isSubmitting}
                    variant="contained"
                  >
                    Start
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Grid>
    </>
  );
}

export default NewGame;
