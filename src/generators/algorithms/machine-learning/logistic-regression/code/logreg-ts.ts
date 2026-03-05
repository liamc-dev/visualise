export const LOGREG_TS =
` // Logistic Regression via Gradient Descent
 // Minimizes BCE: L = -(1/n) Σ[yᵢ·log(ŷᵢ) + (1-yᵢ)·log(1-ŷᵢ)]

 [[log.data]]function fit(X1: number[], X2: number[], Y: number[],
     lr: number, epochs: number) {[[/log.data]]
   [[log.init]]const n = X1.length;
   let w1 = 0, w2 = 0, b = 0;[[/log.init]]

   [[log.epoch]]for (let epoch = 0; epoch < epochs; epoch++) {[[/log.epoch]]

     [[log.predict]]const yHat = new Array<number>(n);
     for (let i = 0; i < n; i++) {
       [[log.predict.step]]const z = w1 * X1[i] + w2 * X2[i] + b;
       yHat[i] = 1 / (1 + Math.exp(-z));[[/log.predict.step]]
     }[[/log.predict]]

     [[log.loss]]let loss = 0;
     for (let i = 0; i < n; i++) {
       [[log.loss.step]]loss -= Y[i]*Math.log(yHat[i]) + (1-Y[i])*Math.log(1-yHat[i]);[[/log.loss.step]]
     }
     [[log.loss.avg]]loss /= n;[[/log.loss.avg]][[/log.loss]]

     [[log.grad]]let dw1 = 0, dw2 = 0, db = 0;
     for (let i = 0; i < n; i++) {
       [[log.grad.step]]const err = yHat[i] - Y[i];
       dw1 += err * X1[i];
       dw2 += err * X2[i];
       db  += err;[[/log.grad.step]]
     }
     [[log.grad.scale]]dw1 /= n;  dw2 /= n;  db /= n;[[/log.grad.scale]][[/log.grad]]

     [[log.update]]w1 -= lr * dw1;
     w2 -= lr * dw2;
     b  -= lr * db;[[/log.update]]
   }

   [[log.done]]return { w1, w2, b };[[/log.done]]
 }
`;

export const LOGREG_TS_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const LOGREG_TS_POINTER_LABELS = {} as const satisfies Record<string, string>;
