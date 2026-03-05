export const LOGREG_CPP =
` #include <vector>
 #include <cmath>
 using std::vector;

 // Logistic Regression via Gradient Descent
 // Minimizes BCE: L = -(1/n) Σ[yᵢ·log(ŷᵢ) + (1-yᵢ)·log(1-ŷᵢ)]

 struct Weights { double w1, w2, b; };

 [[log.data]]Weights fit(const vector<double>& X1, const vector<double>& X2,
     const vector<double>& Y, double lr, int epochs) {[[/log.data]]
   [[log.init]]int n = X1.size();
   double w1 = 0, w2 = 0, b = 0;[[/log.init]]

   [[log.epoch]]for (int epoch = 0; epoch < epochs; epoch++) {[[/log.epoch]]

     [[log.predict]]vector<double> yHat(n);
     for (int i = 0; i < n; i++) {
       [[log.predict.step]]double z = w1 * X1[i] + w2 * X2[i] + b;
       yHat[i] = 1.0 / (1.0 + exp(-z));[[/log.predict.step]]
     }[[/log.predict]]

     [[log.loss]]double loss = 0;
     for (int i = 0; i < n; i++) {
       [[log.loss.step]]loss -= Y[i]*log(yHat[i]) + (1-Y[i])*log(1-yHat[i]);[[/log.loss.step]]
     }
     [[log.loss.avg]]loss /= n;[[/log.loss.avg]][[/log.loss]]

     [[log.grad]]double dw1 = 0, dw2 = 0, db = 0;
     for (int i = 0; i < n; i++) {
       [[log.grad.step]]double err = yHat[i] - Y[i];
       dw1 += err * X1[i];
       dw2 += err * X2[i];
       db  += err;[[/log.grad.step]]
     }
     [[log.grad.scale]]dw1 /= n;  dw2 /= n;  db /= n;[[/log.grad.scale]][[/log.grad]]

     [[log.update]]w1 -= lr * dw1;
     w2 -= lr * dw2;
     b  -= lr * db;[[/log.update]]
   }

   [[log.done]]return {w1, w2, b};[[/log.done]]
 }
`;

export const LOGREG_CPP_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const LOGREG_CPP_POINTER_LABELS = {} as const satisfies Record<string, string>;
