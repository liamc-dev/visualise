export const LOGREG_PY =
` # Logistic Regression via Gradient Descent
 # Minimizes BCE: L = -(1/n) Σ[yᵢ·log(ŷᵢ) + (1-yᵢ)·log(1-ŷᵢ)]
 from math import exp, log

 [[log.data]]def fit(X1, X2, Y, lr, epochs):[[/log.data]]
     [[log.init]]n = len(X1)
     w1, w2, b = 0.0, 0.0, 0.0[[/log.init]]

     [[log.epoch]]for epoch in range(epochs):[[/log.epoch]]

       [[log.predict]]y_hat = [0.0] * n
       for i in range(n):
           [[log.predict.step]]z = w1 * X1[i] + w2 * X2[i] + b
           y_hat[i] = 1 / (1 + exp(-z))[[/log.predict.step]][[/log.predict]]

       [[log.loss]]loss = 0.0
       for i in range(n):
           [[log.loss.step]]loss -= Y[i]*log(y_hat[i]) + (1-Y[i])*log(1-y_hat[i])[[/log.loss.step]]
       [[log.loss.avg]]loss /= n[[/log.loss.avg]][[/log.loss]]

       [[log.grad]]dw1, dw2, db = 0.0, 0.0, 0.0
       for i in range(n):
           [[log.grad.step]]err = y_hat[i] - Y[i]
           dw1 += err * X1[i]
           dw2 += err * X2[i]
           db  += err[[/log.grad.step]]
       [[log.grad.scale]]dw1 /= n;  dw2 /= n;  db /= n[[/log.grad.scale]][[/log.grad]]

       [[log.update]]w1 -= lr * dw1
       w2 -= lr * dw2
       b  -= lr * db[[/log.update]]

     [[log.done]]return w1, w2, b[[/log.done]]
`;

export const LOGREG_PY_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const LOGREG_PY_POINTER_LABELS = {} as const satisfies Record<string, string>;
