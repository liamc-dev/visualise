export const LINREG_JS =
` // Linear Regression via Gradient Descent
 // Minimizes MSE: L = (1/n) Σ(yᵢ - ŷᵢ)²

 [[reg.data]]function fit(X, Y, lr, epochs) {[[/reg.data]]
   [[reg.init]]const n = X.length;
   let m = 0, b = 0;[[/reg.init]]

   [[reg.epoch]]for (let epoch = 0; epoch < epochs; epoch++) {[[/reg.epoch]]

     [[reg.predict]]const yHat = new Array(n);
     for (let i = 0; i < n; i++) {
       [[reg.predict.step]]yHat[i] = m * X[i] + b;[[/reg.predict.step]]
     }[[/reg.predict]]

     [[reg.loss]]let loss = 0;
     for (let i = 0; i < n; i++) {
       [[reg.loss.step]]loss += (Y[i] - yHat[i]) ** 2;[[/reg.loss.step]]
     }
     [[reg.loss.avg]]loss /= n;[[/reg.loss.avg]][[/reg.loss]]

     [[reg.grad]]let dm = 0, db = 0;
     for (let i = 0; i < n; i++) {
       [[reg.grad.step]]dm += X[i] * (Y[i] - yHat[i]);
       db += (Y[i] - yHat[i]);[[/reg.grad.step]]
     }
     [[reg.grad.scale]]dm *= -2 / n;
     db *= -2 / n;[[/reg.grad.scale]][[/reg.grad]]

     [[reg.update]]m -= lr * dm;
     b -= lr * db;[[/reg.update]]
   }

   [[reg.done]]return { m, b };[[/reg.done]]
 }
`;

export const LINREG_JS_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const LINREG_JS_POINTER_LABELS = {} as const satisfies Record<string, string>;
