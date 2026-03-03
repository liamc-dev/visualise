export const LINREG_JAVA =
` // Linear Regression via Gradient Descent
 // Minimizes MSE: L = (1/n) Σ(yᵢ - ŷᵢ)²

 public class LinearRegression {
   [[reg.data]]static double[] fit(double[] X, double[] Y,
       double lr, int epochs) {[[/reg.data]]
     [[reg.init]]int n = X.length;
     double m = 0, b = 0;[[/reg.init]]

     [[reg.epoch]]for (int epoch = 0; epoch < epochs; epoch++) {[[/reg.epoch]]

       [[reg.predict]]double[] yHat = new double[n];
       for (int i = 0; i < n; i++) {
         [[reg.predict.step]]yHat[i] = m * X[i] + b;[[/reg.predict.step]]
       }[[/reg.predict]]

       [[reg.loss]]double loss = 0;
       for (int i = 0; i < n; i++) {
         [[reg.loss.step]]loss += Math.pow(Y[i] - yHat[i], 2);[[/reg.loss.step]]
       }
       [[reg.loss.avg]]loss /= n;[[/reg.loss.avg]][[/reg.loss]]

       [[reg.grad]]double dm = 0, db = 0;
       for (int i = 0; i < n; i++) {
         [[reg.grad.step]]dm += X[i] * (Y[i] - yHat[i]);
         db += (Y[i] - yHat[i]);[[/reg.grad.step]]
       }
       [[reg.grad.scale]]dm *= -2.0 / n;  db *= -2.0 / n;[[/reg.grad.scale]][[/reg.grad]]

       [[reg.update]]m -= lr * dm;
       b -= lr * db;[[/reg.update]]
     }

     [[reg.done]]return new double[]{m, b};[[/reg.done]]
   }
 }
`;

export const LINREG_JAVA_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const LINREG_JAVA_POINTER_LABELS = {} as const satisfies Record<string, string>;
