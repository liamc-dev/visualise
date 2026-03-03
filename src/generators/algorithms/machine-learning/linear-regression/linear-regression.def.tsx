import type { AlgorithmDef } from "../../registry";
import { LINREG_BUNDLE } from "./code/linreg.bundle";
import { LINREG_NARRATION } from "./linreg.narration";
import { linearRegressionTrace } from "./linreg-trace";

const def: AlgorithmDef = {
  label: "Linear Regression",
  category: "Machine Learning",
  trace: linearRegressionTrace,
  description: (
    <>
      <strong>Linear Regression</strong> fits a line y&nbsp;=&nbsp;mx&nbsp;+&nbsp;b
      to data by minimising the mean squared error via{" "}
      <strong>gradient descent</strong>. Each epoch computes predictions,
      gradients, and updates the slope and intercept. Time per epoch
      is <strong>O(n)</strong> over the training set.
    </>
  ),
  bullets: [
    "Fits a straight line through scatter data",
    "Gradient descent: iteratively reduces MSE loss",
    "Learning rate controls step size each epoch",
    "Converges to the least-squares solution",
  ],
  codeBundle: LINREG_BUNDLE,
  narrationBundle: LINREG_NARRATION,
};

export default def;
