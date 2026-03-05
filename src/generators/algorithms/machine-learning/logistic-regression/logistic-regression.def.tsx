import type { AlgorithmDef } from "../../registry";
import { LOGREG_BUNDLE } from "./code/logreg.bundle";
import { LOGREG_NARRATION } from "./logreg.narration";
import { logisticRegressionTrace } from "./logreg-trace";

const def: AlgorithmDef = {
  label: "Logistic Regression",
  category: "Machine Learning",
  trace: logisticRegressionTrace,
  description: (
    <>
      <strong>Logistic Regression</strong> fits a decision boundary for binary
      classification using the <strong>sigmoid function</strong>&nbsp;
      &sigma;(z)&nbsp;=&nbsp;1/(1+e<sup>&minus;z</sup>). Training minimises{" "}
      <strong>binary cross-entropy</strong> loss via gradient descent.
      Time per epoch is <strong>O(n)</strong> over the training set.
    </>
  ),
  bullets: [
    "Binary classification: predicts probability of class 1",
    "Sigmoid function maps linear output to [0, 1]",
    "Binary cross-entropy measures prediction quality",
    "Decision boundary: line where P(class 1) = 0.5",
  ],
  codeBundle: LOGREG_BUNDLE,
  narrationBundle: LOGREG_NARRATION,
};

export default def;
